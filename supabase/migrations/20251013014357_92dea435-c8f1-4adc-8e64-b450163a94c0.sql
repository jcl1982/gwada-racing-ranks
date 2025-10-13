-- Ajouter une colonne type pour identifier le championnat de manière stable
ALTER TABLE public.championship_config 
ADD COLUMN IF NOT EXISTS type text;

-- Mettre à jour les types existants basés sur les titres actuels
UPDATE public.championship_config 
SET type = 'rallye-montagne' 
WHERE title ILIKE '%rallye%montagne%' AND type IS NULL;

UPDATE public.championship_config 
SET type = 'acceleration' 
WHERE title ILIKE '%accélération%' AND type IS NULL;

UPDATE public.championship_config 
SET type = 'karting' 
WHERE title ILIKE '%karting%' AND type IS NULL;

-- Créer un index unique sur le type
CREATE UNIQUE INDEX IF NOT EXISTS championship_config_type_idx 
ON public.championship_config(type);

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.championship_config.type IS 'Type de championnat: rallye-montagne, acceleration, ou karting. Utilisé pour identifier le championnat de manière stable indépendamment du titre affiché.';