-- Mettre à jour les types manquants dans championship_config
UPDATE championship_config 
SET type = 'karting' 
WHERE title = 'Championnat Kart' AND type IS NULL;

UPDATE championship_config 
SET type = 'acceleration' 
WHERE title = 'Championnat' AND type IS NULL;