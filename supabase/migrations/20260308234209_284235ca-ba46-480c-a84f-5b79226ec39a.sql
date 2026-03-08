
-- Corriger clear_previous_standings qui manque SET search_path
CREATE OR REPLACE FUNCTION public.clear_previous_standings(p_championship_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.previous_standings
  WHERE championship_id = p_championship_id;
END;
$function$;
