-- Add championship_id to drivers table to link each driver to a specific championship
ALTER TABLE public.drivers 
ADD COLUMN championship_id uuid REFERENCES public.championship_config(id) ON DELETE CASCADE;

-- Set default championship_id for existing drivers (first championship in config)
UPDATE public.drivers 
SET championship_id = (SELECT id FROM public.championship_config LIMIT 1)
WHERE championship_id IS NULL;

-- Make championship_id required after setting defaults
ALTER TABLE public.drivers 
ALTER COLUMN championship_id SET NOT NULL;

-- Add index for better performance when filtering by championship
CREATE INDEX idx_drivers_championship_id ON public.drivers(championship_id);

-- Update RLS policies to ensure drivers are filtered by championship
DROP POLICY IF EXISTS "Anyone can view drivers" ON public.drivers;
CREATE POLICY "Anyone can view drivers" 
ON public.drivers 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Only admins can insert drivers" ON public.drivers;
CREATE POLICY "Only admins can insert drivers" 
ON public.drivers 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can update drivers" ON public.drivers;
CREATE POLICY "Only admins can update drivers" 
ON public.drivers 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can delete drivers" ON public.drivers;
CREATE POLICY "Only admins can delete drivers" 
ON public.drivers 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));