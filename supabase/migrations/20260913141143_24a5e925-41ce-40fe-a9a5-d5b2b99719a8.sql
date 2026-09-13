
REVOKE ALL ON FUNCTION public.enforce_race_result_championship() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_vmrs_result_championship() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_all_drivers() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reset_drivers_evolution() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.restore_previous_standings() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.save_current_standings_as_previous() FROM PUBLIC, anon, authenticated;
