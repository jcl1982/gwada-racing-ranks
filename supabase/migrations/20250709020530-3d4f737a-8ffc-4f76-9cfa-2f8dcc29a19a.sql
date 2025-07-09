-- Fonction pour réinitialiser l'évolution des pilotes
CREATE OR REPLACE FUNCTION public.reset_drivers_evolution()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vider tous les classements précédents
  DELETE FROM public.previous_standings WHERE id IS NOT NULL;
  
  RAISE NOTICE 'Évolution des pilotes réinitialisée avec succès';
END;
$$;