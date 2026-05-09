ALTER TABLE public.vmrs_results ADD COLUMN IF NOT EXISTS moyenne text NOT NULL DEFAULT 'haute';
ALTER TABLE public.vmrs_results ADD CONSTRAINT vmrs_results_moyenne_check CHECK (moyenne IN ('haute','intermediaire','basse'));
CREATE INDEX IF NOT EXISTS idx_vmrs_results_moyenne ON public.vmrs_results(championship_id, moyenne);