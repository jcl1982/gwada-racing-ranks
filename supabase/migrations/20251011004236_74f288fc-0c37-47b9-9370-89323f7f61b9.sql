-- Fix save_current_standings_as_previous to preserve general positions correctly
CREATE OR REPLACE FUNCTION public.save_current_standings_as_previous(p_championship_id uuid DEFAULT NULL::uuid, p_save_name text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  target_championship_id uuid;
  save_timestamp TIMESTAMP WITH TIME ZONE;
  last_save_timestamp TIMESTAMP WITH TIME ZONE;
  final_save_name text;
BEGIN
  IF p_championship_id IS NULL THEN
    SELECT id INTO target_championship_id 
    FROM championship_config 
    WHERE title = 'Championnat Rallye-Montagne' 
    LIMIT 1;
  ELSE
    target_championship_id := p_championship_id;
  END IF;

  save_timestamp := now();
  final_save_name := COALESCE(p_save_name, 'Sauvegarde du ' || to_char(save_timestamp, 'DD/MM/YYYY à HH24:MI'));

  -- Récupérer le timestamp de la dernière sauvegarde
  SELECT MAX(saved_at) INTO last_save_timestamp
  FROM public.previous_standings
  WHERE championship_id = target_championship_id;

  -- Archiver les résultats de course actuels
  INSERT INTO public.race_results_archive (
    race_id,
    driver_id,
    position,
    points,
    dnf,
    time,
    car_model,
    championship_id,
    saved_at,
    save_name
  )
  SELECT 
    rr.race_id,
    rr.driver_id,
    rr.position,
    rr.points,
    rr.dnf,
    rr.time,
    rr.car_model,
    r.championship_id,
    save_timestamp,
    final_save_name
  FROM public.race_results rr
  JOIN public.races r ON rr.race_id = r.id
  WHERE r.championship_id = target_championship_id;

  -- Insérer les nouveaux classements avec préservation des positions
  INSERT INTO public.previous_standings (
    driver_id, 
    position, 
    general_position,
    montagne_position,
    rallye_position,
    c2r2_position,
    montagne_points, 
    rallye_points, 
    total_points, 
    championship_id, 
    saved_at, 
    save_name
  )
  WITH current_points AS (
    SELECT 
      d.id as driver_id,
      d.name as driver_name,
      d.car_model,
      COALESCE(montagne.points, 0) as montagne_points,
      COALESCE(rallye.points, 0) as rallye_points,
      (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) as total_points,
      COALESCE(c2r2_montagne.points, 0) + COALESCE(c2r2_rallye.points, 0) as c2r2_points
    FROM public.drivers d
    LEFT JOIN (
      SELECT 
        rr.driver_id,
        SUM(rr.points) as points
      FROM public.race_results rr
      JOIN public.races r ON rr.race_id = r.id
      WHERE r.type = 'montagne' AND r.championship_id = target_championship_id
      GROUP BY rr.driver_id
    ) montagne ON d.id = montagne.driver_id
    LEFT JOIN (
      SELECT 
        rr.driver_id,
        SUM(rr.points) as points
      FROM public.race_results rr
      JOIN public.races r ON rr.race_id = r.id
      WHERE r.type = 'rallye' AND r.championship_id = target_championship_id
      GROUP BY rr.driver_id
    ) rallye ON d.id = rallye.driver_id
    LEFT JOIN (
      SELECT 
        rr.driver_id,
        SUM(rr.points) as points
      FROM public.race_results rr
      JOIN public.races r ON rr.race_id = r.id
      WHERE r.type = 'montagne' 
        AND r.championship_id = target_championship_id
        AND rr.car_model ILIKE '%C2%R2%'
      GROUP BY rr.driver_id
    ) c2r2_montagne ON d.id = c2r2_montagne.driver_id
    LEFT JOIN (
      SELECT 
        rr.driver_id,
        SUM(rr.points) as points
      FROM public.race_results rr
      JOIN public.races r ON rr.race_id = r.id
      WHERE r.type = 'rallye' 
        AND r.championship_id = target_championship_id
        AND rr.car_model ILIKE '%C2%R2%'
      GROUP BY rr.driver_id
    ) c2r2_rallye ON d.id = c2r2_rallye.driver_id
    WHERE d.championship_id = target_championship_id
  ),
  previous_save AS (
    SELECT 
      driver_id,
      total_points as prev_total_points,
      montagne_points as prev_montagne_points,
      rallye_points as prev_rallye_points,
      general_position as prev_general_position,
      montagne_position as prev_montagne_position,
      rallye_position as prev_rallye_position,
      c2r2_position as prev_c2r2_position
    FROM public.previous_standings
    WHERE championship_id = target_championship_id
      AND saved_at = last_save_timestamp
  ),
  new_positions AS (
    SELECT 
      cp.driver_id,
      cp.driver_name,
      cp.montagne_points,
      cp.rallye_points,
      cp.total_points,
      cp.c2r2_points,
      -- Conserver la position générale si les points totaux n'ont pas changé
      CASE 
        WHEN ps.prev_total_points IS NOT NULL 
          AND cp.total_points = ps.prev_total_points
          AND cp.total_points > 0
        THEN ps.prev_general_position
        WHEN cp.total_points > 0
        THEN ROW_NUMBER() OVER (ORDER BY cp.total_points DESC, cp.driver_name ASC)
        ELSE NULL
      END as general_position,
      CASE 
        WHEN ps.prev_montagne_points IS NOT NULL 
          AND cp.montagne_points = ps.prev_montagne_points
          AND cp.montagne_points > 0
        THEN ps.prev_montagne_position
        WHEN cp.montagne_points > 0
        THEN ROW_NUMBER() OVER (ORDER BY cp.montagne_points DESC, cp.driver_name ASC)
        ELSE NULL
      END as montagne_position,
      CASE 
        WHEN ps.prev_rallye_points IS NOT NULL 
          AND cp.rallye_points = ps.prev_rallye_points
          AND cp.rallye_points > 0
        THEN ps.prev_rallye_position
        WHEN cp.rallye_points > 0
        THEN ROW_NUMBER() OVER (ORDER BY cp.rallye_points DESC, cp.driver_name ASC)
        ELSE NULL
      END as rallye_position,
      CASE 
        WHEN cp.c2r2_points > 0 
        THEN ROW_NUMBER() OVER (ORDER BY cp.c2r2_points DESC, cp.driver_name ASC)
        ELSE NULL
      END as c2r2_position
    FROM current_points cp
    LEFT JOIN previous_save ps ON cp.driver_id = ps.driver_id
    WHERE cp.total_points > 0
  )
  SELECT 
    driver_id,
    general_position as position,
    general_position,
    montagne_position,
    rallye_position,
    c2r2_position,
    montagne_points,
    rallye_points,
    total_points,
    target_championship_id as championship_id,
    save_timestamp,
    final_save_name
  FROM new_positions;
  
  RAISE NOTICE 'Classements et résultats sauvegardés pour le championnat % à %', target_championship_id, save_timestamp;
END;
$function$;