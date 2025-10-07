-- Ajouter une colonne car_model à race_results pour tracker le modèle de voiture utilisé lors de chaque course
ALTER TABLE public.race_results 
ADD COLUMN car_model TEXT;

-- Peupler avec le modèle actuel du pilote pour les résultats existants
UPDATE public.race_results rr
SET car_model = d.car_model
FROM public.drivers d
WHERE rr.driver_id = d.id;

-- Mettre à jour le résultat de CHAVILLE à la Course de Côte des Mamelles pour indiquer qu'il n'a pas couru sur une C2 R2
UPDATE public.race_results
SET car_model = 'Autre'
WHERE driver_id = '0396b685-ef2e-4a49-902a-80e72aa420da'
AND race_id = 'b3c4755c-16d1-4e43-bbc0-51a7ab23573d';