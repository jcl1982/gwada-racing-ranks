-- Exclure les points de Coriolan pour la course de Caféière dans le trophée C2R2
UPDATE public.race_results 
SET points = 0, updated_at = now()
WHERE race_id = '8d5b9cd9-1706-4bed-9c38-812d9f2affc5' 
  AND driver_id = '1471b0dd-df36-44a6-b82b-4fc83360c461';