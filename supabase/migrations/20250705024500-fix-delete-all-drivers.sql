
-- Remplacer la fonction delete_all_drivers pour éviter l'erreur "DELETE requires a WHERE clause"
CREATE OR REPLACE FUNCTION public.delete_all_drivers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  driver_count INTEGER;
BEGIN
  -- Compter le nombre de pilotes
  SELECT COUNT(*) INTO driver_count FROM public.drivers;
  
  -- Si aucun pilote, pas besoin de supprimer
  IF driver_count = 0 THEN
    RAISE NOTICE 'Aucun pilote à supprimer';
    RETURN;
  END IF;
  
  -- Supprimer tous les résultats de course en premier
  DELETE FROM public.race_results 
  WHERE EXISTS (
    SELECT 1 FROM public.drivers 
    WHERE drivers.id = race_results.driver_id
  );
  
  -- Supprimer tous les classements précédents
  DELETE FROM public.previous_standings 
  WHERE EXISTS (
    SELECT 1 FROM public.drivers 
    WHERE drivers.id = previous_standings.driver_id
  );
  
  -- Enfin, supprimer tous les pilotes
  DELETE FROM public.drivers WHERE TRUE;
  
  -- Log pour confirmer l'opération
  RAISE NOTICE 'Tous les pilotes et leurs données associées ont été supprimés';
END;
$$;
