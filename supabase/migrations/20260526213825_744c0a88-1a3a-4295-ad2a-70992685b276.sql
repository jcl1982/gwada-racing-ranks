-- Add a 'scope' column on drivers to fully separate championship pilots from VMRS pilots
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'championship';

ALTER TABLE public.drivers
  DROP CONSTRAINT IF EXISTS drivers_scope_check;
ALTER TABLE public.drivers
  ADD CONSTRAINT drivers_scope_check CHECK (scope IN ('championship', 'vmrs'));

-- Backfill: existing drivers that only have VMRS results become VMRS-only
UPDATE public.drivers d
SET scope = 'vmrs'
WHERE EXISTS (SELECT 1 FROM public.vmrs_results v WHERE v.driver_id = d.id)
  AND NOT EXISTS (SELECT 1 FROM public.race_results rr WHERE rr.driver_id = d.id);

CREATE INDEX IF NOT EXISTS idx_drivers_scope ON public.drivers(scope);