
-- Ajouter une politique d'UPDATE restreinte aux administrateurs pour race_results_archive
CREATE POLICY "Only admins can update race results archive" 
ON public.race_results_archive 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
