
CREATE OR REPLACE FUNCTION public.enforce_race_result_championship()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  race_ch uuid;
  driver_ch uuid;
BEGIN
  SELECT championship_id INTO race_ch FROM public.races WHERE id = NEW.race_id;
  SELECT championship_id INTO driver_ch FROM public.drivers WHERE id = NEW.driver_id;
  IF race_ch IS NULL OR driver_ch IS NULL THEN
    RETURN NEW;
  END IF;
  IF race_ch <> driver_ch THEN
    RAISE EXCEPTION 'Incohérence: le pilote (%) et la course (%) appartiennent à des championnats différents', driver_ch, race_ch;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_race_results_championship ON public.race_results;
CREATE TRIGGER trg_race_results_championship
BEFORE INSERT OR UPDATE ON public.race_results
FOR EACH ROW EXECUTE FUNCTION public.enforce_race_result_championship();

CREATE OR REPLACE FUNCTION public.enforce_vmrs_result_championship()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  race_ch uuid;
  driver_ch uuid;
BEGIN
  SELECT championship_id INTO race_ch FROM public.races WHERE id = NEW.race_id;
  SELECT championship_id INTO driver_ch FROM public.drivers WHERE id = NEW.driver_id;
  IF race_ch IS NOT NULL AND race_ch <> NEW.championship_id THEN
    RAISE EXCEPTION 'Incohérence VMRS: la course appartient au championnat %', race_ch;
  END IF;
  IF driver_ch IS NOT NULL AND driver_ch <> NEW.championship_id THEN
    RAISE EXCEPTION 'Incohérence VMRS: le pilote appartient au championnat %', driver_ch;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vmrs_results_championship ON public.vmrs_results;
CREATE TRIGGER trg_vmrs_results_championship
BEFORE INSERT OR UPDATE ON public.vmrs_results
FOR EACH ROW EXECUTE FUNCTION public.enforce_vmrs_result_championship();

CREATE OR REPLACE FUNCTION public.delete_all_drivers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'Opération interdite: précisez un championnat (delete_all_drivers(p_championship_id))';
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_drivers_evolution()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'Opération interdite: précisez un championnat (reset_drivers_evolution(p_championship_id))';
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_previous_standings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'Opération interdite: précisez un championnat (restore_previous_standings(p_championship_id))';
END;
$$;

CREATE OR REPLACE FUNCTION public.save_current_standings_as_previous()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'Opération interdite: précisez un championnat (save_current_standings_as_previous(p_championship_id))';
END;
$$;
