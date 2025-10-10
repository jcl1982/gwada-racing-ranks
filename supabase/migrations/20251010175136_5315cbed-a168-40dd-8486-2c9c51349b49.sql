-- Ajouter championship_id à la table races
ALTER TABLE public.races 
ADD COLUMN IF NOT EXISTS championship_id uuid REFERENCES public.championship_config(id) ON DELETE CASCADE;

-- Mettre à jour les courses existantes avec le championnat Rallye-Montagne
UPDATE public.races
SET championship_id = 'a0e4f953-281b-4dbb-95b8-c3fe5b126352'
WHERE championship_id IS NULL;

-- Rendre championship_id obligatoire
ALTER TABLE public.races 
ALTER COLUMN championship_id SET NOT NULL;

-- Ajouter championship_id à la table previous_standings
ALTER TABLE public.previous_standings
ADD COLUMN IF NOT EXISTS championship_id uuid REFERENCES public.championship_config(id) ON DELETE CASCADE;

-- Mettre à jour les classements existants avec le championnat Rallye-Montagne
UPDATE public.previous_standings
SET championship_id = 'a0e4f953-281b-4dbb-95b8-c3fe5b126352'
WHERE championship_id IS NULL;

-- Rendre championship_id obligatoire
ALTER TABLE public.previous_standings
ALTER COLUMN championship_id SET NOT NULL;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_races_championship_id ON public.races(championship_id);
CREATE INDEX IF NOT EXISTS idx_drivers_championship_id ON public.drivers(championship_id);
CREATE INDEX IF NOT EXISTS idx_previous_standings_championship_id ON public.previous_standings(championship_id);

-- Mettre à jour la fonction save_current_standings_as_previous pour prendre en compte le championnat
CREATE OR REPLACE FUNCTION public.save_current_standings_as_previous(p_championship_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  target_championship_id uuid;
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

  -- Supprimer les classements précédents pour ce championnat
  DELETE FROM public.previous_standings 
  WHERE championship_id = target_championship_id;
  
  -- Insérer les nouveaux classements pour ce championnat uniquement
  INSERT INTO public.previous_standings (driver_id, position, montagne_points, rallye_points, total_points, championship_id)
  SELECT 
    d.id as driver_id,
    ROW_NUMBER() OVER (ORDER BY (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) DESC) as position,
    COALESCE(montagne.points, 0) as montagne_points,
    COALESCE(rallye.points, 0) as rallye_points,
    (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) as total_points,
    target_championship_id as championship_id
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
  
  RAISE NOTICE 'Classements précédents sauvegardés pour le championnat %', target_championship_id;
END;
$function$;

-- Mettre à jour la fonction reset_drivers_evolution pour prendre en compte le championnat
CREATE OR REPLACE FUNCTION public.reset_drivers_evolution(p_championship_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  target_championship_id uuid;
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

  DELETE FROM public.previous_standings 
  WHERE championship_id = target_championship_id;
  
  RAISE NOTICE 'Évolution des pilotes réinitialisée pour le championnat %', target_championship_id;
END;
$function$;

-- Mettre à jour la fonction restore_previous_standings pour prendre en compte le championnat
CREATE OR REPLACE FUNCTION public.restore_previous_standings(p_championship_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  standings_count INTEGER;
  target_championship_id uuid;
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

  -- Vérifier s'il y a des classements précédents sauvegardés pour ce championnat
  SELECT COUNT(*) INTO standings_count 
  FROM public.previous_standings 
  WHERE championship_id = target_championship_id;
  
  IF standings_count = 0 THEN
    RAISE EXCEPTION 'Aucun classement précédent à restaurer pour ce championnat';
  END IF;
  
  -- Supprimer tous les résultats de course actuels pour ce championnat
  DELETE FROM public.race_results rr
  USING public.races r
  WHERE rr.race_id = r.id 
    AND r.championship_id = target_championship_id;
  
  RAISE NOTICE 'Classement précédent restauré pour le championnat %: % pilotes affectés', target_championship_id, standings_count;
END;
$function$;