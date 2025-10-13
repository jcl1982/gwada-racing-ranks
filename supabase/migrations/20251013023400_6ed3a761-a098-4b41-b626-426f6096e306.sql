-- Corriger l'incohérence entre titres et types des championnats

-- 1. Renommer le championnat avec type "rallye-montagne" correctement
UPDATE championship_config 
SET title = 'Championnat Rallye - Montagne'
WHERE id = 'a0e4f953-281b-4dbb-95b8-c3fe5b126352' AND type = 'rallye-montagne';

-- 2. Renommer le championnat avec type "acceleration" correctement
UPDATE championship_config 
SET title = 'Championnat Accélération'
WHERE id = '87eec79a-7276-454b-956f-655edf16c8d9' AND type = 'acceleration';

-- Vérifier le résultat
SELECT id, title, type, year FROM championship_config ORDER BY type;