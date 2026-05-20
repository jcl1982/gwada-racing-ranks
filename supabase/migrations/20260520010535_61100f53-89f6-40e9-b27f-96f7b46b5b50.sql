
-- Re-grant execute to authenticated for client-callable RPCs (anon stays revoked)
GRANT EXECUTE ON FUNCTION public.clear_previous_standings(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_all_drivers() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_all_drivers(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_standings_save_by_type(uuid, timestamptz, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_drivers_evolution() TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_drivers_evolution(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_previous_standings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_previous_standings(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_standings_by_type(uuid, timestamptz, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_current_standings_as_previous() TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_current_standings_as_previous(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_standings_by_type(uuid, text, text) TO authenticated;

-- Add missing admin authorization checks inside SECURITY DEFINER functions
CREATE OR REPLACE FUNCTION public.restore_previous_standings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  standings_count INTEGER;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can restore standings';
  END IF;

  SELECT COUNT(*) INTO standings_count FROM public.previous_standings;
  IF standings_count = 0 THEN
    RAISE EXCEPTION 'Aucun classement précédent à restaurer';
  END IF;
  DELETE FROM public.race_results;
  RAISE NOTICE 'Classement précédent restauré: % pilotes affectés', standings_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.restore_previous_standings(p_championship_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  standings_count INTEGER;
  target_championship_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can restore standings';
  END IF;

  IF p_championship_id IS NULL THEN
    SELECT id INTO target_championship_id
    FROM championship_config
    WHERE title = 'Championnat Rallye-Montagne'
    LIMIT 1;
  ELSE
    target_championship_id := p_championship_id;
  END IF;

  SELECT COUNT(*) INTO standings_count
  FROM public.previous_standings
  WHERE championship_id = target_championship_id;

  IF standings_count = 0 THEN
    RAISE EXCEPTION 'Aucun classement précédent à restaurer pour ce championnat';
  END IF;

  DELETE FROM public.race_results rr
  USING public.races r
  WHERE rr.race_id = r.id
    AND r.championship_id = target_championship_id;

  RAISE NOTICE 'Classement précédent restauré pour le championnat %: % pilotes affectés', target_championship_id, standings_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.save_current_standings_as_previous()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can save standings';
  END IF;

  DELETE FROM public.previous_standings WHERE id IS NOT NULL;

  INSERT INTO public.previous_standings (driver_id, position, montagne_points, rallye_points, total_points)
  SELECT
    d.id,
    ROW_NUMBER() OVER (ORDER BY (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) DESC),
    COALESCE(montagne.points, 0),
    COALESCE(rallye.points, 0),
    (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0))
  FROM public.drivers d
  LEFT JOIN (
    SELECT rr.driver_id, SUM(rr.points) AS points
    FROM public.race_results rr
    JOIN public.races r ON rr.race_id = r.id
    WHERE r.type = 'montagne'
    GROUP BY rr.driver_id
  ) montagne ON d.id = montagne.driver_id
  LEFT JOIN (
    SELECT rr.driver_id, SUM(rr.points) AS points
    FROM public.race_results rr
    JOIN public.races r ON rr.race_id = r.id
    WHERE r.type = 'rallye'
    GROUP BY rr.driver_id
  ) rallye ON d.id = rallye.driver_id
  WHERE (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) > 0;
END;
$function$;

CREATE OR REPLACE FUNCTION public.save_current_standings_as_previous(p_championship_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target_championship_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can save standings';
  END IF;

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

  INSERT INTO public.previous_standings (driver_id, position, montagne_points, rallye_points, total_points, championship_id)
  SELECT
    d.id,
    ROW_NUMBER() OVER (ORDER BY (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) DESC),
    COALESCE(montagne.points, 0),
    COALESCE(rallye.points, 0),
    (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)),
    target_championship_id
  FROM public.drivers d
  LEFT JOIN (
    SELECT rr.driver_id, SUM(rr.points) AS points
    FROM public.race_results rr
    JOIN public.races r ON rr.race_id = r.id
    WHERE r.type = 'montagne' AND r.championship_id = target_championship_id
    GROUP BY rr.driver_id
  ) montagne ON d.id = montagne.driver_id
  LEFT JOIN (
    SELECT rr.driver_id, SUM(rr.points) AS points
    FROM public.race_results rr
    JOIN public.races r ON rr.race_id = r.id
    WHERE r.type = 'rallye' AND r.championship_id = target_championship_id
    GROUP BY rr.driver_id
  ) rallye ON d.id = rallye.driver_id
  WHERE d.championship_id = target_championship_id
    AND (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) > 0;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reset_drivers_evolution()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can reset evolution';
  END IF;
  DELETE FROM public.previous_standings WHERE id IS NOT NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reset_drivers_evolution(p_championship_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target_championship_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can reset evolution';
  END IF;

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
END;
$function$;
