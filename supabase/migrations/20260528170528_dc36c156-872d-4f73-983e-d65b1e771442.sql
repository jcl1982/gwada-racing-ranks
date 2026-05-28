-- Revoke EXECUTE from public/anon on admin-only SECURITY DEFINER functions.
-- These functions internally check has_role(auth.uid(),'admin') but should not be
-- exposed to anonymous users at all.

REVOKE EXECUTE ON FUNCTION public.save_current_standings_as_previous(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.save_current_standings_as_previous() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.restore_previous_standings(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.restore_previous_standings() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.restore_standings_by_type(uuid, timestamptz, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.save_standings_by_type(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.clear_previous_standings(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delete_all_drivers() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delete_all_drivers(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delete_standings_save_by_type(uuid, timestamptz, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reset_drivers_evolution() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reset_drivers_evolution(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_standings_saves_by_type(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_missing_drivers(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.save_current_standings_as_previous(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_current_standings_as_previous() TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_previous_standings(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_previous_standings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_standings_by_type(uuid, timestamptz, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_standings_by_type(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_previous_standings(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_all_drivers() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_all_drivers(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_standings_save_by_type(uuid, timestamptz, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_drivers_evolution() TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_drivers_evolution(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_standings_saves_by_type(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_missing_drivers(uuid) TO authenticated;