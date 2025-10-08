-- Fix security warning: Add explicit search_path to database functions

-- Update has_role(role_name text) function
CREATE OR REPLACE FUNCTION public.has_role(role_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM pg_roles 
    WHERE rolname = role_name 
    AND pg_has_role(current_user, oid, 'member')
  );
$$;

-- Update reset_drivers_evolution function
CREATE OR REPLACE FUNCTION public.reset_drivers_evolution()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.previous_standings WHERE id IS NOT NULL;
  RAISE NOTICE 'Évolution des pilotes réinitialisée avec succès';
END;
$$;

-- Update get_missing_drivers function
CREATE OR REPLACE FUNCTION public.get_missing_drivers(race_id_param uuid DEFAULT NULL::uuid)
RETURNS TABLE(driver_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT rr.driver_id 
  FROM public.race_results rr
  LEFT JOIN public.drivers d ON rr.driver_id = d.id
  WHERE d.id IS NULL
  AND (race_id_param IS NULL OR rr.race_id = race_id_param);
$$;

-- Update delete_all_drivers function
CREATE OR REPLACE FUNCTION public.delete_all_drivers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  driver_count INTEGER;
  deleted_results INTEGER;
  deleted_standings INTEGER;
  deleted_drivers INTEGER;
BEGIN
  SELECT COUNT(*) INTO driver_count FROM public.drivers;
  
  IF driver_count = 0 THEN
    RAISE NOTICE 'Aucun pilote à supprimer (table vide)';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Début de la suppression de % pilotes', driver_count;
  
  DELETE FROM public.race_results 
  WHERE driver_id IN (SELECT id FROM public.drivers);
  
  GET DIAGNOSTICS deleted_results = ROW_COUNT;
  RAISE NOTICE 'Supprimé % résultats de course', deleted_results;
  
  DELETE FROM public.previous_standings 
  WHERE driver_id IN (SELECT id FROM public.drivers);
  
  GET DIAGNOSTICS deleted_standings = ROW_COUNT;
  RAISE NOTICE 'Supprimé % classements précédents', deleted_standings;
  
  DELETE FROM public.drivers 
  WHERE id IN (SELECT id FROM public.drivers);
  
  GET DIAGNOSTICS deleted_drivers = ROW_COUNT;
  RAISE NOTICE 'Supprimé % pilotes', deleted_drivers;
  
  RAISE NOTICE 'Suppression terminée: % pilotes, % résultats, % classements', 
    deleted_drivers, deleted_results, deleted_standings;
END;
$$;

-- Update save_current_standings_as_previous function
CREATE OR REPLACE FUNCTION public.save_current_standings_as_previous()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  standing_record RECORD;
  current_position INTEGER := 1;
BEGIN
  DELETE FROM public.previous_standings WHERE id IS NOT NULL;
  
  INSERT INTO public.previous_standings (driver_id, position, montagne_points, rallye_points, total_points)
  SELECT 
    d.id as driver_id,
    ROW_NUMBER() OVER (ORDER BY (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) DESC) as position,
    COALESCE(montagne.points, 0) as montagne_points,
    COALESCE(rallye.points, 0) as rallye_points,
    (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) as total_points
  FROM public.drivers d
  LEFT JOIN (
    SELECT 
      rr.driver_id,
      SUM(rr.points) as points
    FROM public.race_results rr
    JOIN public.races r ON rr.race_id = r.id
    WHERE r.type = 'montagne'
    GROUP BY rr.driver_id
  ) montagne ON d.id = montagne.driver_id
  LEFT JOIN (
    SELECT 
      rr.driver_id,
      SUM(rr.points) as points
    FROM public.race_results rr
    JOIN public.races r ON rr.race_id = r.id
    WHERE r.type = 'rallye'
    GROUP BY rr.driver_id
  ) rallye ON d.id = rallye.driver_id
  WHERE (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) > 0;
  
  RAISE NOTICE 'Classements précédents sauvegardés avec succès';
END;
$$;