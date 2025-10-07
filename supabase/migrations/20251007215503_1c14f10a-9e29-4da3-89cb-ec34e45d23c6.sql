-- Mettre à jour le car_model de CHAVILLE pour la Course de Côte de Caféière
-- afin d'exclure ses points du classement C2 R2
UPDATE public.race_results rr
SET car_model = 'Autre'
FROM races r, drivers d
WHERE rr.race_id = r.id
  AND rr.driver_id = d.id
  AND d.name = 'CHAVILLE Jean-Marc'
  AND r.name = 'Course de Côte de Caféière';