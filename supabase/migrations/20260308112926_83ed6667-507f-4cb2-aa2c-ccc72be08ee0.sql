ALTER TABLE championship_config 
ADD COLUMN standings_titles jsonb DEFAULT '{
  "general": "Classement Général Provisoire",
  "montagne": "Trophée de la Montagne",
  "rallye": "Trophée des Rallyes",
  "r2": "Trophée R2",
  "copilote": "Trophée Copilote"
}'::jsonb;