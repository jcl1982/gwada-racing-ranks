-- Ajouter des colonnes pour gérer l'historique des sauvegardes
ALTER TABLE public.previous_standings 
ADD COLUMN IF NOT EXISTS saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS save_name TEXT;

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_previous_standings_championship_saved_at 
ON public.previous_standings(championship_id, saved_at DESC);

-- Modifier la fonction save_current_standings_as_previous pour conserver l'historique
CREATE OR REPLACE FUNCTION public.save_current_standings_as_previous(
  p_championship_id uuid DEFAULT NULL::uuid,
  p_save_name TEXT DEFAULT NULL::text
)
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

  -- Insérer les nouveaux classements (on ne supprime plus les anciens)
  INSERT INTO public.previous_standings (driver_id, position, montagne_points, rallye_points, total_points, championship_id, saved_at, save_name)
  SELECT 
    d.id as driver_id,
    ROW_NUMBER() OVER (ORDER BY (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) DESC) as position,
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

-- Créer une nouvelle fonction pour restaurer une sauvegarde spécifique
CREATE OR REPLACE FUNCTION public.restore_standings_by_timestamp(
  p_championship_id uuid,
  p_saved_at TIMESTAMP WITH TIME ZONE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  standings_count INTEGER;
BEGIN
  -- Vérifier s'il y a un classement sauvegardé à cette date pour ce championnat
  SELECT COUNT(*) INTO standings_count 
  FROM public.previous_standings 
  WHERE championship_id = p_championship_id
    AND saved_at = p_saved_at;
  
  IF standings_count = 0 THEN
    RAISE EXCEPTION 'Aucun classement trouvé pour cette date';
  END IF;
  
  -- Supprimer tous les résultats de course actuels pour ce championnat
  DELETE FROM public.race_results rr
  USING public.races r
  WHERE rr.race_id = r.id 
    AND r.championship_id = p_championship_id;
  
  RAISE NOTICE 'Classement restauré pour le championnat % depuis la sauvegarde du %', p_championship_id, p_saved_at;
END;
$function$;

-- Créer une fonction pour supprimer une sauvegarde spécifique
CREATE OR REPLACE FUNCTION public.delete_standings_save(
  p_championship_id uuid,
  p_saved_at TIMESTAMP WITH TIME ZONE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.previous_standings
  WHERE championship_id = p_championship_id
    AND saved_at = p_saved_at;
  
  RAISE NOTICE 'Sauvegarde supprimée pour le championnat % à %', p_championship_id, p_saved_at;
END;
$function$;

-- Créer une fonction pour obtenir la liste des sauvegardes
CREATE OR REPLACE FUNCTION public.get_standings_saves(p_championship_id uuid)
RETURNS TABLE (
  saved_at TIMESTAMP WITH TIME ZONE,
  save_name TEXT,
  drivers_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    ps.saved_at,
    ps.save_name,
    COUNT(*) as drivers_count
  FROM public.previous_standings ps
  WHERE ps.championship_id = p_championship_id
  GROUP BY ps.saved_at, ps.save_name
  ORDER BY ps.saved_at DESC;
$function$;