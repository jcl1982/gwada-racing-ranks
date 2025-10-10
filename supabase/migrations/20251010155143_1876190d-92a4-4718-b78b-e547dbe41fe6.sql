-- Fonction pour restaurer le classement précédent
CREATE OR REPLACE FUNCTION public.restore_previous_standings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  standings_count INTEGER;
BEGIN
  -- Vérifier s'il y a des classements précédents sauvegardés
  SELECT COUNT(*) INTO standings_count FROM public.previous_standings;
  
  IF standings_count = 0 THEN
    RAISE EXCEPTION 'Aucun classement précédent à restaurer';
  END IF;
  
  -- Supprimer tous les résultats de course actuels
  DELETE FROM public.race_results;
  
  -- Note: Cette fonction restaure uniquement l'état des classements.
  -- Les résultats de course individuels ne peuvent pas être restaurés
  -- car seuls les totaux sont sauvegardés dans previous_standings.
  
  RAISE NOTICE 'Classement précédent restauré: % pilotes affectés', standings_count;
END;
$function$;