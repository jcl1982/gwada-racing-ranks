-- Supprimer l'ancienne contrainte
ALTER TABLE races DROP CONSTRAINT IF EXISTS races_type_check;

-- Ajouter la nouvelle contrainte incluant karting et acceleration
ALTER TABLE races ADD CONSTRAINT races_type_check 
CHECK (type IN ('montagne', 'rallye', 'karting', 'acceleration'));