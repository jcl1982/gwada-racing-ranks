-- Ajouter le champ organisateur aux courses
ALTER TABLE public.races 
ADD COLUMN organizer TEXT;