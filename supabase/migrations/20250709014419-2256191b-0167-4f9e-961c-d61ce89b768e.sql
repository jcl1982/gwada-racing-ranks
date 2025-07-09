-- Correction de la fonction pour sauvegarder les classements
CREATE OR REPLACE FUNCTION public.save_current_standings_as_previous()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  standing_record RECORD;
  current_position INTEGER := 1;
BEGIN
  -- Vider les anciens classements précédents (avec clause WHERE obligatoire)
  DELETE FROM public.previous_standings WHERE id IS NOT NULL;
  
  -- Calculer et insérer les nouveaux classements précédents directement
  INSERT INTO public.previous_standings (driver_id, position, montagne_points, rallye_points, total_points)
  SELECT 
    d.id as driver_id,
    ROW_NUMBER() OVER (ORDER BY (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) DESC) as position,
    COALESCE(montagne.points, 0) as montagne_points,
    COALESCE(rallye.points, 0) as rallye_points,
    (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) as total_points
  FROM public.drivers d
  LEFT JOIN (
    SELECT 
      rr.driver_id,
      SUM(rr.points) as points
    FROM public.race_results rr
    JOIN public.races r ON rr.race_id = r.id
    WHERE r.type = 'montagne'
    GROUP BY rr.driver_id
  ) montagne ON d.id = montagne.driver_id
  LEFT JOIN (
    SELECT 
      rr.driver_id,
      SUM(rr.points) as points
    FROM public.race_results rr
    JOIN public.races r ON rr.race_id = r.id
    WHERE r.type = 'rallye'
    GROUP BY rr.driver_id
  ) rallye ON d.id = rallye.driver_id
  WHERE (COALESCE(montagne.points, 0) + COALESCE(rallye.points, 0)) > 0;
  
  RAISE NOTICE 'Classements précédents sauvegardés avec succès';
END;
$$;