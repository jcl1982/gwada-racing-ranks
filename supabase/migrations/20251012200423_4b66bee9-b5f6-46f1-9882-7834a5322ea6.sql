-- Mise à jour de la fonction delete_all_drivers pour filtrer par championnat
CREATE OR REPLACE FUNCTION public.delete_all_drivers(p_championship_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  driver_count INTEGER;
  deleted_results INTEGER;
  deleted_standings INTEGER;
  deleted_drivers INTEGER;
BEGIN
  -- Compter uniquement les pilotes du championnat spécifié
  SELECT COUNT(*) INTO driver_count 
  FROM public.drivers 
  WHERE championship_id = p_championship_id;
  
  IF driver_count = 0 THEN
    RAISE NOTICE 'Aucun pilote à supprimer pour ce championnat (table vide)';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Début de la suppression de % pilotes du championnat %', driver_count, p_championship_id;
  
  -- Supprimer uniquement les résultats de course des pilotes de ce championnat
  DELETE FROM public.race_results 
  WHERE driver_id IN (
    SELECT id FROM public.drivers 
    WHERE championship_id = p_championship_id
  );
  
  GET DIAGNOSTICS deleted_results = ROW_COUNT;
  RAISE NOTICE 'Supprimé % résultats de course', deleted_results;
  
  -- Supprimer uniquement les classements précédents des pilotes de ce championnat
  DELETE FROM public.previous_standings 
  WHERE driver_id IN (
    SELECT id FROM public.drivers 
    WHERE championship_id = p_championship_id
  );
  
  GET DIAGNOSTICS deleted_standings = ROW_COUNT;
  RAISE NOTICE 'Supprimé % classements précédents', deleted_standings;
  
  -- Supprimer uniquement les pilotes de ce championnat
  DELETE FROM public.drivers 
  WHERE championship_id = p_championship_id;
  
  GET DIAGNOSTICS deleted_drivers = ROW_COUNT;
  RAISE NOTICE 'Supprimé % pilotes du championnat %, % résultats, % classements', 
    deleted_drivers, p_championship_id, deleted_results, deleted_standings;
END;
$function$;