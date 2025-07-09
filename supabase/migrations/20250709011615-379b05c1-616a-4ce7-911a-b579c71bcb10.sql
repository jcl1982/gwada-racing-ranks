-- Fonction pour sauvegarder le classement actuel comme classement précédent
CREATE OR REPLACE FUNCTION public.save_current_standings_as_previous()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  driver_record RECORD;
  montagne_pts INTEGER;
  rallye_pts INTEGER;
  total_pts INTEGER;
  current_position INTEGER := 1;
BEGIN
  -- Vider les anciens classements précédents
  DELETE FROM public.previous_standings;
  
  -- Calculer et insérer les nouveaux classements précédents
  FOR driver_record IN 
    SELECT d.id, d.name
    FROM public.drivers d
    ORDER BY d.name
  LOOP
    -- Calculer les points montagne
    SELECT COALESCE(SUM(rr.points), 0) INTO montagne_pts
    FROM public.race_results rr
    JOIN public.races r ON rr.race_id = r.id
    WHERE rr.driver_id = driver_record.id 
    AND r.type = 'montagne';
    
    -- Calculer les points rallye
    SELECT COALESCE(SUM(rr.points), 0) INTO rallye_pts
    FROM public.race_results rr
    JOIN public.races r ON rr.race_id = r.id
    WHERE rr.driver_id = driver_record.id 
    AND r.type = 'rallye';
    
    -- Calculer le total
    total_pts := montagne_pts + rallye_pts;
    
    -- Insérer seulement si le pilote a des points
    IF total_pts > 0 THEN
      INSERT INTO public.previous_standings (
        driver_id,
        position,
        montagne_points,
        rallye_points,
        total_points
      ) VALUES (
        driver_record.id,
        current_position,
        montagne_pts,
        rallye_pts,
        total_pts
      );
      
      current_position := current_position + 1;
    END IF;
  END LOOP;
  
  -- Réordonner par total de points décroissant et mettre à jour les positions
  WITH ranked_standings AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY total_points DESC) as new_position
    FROM public.previous_standings
  )
  UPDATE public.previous_standings ps
  SET position = rs.new_position
  FROM ranked_standings rs
  WHERE ps.id = rs.id;
  
  RAISE NOTICE 'Classements précédents sauvegardés avec succès';
END;
$$;