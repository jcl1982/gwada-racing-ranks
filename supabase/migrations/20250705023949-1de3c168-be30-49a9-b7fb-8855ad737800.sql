
-- Créer une fonction pour supprimer tous les pilotes et leurs données associées
CREATE OR REPLACE FUNCTION public.delete_all_drivers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer tous les résultats de course en premier
  DELETE FROM public.race_results 
  WHERE driver_id IN (SELECT id FROM public.drivers);
  
  -- Supprimer tous les classements précédents
  DELETE FROM public.previous_standings 
  WHERE driver_id IN (SELECT id FROM public.drivers);
  
  -- Enfin, supprimer tous les pilotes
  DELETE FROM public.drivers;
  
  -- Log pour confirmer l'opération
  RAISE NOTICE 'Tous les pilotes et leurs données associées ont été supprimés';
END;
$$;
