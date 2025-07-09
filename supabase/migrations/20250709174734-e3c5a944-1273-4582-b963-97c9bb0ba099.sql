-- Ajouter un champ pour le modèle de voiture des pilotes
ALTER TABLE public.drivers 
ADD COLUMN car_model TEXT;

-- Créer un index pour améliorer les performances des requêtes sur le modèle de voiture
CREATE INDEX idx_drivers_car_model ON public.drivers(car_model);

-- Ajouter quelques contraintes pour maintenir la cohérence des données
ALTER TABLE public.drivers 
ADD CONSTRAINT check_car_model_format 
CHECK (car_model IS NULL OR LENGTH(TRIM(car_model)) > 0);