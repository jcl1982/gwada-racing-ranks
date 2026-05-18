
CREATE TABLE public.driver_stats_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  championship_id uuid NOT NULL,
  driver_id uuid NOT NULL,
  standing_type text NOT NULL CHECK (standing_type IN ('montagne','rallye')),
  victories integer,
  podiums integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (championship_id, driver_id, standing_type)
);

ALTER TABLE public.driver_stats_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view driver stats overrides"
  ON public.driver_stats_overrides FOR SELECT USING (true);

CREATE POLICY "Only admins can insert driver stats overrides"
  ON public.driver_stats_overrides FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update driver stats overrides"
  ON public.driver_stats_overrides FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete driver stats overrides"
  ON public.driver_stats_overrides FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_dso_updated_at
  BEFORE UPDATE ON public.driver_stats_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
