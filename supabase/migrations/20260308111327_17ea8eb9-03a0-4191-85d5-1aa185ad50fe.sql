
-- Add admin authorization checks to all sensitive SECURITY DEFINER functions

-- 1. delete_all_drivers (with championship_id param)
CREATE OR REPLACE FUNCTION public.delete_all_drivers(p_championship_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  driver_count INTEGER;
  deleted_results INTEGER;
  deleted_standings INTEGER;
  deleted_drivers INTEGER;
BEGIN
  -- Authorization check
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can delete all drivers';
  END IF;

  SELECT COUNT(*) INTO driver_count 
  FROM public.drivers 
  WHERE championship_id = p_championship_id;
  
  IF driver_count = 0 THEN
    RAISE NOTICE 'Aucun pilote à supprimer pour ce championnat (table vide)';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Début de la suppression de % pilotes du championnat %', driver_count, p_championship_id;
  
  DELETE FROM public.race_results 
  WHERE driver_id IN (
    SELECT id FROM public.drivers 
    WHERE championship_id = p_championship_id
  );
  GET DIAGNOSTICS deleted_results = ROW_COUNT;
  
  DELETE FROM public.previous_standings 
  WHERE driver_id IN (
    SELECT id FROM public.drivers 
    WHERE championship_id = p_championship_id
  );
  GET DIAGNOSTICS deleted_standings = ROW_COUNT;
  
  DELETE FROM public.drivers 
  WHERE championship_id = p_championship_id;
  GET DIAGNOSTICS deleted_drivers = ROW_COUNT;
  
  RAISE NOTICE 'Supprimé % pilotes du championnat %, % résultats, % classements', 
    deleted_drivers, p_championship_id, deleted_results, deleted_standings;
END;
$$;

-- 2. delete_all_drivers (no params version)
CREATE OR REPLACE FUNCTION public.delete_all_drivers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  driver_count INTEGER;
  deleted_results INTEGER;
  deleted_standings INTEGER;
  deleted_drivers INTEGER;
BEGIN
  -- Authorization check
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can delete all drivers';
  END IF;

  SELECT COUNT(*) INTO driver_count FROM public.drivers;
  
  IF driver_count = 0 THEN
    RAISE NOTICE 'Aucun pilote à supprimer (table vide)';
    RETURN;
  END IF;
  
  DELETE FROM public.race_results 
  WHERE driver_id IN (SELECT id FROM public.drivers);
  GET DIAGNOSTICS deleted_results = ROW_COUNT;
  
  DELETE FROM public.previous_standings 
  WHERE driver_id IN (SELECT id FROM public.drivers);
  GET DIAGNOSTICS deleted_standings = ROW_COUNT;
  
  DELETE FROM public.drivers 
  WHERE id IN (SELECT id FROM public.drivers);
  GET DIAGNOSTICS deleted_drivers = ROW_COUNT;
  
  RAISE NOTICE 'Supprimé % pilotes, % résultats, % classements', 
    deleted_drivers, deleted_results, deleted_standings;
END;
$$;

-- 3. save_standings_by_type
CREATE OR REPLACE FUNCTION public.save_standings_by_type(p_championship_id uuid, p_standing_type text, p_save_name text DEFAULT NULL::text)
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
  -- Authorization check
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can save standings';
  END IF;

  save_timestamp := now();
  final_save_name := COALESCE(p_save_name, 'Sauvegarde ' || p_standing_type || ' du ' || to_char(save_timestamp, 'DD/MM/YYYY à HH24:MI'));

  race_type := CASE 
    WHEN p_standing_type = 'montagne' THEN 'montagne'
    WHEN p_standing_type = 'rallye' THEN 'rallye'
    WHEN p_standing_type = 'r2' THEN NULL
    ELSE NULL
  END;

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
$$;

-- 4. restore_standings_by_type
CREATE OR REPLACE FUNCTION public.restore_standings_by_type(p_championship_id uuid, p_saved_at timestamp with time zone, p_standing_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  standings_count INTEGER;
  results_count INTEGER;
  previous_save_timestamp TIMESTAMP WITH TIME ZONE;
  race_type text;
BEGIN
  -- Authorization check
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can restore standings';
  END IF;

  SELECT COUNT(*) INTO standings_count 
  FROM public.previous_standings 
  WHERE championship_id = p_championship_id
    AND saved_at = p_saved_at
    AND standing_type = p_standing_type;
  
  IF standings_count = 0 THEN
    RAISE EXCEPTION 'Aucun classement % trouvé pour cette date', p_standing_type;
  END IF;

  SELECT MAX(saved_at) INTO previous_save_timestamp
  FROM public.previous_standings
  WHERE championship_id = p_championship_id
    AND saved_at < p_saved_at
    AND standing_type = p_standing_type;

  race_type := CASE 
    WHEN p_standing_type = 'montagne' THEN 'montagne'
    WHEN p_standing_type = 'rallye' THEN 'rallye'
    ELSE NULL
  END;

  SELECT COUNT(*) INTO results_count
  FROM public.race_results_archive
  WHERE championship_id = p_championship_id
    AND saved_at = p_saved_at
    AND standing_type = p_standing_type;
  
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
    DELETE FROM public.race_results rr
    USING public.races r
    WHERE rr.race_id = r.id 
      AND r.championship_id = p_championship_id;
  END IF;
  
  IF results_count > 0 THEN
    INSERT INTO public.race_results (race_id, driver_id, position, points, dnf, time, car_model)
    SELECT race_id, driver_id, position, points, dnf, time, car_model
    FROM public.race_results_archive
    WHERE championship_id = p_championship_id
      AND saved_at = p_saved_at
      AND standing_type = p_standing_type;
  END IF;

  DELETE FROM public.previous_standings
  WHERE championship_id = p_championship_id
    AND saved_at > p_saved_at
    AND standing_type = p_standing_type;

  RAISE NOTICE 'Classement % restauré depuis %', p_standing_type, p_saved_at;
END;
$$;

-- 5. delete_standings_save_by_type
CREATE OR REPLACE FUNCTION public.delete_standings_save_by_type(p_championship_id uuid, p_saved_at timestamp with time zone, p_standing_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Authorization check
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can delete standings saves';
  END IF;

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
