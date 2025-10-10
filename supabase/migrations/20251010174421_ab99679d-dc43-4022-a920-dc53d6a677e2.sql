-- Créer 3 championnats distincts dans la configuration
DO $$
DECLARE
  rallye_id uuid;
  acceleration_id uuid;
  karting_id uuid;
BEGIN
  -- Garder l'ID existant pour Rallye-Montagne
  rallye_id := 'a0e4f953-281b-4dbb-95b8-c3fe5b126352';
  
  -- Mettre à jour le championnat existant pour Rallye-Montagne
  UPDATE championship_config 
  SET 
    title = 'Championnat Rallye-Montagne',
    year = 'de Guadeloupe 2025'
  WHERE id = rallye_id;
  
  -- Créer le championnat Accélération
  INSERT INTO championship_config (id, title, year, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'Championnat Accélération',
    'de Guadeloupe 2025',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Créer le championnat Karting
  INSERT INTO championship_config (id, title, year, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'Championnat Karting',
    'de Guadeloupe 2025',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Championnats créés avec succès';
END $$;