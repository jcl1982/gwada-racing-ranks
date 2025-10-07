-- Mettre à jour le modèle de voiture pour les pilotes du Trophée C2 R2
UPDATE public.drivers
SET car_model = 'Citroën C2 R2'
WHERE name IN ('SAINTE-LUCE', 'BOECASSE Carl', 'CHAVILLE Jean-Marc', 'CORIOLAN Ennerick', 'PIERREVILLE Patrice');