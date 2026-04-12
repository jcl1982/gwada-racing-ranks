
CREATE TABLE public.vmrs_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  race_id uuid NOT NULL REFERENCES public.races(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  championship_id uuid NOT NULL REFERENCES public.championship_config(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  participation_points integer NOT NULL DEFAULT 0,
  classification_points integer NOT NULL DEFAULT 0,
  bonus_points integer NOT NULL DEFAULT 0,
  dnf boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(race_id, driver_id)
);

-- RLS
ALTER TABLE public.vmrs_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vmrs results"
ON public.vmrs_results FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert vmrs results"
ON public.vmrs_results FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update vmrs results"
ON public.vmrs_results FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete vmrs results"
ON public.vmrs_results FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Index pour les requêtes fréquentes
CREATE INDEX idx_vmrs_results_championship ON public.vmrs_results(championship_id);
CREATE INDEX idx_vmrs_results_driver ON public.vmrs_results(driver_id);
CREATE INDEX idx_vmrs_results_race ON public.vmrs_results(race_id);
