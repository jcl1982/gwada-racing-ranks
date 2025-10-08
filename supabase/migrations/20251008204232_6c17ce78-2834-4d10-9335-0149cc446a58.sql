-- Fix security vulnerability: Restrict write access on races, race_results, championship_config, and previous_standings tables to admins only

-- ============================================
-- RACES TABLE
-- ============================================
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public access to races" ON public.races;

-- Allow everyone to view races (SELECT)
CREATE POLICY "Anyone can view races"
  ON public.races
  FOR SELECT
  USING (true);

-- Only authenticated admins can insert races
CREATE POLICY "Only admins can insert races"
  ON public.races
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only authenticated admins can update races
CREATE POLICY "Only admins can update races"
  ON public.races
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only authenticated admins can delete races
CREATE POLICY "Only admins can delete races"
  ON public.races
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- RACE_RESULTS TABLE
-- ============================================
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public access to race_results" ON public.race_results;

-- Allow everyone to view race results (SELECT)
CREATE POLICY "Anyone can view race results"
  ON public.race_results
  FOR SELECT
  USING (true);

-- Only authenticated admins can insert race results
CREATE POLICY "Only admins can insert race results"
  ON public.race_results
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only authenticated admins can update race results
CREATE POLICY "Only admins can update race results"
  ON public.race_results
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only authenticated admins can delete race results
CREATE POLICY "Only admins can delete race results"
  ON public.race_results
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- CHAMPIONSHIP_CONFIG TABLE
-- ============================================
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public access to championship_config" ON public.championship_config;

-- Allow everyone to view championship config (SELECT)
CREATE POLICY "Anyone can view championship config"
  ON public.championship_config
  FOR SELECT
  USING (true);

-- Only authenticated admins can insert championship config
CREATE POLICY "Only admins can insert championship config"
  ON public.championship_config
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only authenticated admins can update championship config
CREATE POLICY "Only admins can update championship config"
  ON public.championship_config
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only authenticated admins can delete championship config
CREATE POLICY "Only admins can delete championship config"
  ON public.championship_config
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- PREVIOUS_STANDINGS TABLE
-- ============================================
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public access to previous_standings" ON public.previous_standings;

-- Allow everyone to view previous standings (SELECT)
CREATE POLICY "Anyone can view previous standings"
  ON public.previous_standings
  FOR SELECT
  USING (true);

-- Only authenticated admins can insert previous standings
CREATE POLICY "Only admins can insert previous standings"
  ON public.previous_standings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only authenticated admins can update previous standings
CREATE POLICY "Only admins can update previous standings"
  ON public.previous_standings
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only authenticated admins can delete previous standings
CREATE POLICY "Only admins can delete previous standings"
  ON public.previous_standings
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));