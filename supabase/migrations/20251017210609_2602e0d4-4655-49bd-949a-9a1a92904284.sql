-- Renommer la colonne c2r2_position en r2_position dans previous_standings
ALTER TABLE public.previous_standings 
RENAME COLUMN c2r2_position TO r2_position;

-- Mettre à jour toutes les valeurs 'c2r2' en 'r2' dans standing_type
UPDATE public.previous_standings 
SET standing_type = 'r2' 
WHERE standing_type = 'c2r2';

UPDATE public.race_results_archive 
SET standing_type = 'r2' 
WHERE standing_type = 'r2r2';

-- Recréer la fonction save_standings_by_type avec 'r2' au lieu de 'c2r2'
CREATE OR REPLACE FUNCTION public.save_standings_by_type(p_championship_id uuid, p_standing_type text, p_save_name text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    WHEN p_standing_type = 'r2' THEN NULL -- R2 uses both types
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
  ELSIF p_standing_type = 'r2' THEN
    -- For R2, archive only results with C2 R2 cars
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

  -- Save standings ONLY for the specific type (independent saves)
  IF p_standing_type = 'montagne' THEN
    INSERT INTO public.previous_standings (
      driver_id, position, montagne_position, montagne_points,
      championship_id, saved_at, save_name, standing_type
    )
    SELECT 
      driver_id, montagne_position, montagne_position, montagne_points,
      p_championship_id, save_timestamp, final_save_name, p_standing_type
    FROM (
      SELECT 
        d.id as driver_id,
        d.name as driver_name,
        COALESCE(montagne.points, 0) as montagne_points,
        ROW_NUMBER() OVER (ORDER BY COALESCE(montagne.points, 0) DESC, d.name ASC) as montagne_position
      FROM public.drivers d
      LEFT JOIN (
        SELECT rr.driver_id, SUM(rr.points) as points
        FROM public.race_results rr
        JOIN public.races r ON rr.race_id = r.id
        WHERE r.type = 'montagne' AND r.championship_id = p_championship_id
        GROUP BY rr.driver_id
      ) montagne ON d.id = montagne.driver_id
      WHERE d.championship_id = p_championship_id
        AND COALESCE(montagne.points, 0) > 0
    ) standings;

  ELSIF p_standing_type = 'rallye' THEN
    INSERT INTO public.previous_standings (
      driver_id, position, rallye_position, rallye_points,
      championship_id, saved_at, save_name, standing_type
    )
    SELECT 
      driver_id, rallye_position, rallye_position, rallye_points,
      p_championship_id, save_timestamp, final_save_name, p_standing_type
    FROM (
      SELECT 
        d.id as driver_id,
        d.name as driver_name,
        COALESCE(rallye.points, 0) as rallye_points,
        ROW_NUMBER() OVER (ORDER BY COALESCE(rallye.points, 0) DESC, d.name ASC) as rallye_position
      FROM public.drivers d
      LEFT JOIN (
        SELECT rr.driver_id, SUM(rr.points) as points
        FROM public.race_results rr
        JOIN public.races r ON rr.race_id = r.id
        WHERE r.type = 'rallye' AND r.championship_id = p_championship_id
        GROUP BY rr.driver_id
      ) rallye ON d.id = rallye.driver_id
      WHERE d.championship_id = p_championship_id
        AND COALESCE(rallye.points, 0) > 0
    ) standings;

  ELSIF p_standing_type = 'r2' THEN
    INSERT INTO public.previous_standings (
      driver_id, position, r2_position,
      championship_id, saved_at, save_name, standing_type
    )
    SELECT 
      driver_id, r2_position, r2_position,
      p_championship_id, save_timestamp, final_save_name, p_standing_type
    FROM (
      SELECT 
        d.id as driver_id,
        d.name as driver_name,
        (COALESCE(r2_montagne.points, 0) + COALESCE(r2_rallye.points, 0)) as r2_points,
        ROW_NUMBER() OVER (ORDER BY (COALESCE(r2_montagne.points, 0) + COALESCE(r2_rallye.points, 0)) DESC, d.name ASC) as r2_position
      FROM public.drivers d
      LEFT JOIN (
        SELECT rr.driver_id, SUM(rr.points) as points
        FROM public.race_results rr
        JOIN public.races r ON rr.race_id = r.id
        WHERE r.type = 'montagne' AND r.championship_id = p_championship_id AND rr.car_model ILIKE '%C2%R2%'
        GROUP BY rr.driver_id
      ) r2_montagne ON d.id = r2_montagne.driver_id
      LEFT JOIN (
        SELECT rr.driver_id, SUM(rr.points) as points
        FROM public.race_results rr
        JOIN public.races r ON rr.race_id = r.id
        WHERE r.type = 'rallye' AND r.championship_id = p_championship_id AND rr.car_model ILIKE '%C2%R2%'
        GROUP BY rr.driver_id
      ) r2_rallye ON d.id = r2_rallye.driver_id
      WHERE d.championship_id = p_championship_id
        AND (COALESCE(r2_montagne.points, 0) + COALESCE(r2_rallye.points, 0)) > 0
    ) standings;

  ELSE
    INSERT INTO public.previous_standings (
      driver_id, position, general_position, total_points, montagne_points, rallye_points,
      championship_id, saved_at, save_name, standing_type
    )
    SELECT 
      driver_id, general_position, general_position, total_points, montagne_points, rallye_points,
      p_championship_id, save_timestamp, final_save_name, p_standing_type
    FROM (
      SELECT 
        d.id as driver_id,
        d.name as driver_name,
        COALESCE(montagne.points, 0) as montagne_points,
        COALESCE(rallye.points, 0) as rallye_points,
        (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) as total_points,
        ROW_NUMBER() OVER (ORDER BY (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) DESC, d.name ASC) as general_position
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
      WHERE d.championship_id = p_championship_id
        AND (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) > 0
    ) standings;
  END IF;
  
  RAISE NOTICE 'Sauvegarde indépendante du classement % effectuée pour le championnat %', p_standing_type, p_championship_id;
END;
$function$;