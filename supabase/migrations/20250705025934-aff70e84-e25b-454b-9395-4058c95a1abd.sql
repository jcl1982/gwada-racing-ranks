
-- Supprimer complètement l'ancienne fonction et la recréer
DROP FUNCTION IF EXISTS public.delete_all_drivers();

-- Créer une nouvelle fonction avec une approche différente
CREATE OR REPLACE FUNCTION public.delete_all_drivers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  driver_count INTEGER;
  deleted_results INTEGER;
  deleted_standings INTEGER;
  deleted_drivers INTEGER;
BEGIN
  -- Compter le nombre de pilotes
  SELECT COUNT(*) INTO driver_count FROM public.drivers;
  
  -- Si aucun pilote, retourner sans erreur
  IF driver_count = 0 THEN
    RAISE NOTICE 'Aucun pilote à supprimer (table vide)';
    RETURN;
  END IF;
  
  -- Log de début
  RAISE NOTICE 'Début de la suppression de % pilotes', driver_count;
  
  -- Supprimer tous les résultats de course
  DELETE FROM public.race_results 
  WHERE driver_id IN (SELECT id FROM public.drivers);
  
  GET DIAGNOSTICS deleted_results = ROW_COUNT;
  RAISE NOTICE 'Supprimé % résultats de course', deleted_results;
  
  -- Supprimer tous les classements précédents
  DELETE FROM public.previous_standings 
  WHERE driver_id IN (SELECT id FROM public.drivers);
  
  GET DIAGNOSTICS deleted_standings = ROW_COUNT;
  RAISE NOTICE 'Supprimé % classements précédents', deleted_standings;
  
  -- Supprimer tous les pilotes en utilisant une sous-requête explicite
  DELETE FROM public.drivers 
  WHERE id IN (SELECT id FROM public.drivers);
  
  GET DIAGNOSTICS deleted_drivers = ROW_COUNT;
  RAISE NOTICE 'Supprimé % pilotes', deleted_drivers;
  
  -- Log final
  RAISE NOTICE 'Suppression terminée: % pilotes, % résultats, % classements', 
    deleted_drivers, deleted_results, deleted_standings;
END;
$$;

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.delete_all_drivers() TO anon;
GRANT EXECUTE ON FUNCTION public.delete_all_drivers() TO authenticated;
