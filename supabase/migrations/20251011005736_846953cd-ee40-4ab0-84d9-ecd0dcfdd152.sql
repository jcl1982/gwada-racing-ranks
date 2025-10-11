-- Améliorer la restauration pour préserver les évolutions distinctes par classement
CREATE OR REPLACE FUNCTION public.restore_standings_by_timestamp(p_championship_id uuid, p_saved_at timestamp with time zone)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  standings_count INTEGER;
  results_count INTEGER;
  previous_save_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Vérifier s'il y a un classement sauvegardé à cette date
  SELECT COUNT(*) INTO standings_count 
  FROM public.previous_standings 
  WHERE championship_id = p_championship_id
    AND saved_at = p_saved_at;
  
  IF standings_count = 0 THEN
    RAISE EXCEPTION 'Aucun classement trouvé pour cette date';
  END IF;

  -- Trouver la sauvegarde précédente (celle juste avant celle qu'on restaure)
  SELECT MAX(saved_at) INTO previous_save_timestamp
  FROM public.previous_standings
  WHERE championship_id = p_championship_id
    AND saved_at < p_saved_at;

  -- Vérifier s'il y a des résultats archivés
  SELECT COUNT(*) INTO results_count
  FROM public.race_results_archive
  WHERE championship_id = p_championship_id
    AND saved_at = p_saved_at;
  
  -- Supprimer tous les résultats de course actuels pour ce championnat
  DELETE FROM public.race_results rr
  USING public.races r
  WHERE rr.race_id = r.id 
    AND r.championship_id = p_championship_id;
  
  -- Restaurer les résultats de course depuis l'archive
  IF results_count > 0 THEN
    INSERT INTO public.race_results (
      race_id,
      driver_id,
      position,
      points,
      dnf,
      time,
      car_model
    )
    SELECT 
      race_id,
      driver_id,
      position,
      points,
      dnf,
      time,
      car_model
    FROM public.race_results_archive
    WHERE championship_id = p_championship_id
      AND saved_at = p_saved_at;
  END IF;

  -- Supprimer les classements actuels (sauf ceux sauvegardés)
  DELETE FROM public.previous_standings
  WHERE championship_id = p_championship_id
    AND saved_at > p_saved_at;

  -- Si une sauvegarde précédente existe, on la conserve pour les évolutions
  -- Sinon on n'a pas d'évolutions à afficher
  IF previous_save_timestamp IS NOT NULL THEN
    -- On garde la sauvegarde qu'on restaure ET la précédente pour calculer les évolutions
    RAISE NOTICE 'Classement restauré avec évolutions depuis la sauvegarde du % (référence: %)', p_saved_at, previous_save_timestamp;
  ELSE
    -- Pas de sauvegarde précédente, donc pas d''évolutions
    RAISE NOTICE 'Classement restauré depuis la sauvegarde du % (première sauvegarde, pas d''évolutions)', p_saved_at;
  END IF;
END;
$function$;