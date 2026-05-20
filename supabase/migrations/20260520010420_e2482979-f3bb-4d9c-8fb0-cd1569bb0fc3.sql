
-- 1) Remove broken single-argument has_role to prevent accidental use in policies
DROP FUNCTION IF EXISTS public.has_role(role_name text);

-- 2) Lock down set_updated_at: set search_path and use SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3) Revoke EXECUTE from anon/authenticated on admin-only SECURITY DEFINER functions.
--    These functions perform privileged data changes; they should only be invoked
--    server-side (service role) or by trusted callers, never directly by clients.
REVOKE EXECUTE ON FUNCTION public.clear_previous_standings(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_all_drivers() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_all_drivers(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_standings_save_by_type(uuid, timestamptz, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_drivers_evolution() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_drivers_evolution(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.restore_previous_standings() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.restore_previous_standings(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.restore_standings_by_type(uuid, timestamptz, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.save_current_standings_as_previous() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.save_current_standings_as_previous(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.save_standings_by_type(uuid, text, text) FROM PUBLIC, anon, authenticated;

-- Read-only / lookup helpers can stay callable (used by RLS and the app):
--   has_role(uuid, app_role), get_user_role(uuid), get_missing_drivers(uuid),
--   get_standings_saves_by_type(uuid, text)
