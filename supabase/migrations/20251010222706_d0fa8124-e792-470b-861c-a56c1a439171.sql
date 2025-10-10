-- Supprimer l'ancienne contrainte unique sur driver_id
ALTER TABLE public.previous_standings 
DROP CONSTRAINT IF EXISTS previous_standings_driver_id_key;

-- Créer une nouvelle contrainte unique composite pour permettre plusieurs sauvegardes
-- Un pilote peut apparaître dans plusieurs sauvegardes, mais une seule fois par sauvegarde
ALTER TABLE public.previous_standings
ADD CONSTRAINT previous_standings_driver_championship_save_unique 
UNIQUE (driver_id, championship_id, saved_at);