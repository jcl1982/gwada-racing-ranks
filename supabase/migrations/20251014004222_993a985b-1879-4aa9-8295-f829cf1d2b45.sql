-- Créer un type enum pour le rôle du driver
CREATE TYPE public.driver_role AS ENUM ('pilote', 'copilote');

-- Ajouter la colonne driver_role à la table drivers
ALTER TABLE public.drivers 
ADD COLUMN driver_role public.driver_role NOT NULL DEFAULT 'pilote';

-- Créer un index pour optimiser les requêtes filtrées par rôle
CREATE INDEX idx_drivers_role ON public.drivers(driver_role);

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.drivers.driver_role IS 'Rôle du pilote: pilote ou copilote (pour les rallyes)';