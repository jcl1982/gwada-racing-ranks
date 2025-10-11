-- Add standing_type column to track which standings are saved
ALTER TABLE public.previous_standings 
ADD COLUMN standing_type text DEFAULT 'general';

ALTER TABLE public.race_results_archive 
ADD COLUMN standing_type text DEFAULT 'general';

-- Create index for faster queries by standing_type
CREATE INDEX idx_previous_standings_type ON public.previous_standings(championship_id, standing_type, saved_at);
CREATE INDEX idx_race_results_archive_type ON public.race_results_archive(championship_id, standing_type, saved_at);

-- Drop old functions
DROP FUNCTION IF EXISTS public.save_current_standings_as_previous(uuid, text);
DROP FUNCTION IF EXISTS public.get_standings_saves(uuid);
DROP FUNCTION IF EXISTS public.delete_standings_save(uuid, timestamp with time zone);
DROP FUNCTION IF EXISTS public.restore_standings_by_timestamp(uuid, timestamp with time zone);

-- New function to save standings for a specific type
CREATE OR REPLACE FUNCTION public.save_standings_by_type(
  p_championship_id uuid,
  p_standing_type text, -- 'general', 'montagne', 'rallye', 'c2r2'
  p_save_name text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  save_timestamp TIMESTAMP WITH TIME ZONE;
  final_save_name text;
  race_type text;
BEGIN
  save_timestamp := now();
  final_save_name := COALESCE(p_save_name, 'Sauvegarde ' || p_standing_type || ' du ' || to_char(save_timestamp, 'DD/MM/YYYY à HH24:MI'));

  -- Determine which race type to use based on standing type
  race_type := CASE 
    WHEN p_standing_type = 'montagne' THEN 'montagne'
    WHEN p_standing_type = 'rallye' THEN 'rallye'
    WHEN p_standing_type = 'c2r2' THEN NULL -- C2R2 uses both types
    ELSE NULL -- General uses both types
  END;

  -- Archive race results for the specific type
  IF p_standing_type IN ('montagne', 'rallye') THEN
    INSERT INTO public.race_results_archive (
      race_id, driver_id, position, points, dnf, time, car_model,
      championship_id, saved_at, save_name, standing_type
    )
    SELECT 
      rr.race_id, rr.driver_id, rr.position, rr.points, rr.dnf, rr.time, rr.car_model,
      r.championship_id, save_timestamp, final_save_name, p_standing_type
    FROM public.race_results rr
    JOIN public.races r ON rr.race_id = r.id
    WHERE r.championship_id = p_championship_id
      AND r.type = race_type;
  ELSIF p_standing_type = 'c2r2' THEN
    -- For C2R2, archive only results with C2R2 cars
    INSERT INTO public.race_results_archive (
      race_id, driver_id, position, points, dnf, time, car_model,
      championship_id, saved_at, save_name, standing_type
    )
    SELECT 
      rr.race_id, rr.driver_id, rr.position, rr.points, rr.dnf, rr.time, rr.car_model,
      r.championship_id, save_timestamp, final_save_name, p_standing_type
    FROM public.race_results rr
    JOIN public.races r ON rr.race_id = r.id
    WHERE r.championship_id = p_championship_id
      AND rr.car_model ILIKE '%C2%R2%';
  ELSE
    -- For general, archive all results
    INSERT INTO public.race_results_archive (
      race_id, driver_id, position, points, dnf, time, car_model,
      championship_id, saved_at, save_name, standing_type
    )
    SELECT 
      rr.race_id, rr.driver_id, rr.position, rr.points, rr.dnf, rr.time, rr.car_model,
      r.championship_id, save_timestamp, final_save_name, p_standing_type
    FROM public.race_results rr
    JOIN public.races r ON rr.race_id = r.id
    WHERE r.championship_id = p_championship_id;
  END IF;

  -- Save standings for the specific type
  INSERT INTO public.previous_standings (
    driver_id, position, general_position, montagne_position, rallye_position, c2r2_position,
    montagne_points, rallye_points, total_points,
    championship_id, saved_at, save_name, standing_type
  )
  WITH current_points AS (
    SELECT 
      d.id as driver_id,
      d.name as driver_name,
      COALESCE(montagne.points, 0) as montagne_points,
      COALESCE(rallye.points, 0) as rallye_points,
      (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) as total_points,
      COALESCE(c2r2_montagne.points, 0) + COALESCE(c2r2_rallye.points, 0) as c2r2_points
    FROM public.drivers d
    LEFT JOIN (
      SELECT rr.driver_id, SUM(rr.points) as points
      FROM public.race_results rr
      JOIN public.races r ON rr.race_id = r.id
      WHERE r.type = 'montagne' AND r.championship_id = p_championship_id
      GROUP BY rr.driver_id
    ) montagne ON d.id = montagne.driver_id
    LEFT JOIN (
      SELECT rr.driver_id, SUM(rr.points) as points
      FROM public.race_results rr
      JOIN public.races r ON rr.race_id = r.id
      WHERE r.type = 'rallye' AND r.championship_id = p_championship_id
      GROUP BY rr.driver_id
    ) rallye ON d.id = rallye.driver_id
    LEFT JOIN (
      SELECT rr.driver_id, SUM(rr.points) as points
      FROM public.race_results rr
      JOIN public.races r ON rr.race_id = r.id
      WHERE r.type = 'montagne' AND r.championship_id = p_championship_id AND rr.car_model ILIKE '%C2%R2%'
      GROUP BY rr.driver_id
    ) c2r2_montagne ON d.id = c2r2_montagne.driver_id
    LEFT JOIN (
      SELECT rr.driver_id, SUM(rr.points) as points
      FROM public.race_results rr
      JOIN public.races r ON rr.race_id = r.id
      WHERE r.type = 'rallye' AND r.championship_id = p_championship_id AND rr.car_model ILIKE '%C2%R2%'
      GROUP BY rr.driver_id
    ) c2r2_rallye ON d.id = c2r2_rallye.driver_id
    WHERE d.championship_id = p_championship_id
  ),
  new_positions AS (
    SELECT 
      driver_id, montagne_points, rallye_points, total_points, c2r2_points, driver_name,
      CASE WHEN total_points > 0 THEN ROW_NUMBER() OVER (ORDER BY total_points DESC, driver_name ASC) END as general_position,
      CASE WHEN montagne_points > 0 THEN ROW_NUMBER() OVER (ORDER BY montagne_points DESC, driver_name ASC) END as montagne_position,
      CASE WHEN rallye_points > 0 THEN ROW_NUMBER() OVER (ORDER BY rallye_points DESC, driver_name ASC) END as rallye_position,
      CASE WHEN c2r2_points > 0 THEN ROW_NUMBER() OVER (ORDER BY c2r2_points DESC, driver_name ASC) END as c2r2_position
    FROM current_points
    WHERE CASE 
      WHEN p_standing_type = 'general' THEN total_points > 0
      WHEN p_standing_type = 'montagne' THEN montagne_points > 0
      WHEN p_standing_type = 'rallye' THEN rallye_points > 0
      WHEN p_standing_type = 'c2r2' THEN c2r2_points > 0
      ELSE FALSE
    END
  )
  SELECT 
    driver_id,
    CASE p_standing_type
      WHEN 'general' THEN general_position
      WHEN 'montagne' THEN montagne_position
      WHEN 'rallye' THEN rallye_position
      WHEN 'c2r2' THEN c2r2_position
    END as position,
    general_position, montagne_position, rallye_position, c2r2_position,
    montagne_points, rallye_points, total_points,
    p_championship_id, save_timestamp, final_save_name, p_standing_type
  FROM new_positions;
  
  RAISE NOTICE 'Classement % sauvegardé pour le championnat %', p_standing_type, p_championship_id;
END;
$$;

-- New function to get saves by type
CREATE OR REPLACE FUNCTION public.get_standings_saves_by_type(
  p_championship_id uuid,
  p_standing_type text DEFAULT NULL
)
RETURNS TABLE(saved_at timestamp with time zone, save_name text, standing_type text, drivers_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ps.saved_at,
    ps.save_name,
    ps.standing_type,
    COUNT(*) as drivers_count
  FROM public.previous_standings ps
  WHERE ps.championship_id = p_championship_id
    AND (p_standing_type IS NULL OR ps.standing_type = p_standing_type)
  GROUP BY ps.saved_at, ps.save_name, ps.standing_type
  ORDER BY ps.saved_at DESC;
$$;

-- New function to restore standings by type
CREATE OR REPLACE FUNCTION public.restore_standings_by_type(
  p_championship_id uuid,
  p_saved_at timestamp with time zone,
  p_standing_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  standings_count INTEGER;
  results_count INTEGER;
  previous_save_timestamp TIMESTAMP WITH TIME ZONE;
  race_type text;
BEGIN
  -- Check if save exists
  SELECT COUNT(*) INTO standings_count 
  FROM public.previous_standings 
  WHERE championship_id = p_championship_id
    AND saved_at = p_saved_at
    AND standing_type = p_standing_type;
  
  IF standings_count = 0 THEN
    RAISE EXCEPTION 'Aucun classement % trouvé pour cette date', p_standing_type;
  END IF;

  -- Find previous save for this type
  SELECT MAX(saved_at) INTO previous_save_timestamp
  FROM public.previous_standings
  WHERE championship_id = p_championship_id
    AND saved_at < p_saved_at
    AND standing_type = p_standing_type;

  -- Determine race type
  race_type := CASE 
    WHEN p_standing_type = 'montagne' THEN 'montagne'
    WHEN p_standing_type = 'rallye' THEN 'rallye'
    ELSE NULL
  END;

  -- Check archived results
  SELECT COUNT(*) INTO results_count
  FROM public.race_results_archive
  WHERE championship_id = p_championship_id
    AND saved_at = p_saved_at
    AND standing_type = p_standing_type;
  
  -- Delete current results for this type only
  IF p_standing_type IN ('montagne', 'rallye') THEN
    DELETE FROM public.race_results rr
    USING public.races r
    WHERE rr.race_id = r.id 
      AND r.championship_id = p_championship_id
      AND r.type = race_type;
  ELSIF p_standing_type = 'c2r2' THEN
    DELETE FROM public.race_results rr
    USING public.races r
    WHERE rr.race_id = r.id 
      AND r.championship_id = p_championship_id
      AND rr.car_model ILIKE '%C2%R2%';
  ELSE
    -- General: delete all
    DELETE FROM public.race_results rr
    USING public.races r
    WHERE rr.race_id = r.id 
      AND r.championship_id = p_championship_id;
  END IF;
  
  -- Restore archived results
  IF results_count > 0 THEN
    INSERT INTO public.race_results (race_id, driver_id, position, points, dnf, time, car_model)
    SELECT race_id, driver_id, position, points, dnf, time, car_model
    FROM public.race_results_archive
    WHERE championship_id = p_championship_id
      AND saved_at = p_saved_at
      AND standing_type = p_standing_type;
  END IF;

  -- Delete future saves for this type
  DELETE FROM public.previous_standings
  WHERE championship_id = p_championship_id
    AND saved_at > p_saved_at
    AND standing_type = p_standing_type;

  RAISE NOTICE 'Classement % restauré depuis %', p_standing_type, p_saved_at;
END;
$$;

-- New function to delete save by type
CREATE OR REPLACE FUNCTION public.delete_standings_save_by_type(
  p_championship_id uuid,
  p_saved_at timestamp with time zone,
  p_standing_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.race_results_archive
  WHERE championship_id = p_championship_id
    AND saved_at = p_saved_at
    AND standing_type = p_standing_type;

  DELETE FROM public.previous_standings
  WHERE championship_id = p_championship_id
    AND saved_at = p_saved_at
    AND standing_type = p_standing_type;
  
  RAISE NOTICE 'Sauvegarde % supprimée pour %', p_standing_type, p_saved_at;
END;
$$;