-- Fix security vulnerability: Restrict write access on drivers table to admins only

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public access to drivers" ON public.drivers;

-- Allow everyone to view drivers (SELECT)
CREATE POLICY "Anyone can view drivers"
  ON public.drivers
  FOR SELECT
  USING (true);

-- Only authenticated admins can insert drivers
CREATE POLICY "Only admins can insert drivers"
  ON public.drivers
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only authenticated admins can update drivers
CREATE POLICY "Only admins can update drivers"
  ON public.drivers
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only authenticated admins can delete drivers
CREATE POLICY "Only admins can delete drivers"
  ON public.drivers
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));