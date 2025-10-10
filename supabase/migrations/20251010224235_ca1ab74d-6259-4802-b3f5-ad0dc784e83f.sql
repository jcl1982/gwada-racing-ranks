-- Mettre à jour la fonction pour utiliser un tri stable (par points puis par nom)
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
  -- Si aucun championship_id n'est fourni, utiliser le championnat Rallye-Montagne par défaut
  IF p_championship_id IS NULL THEN
    SELECT id INTO target_championship_id 
    FROM championship_config 
    WHERE title = 'Championnat Rallye-Montagne' 
    LIMIT 1;
  ELSE
    target_championship_id := p_championship_id;
  END IF;

  save_timestamp := now();

  -- Insérer les nouveaux classements avec tri stable (points DESC, puis nom ASC)
  INSERT INTO public.previous_standings (driver_id, position, montagne_points, rallye_points, total_points, championship_id, saved_at, save_name)
  SELECT 
    d.id as driver_id,
    ROW_NUMBER() OVER (ORDER BY (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) DESC, d.name ASC) as position,
    COALESCE(montagne.points, 0) as montagne_points,
    COALESCE(rallye.points, 0) as rallye_points,
    (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) as total_points,
    target_championship_id as championship_id,
    save_timestamp,
    COALESCE(p_save_name, 'Sauvegarde du ' || to_char(save_timestamp, 'DD/MM/YYYY à HH24:MI'))
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
  WHERE d.championship_id = target_championship_id
    AND (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) > 0;
  
  RAISE NOTICE 'Classements sauvegardés pour le championnat % à %', target_championship_id, save_timestamp;
END;
$function$;