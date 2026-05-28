UPDATE public.race_results rr
SET car_model = d.car_model
FROM public.drivers d
WHERE rr.driver_id = d.id
  AND rr.car_model IS NULL
  AND d.car_model IS NOT NULL
  AND d.driver_role = 'pilote';