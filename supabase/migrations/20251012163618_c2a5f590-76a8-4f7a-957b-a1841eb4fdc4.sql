-- Ajouter les colonnes category et bonus à la table race_results
ALTER TABLE public.race_results 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS bonus INTEGER DEFAULT 0;

-- Ajouter les mêmes colonnes à l'archive
ALTER TABLE public.race_results_archive 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS bonus INTEGER DEFAULT 0;

-- Créer un index pour les recherches par catégorie
CREATE INDEX IF NOT EXISTS idx_race_results_category ON public.race_results(category);

COMMENT ON COLUMN public.race_results.category IS 'Catégorie du pilote pour le karting (ex: MINI 60, KZ2, etc.)';
COMMENT ON COLUMN public.race_results.bonus IS 'Points bonus attribués au pilote';