-- Ajouter des colonnes pour stocker les positions distinctes de chaque classement
ALTER TABLE public.previous_standings 
ADD COLUMN IF NOT EXISTS general_position integer,
ADD COLUMN IF NOT EXISTS montagne_position integer,
ADD COLUMN IF NOT EXISTS rallye_position integer,
ADD COLUMN IF NOT EXISTS c2r2_position integer;

-- Mettre à jour la fonction pour calculer et sauvegarder les positions distinctes
CREATE OR REPLACE FUNCTION public.save_current_standings_as_previous(p_championship_id uuid DEFAULT NULL::uuid, p_save_name text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target_championship_id uuid;
  save_timestamp TIMESTAMP WITH TIME ZONE;
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

  -- Insérer les nouveaux classements avec les 4 positions distinctes
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
  WITH driver_points AS (
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
  )
  SELECT 
    driver_id,
    ROW_NUMBER() OVER (ORDER BY total_points DESC, driver_name ASC) as position,
    ROW_NUMBER() OVER (ORDER BY total_points DESC, driver_name ASC) as general_position,
    CASE WHEN montagne_points > 0 THEN ROW_NUMBER() OVER (ORDER BY montagne_points DESC, driver_name ASC) ELSE NULL END as montagne_position,
    CASE WHEN rallye_points > 0 THEN ROW_NUMBER() OVER (ORDER BY rallye_points DESC, driver_name ASC) ELSE NULL END as rallye_position,
    CASE WHEN c2r2_points > 0 THEN ROW_NUMBER() OVER (ORDER BY c2r2_points DESC, driver_name ASC) ELSE NULL END as c2r2_position,
    montagne_points,
    rallye_points,
    total_points,
    target_championship_id as championship_id,
    save_timestamp,
    COALESCE(p_save_name, 'Sauvegarde du ' || to_char(save_timestamp, 'DD/MM/YYYY à HH24:MI'))
  FROM driver_points
  WHERE total_points > 0;
  
  RAISE NOTICE 'Classements sauvegardés pour le championnat % à %', target_championship_id, save_timestamp;
END;
$function$;