-- Amélioration de la fonction de sauvegarde pour préserver l'évolution
-- des classements qui n'ont pas changé

CREATE OR REPLACE FUNCTION public.save_current_standings_as_previous(
  p_championship_id uuid DEFAULT NULL::uuid, 
  p_save_name text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target_championship_id uuid;
  save_timestamp TIMESTAMP WITH TIME ZONE;
  last_save_timestamp TIMESTAMP WITH TIME ZONE;
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

  -- Récupérer le timestamp de la dernière sauvegarde
  SELECT MAX(saved_at) INTO last_save_timestamp
  FROM public.previous_standings
  WHERE championship_id = target_championship_id;

  -- Insérer les nouveaux classements avec préservation des positions inchangées
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
      montagne_points as prev_montagne_points,
      rallye_points as prev_rallye_points,
      montagne_position as prev_montagne_position,
      rallye_position as prev_rallye_position
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
      -- Position générale : toujours recalculée
      ROW_NUMBER() OVER (ORDER BY cp.total_points DESC, cp.driver_name ASC) as general_position,
      -- Position montagne : préservée si les points n'ont pas changé
      CASE 
        WHEN ps.prev_montagne_points IS NOT NULL 
          AND cp.montagne_points = ps.prev_montagne_points
          AND cp.montagne_points > 0
        THEN ps.prev_montagne_position
        WHEN cp.montagne_points > 0
        THEN ROW_NUMBER() OVER (ORDER BY cp.montagne_points DESC, cp.driver_name ASC)
        ELSE NULL
      END as montagne_position,
      -- Position rallye : préservée si les points n'ont pas changé
      CASE 
        WHEN ps.prev_rallye_points IS NOT NULL 
          AND cp.rallye_points = ps.prev_rallye_points
          AND cp.rallye_points > 0
        THEN ps.prev_rallye_position
        WHEN cp.rallye_points > 0
        THEN ROW_NUMBER() OVER (ORDER BY cp.rallye_points DESC, cp.driver_name ASC)
        ELSE NULL
      END as rallye_position,
      -- Position C2R2 : toujours recalculée
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
    COALESCE(p_save_name, 'Sauvegarde du ' || to_char(save_timestamp, 'DD/MM/YYYY à HH24:MI'))
  FROM new_positions;
  
  RAISE NOTICE 'Classements sauvegardés pour le championnat % à % avec préservation des évolutions', target_championship_id, save_timestamp;
END;
$function$;