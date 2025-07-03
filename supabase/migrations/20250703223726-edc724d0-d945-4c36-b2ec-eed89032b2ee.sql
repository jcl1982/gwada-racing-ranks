
-- Créer la table des pilotes
CREATE TABLE public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT,
  number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des courses
CREATE TABLE public.races (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('montagne', 'rallye')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table des résultats de course
CREATE TABLE public.race_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  race_id UUID NOT NULL REFERENCES public.races(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  time TEXT,
  dnf BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(race_id, driver_id)
);

-- Créer la table pour les classements précédents (pour le suivi des changements de position)
CREATE TABLE public.previous_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  montagne_points INTEGER NOT NULL DEFAULT 0,
  rallye_points INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(driver_id)
);

-- Créer la table de configuration du championnat
CREATE TABLE public.championship_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Championnat Automobile',
  year TEXT NOT NULL DEFAULT 'de Guadeloupe 2024',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insérer la configuration par défaut
INSERT INTO public.championship_config (title, year) 
VALUES ('Championnat Automobile', 'de Guadeloupe 2024');

-- Activer Row Level Security (RLS) pour toutes les tables
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.previous_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.championship_config ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS permissives (accès public en lecture/écriture)
-- Pour les pilotes
CREATE POLICY "Public access to drivers" ON public.drivers FOR ALL USING (true) WITH CHECK (true);

-- Pour les courses
CREATE POLICY "Public access to races" ON public.races FOR ALL USING (true) WITH CHECK (true);

-- Pour les résultats de course
CREATE POLICY "Public access to race_results" ON public.race_results FOR ALL USING (true) WITH CHECK (true);

-- Pour les classements précédents
CREATE POLICY "Public access to previous_standings" ON public.previous_standings FOR ALL USING (true) WITH CHECK (true);

-- Pour la configuration du championnat
CREATE POLICY "Public access to championship_config" ON public.championship_config FOR ALL USING (true) WITH CHECK (true);

-- Créer des index pour optimiser les performances
CREATE INDEX idx_race_results_race_id ON public.race_results(race_id);
CREATE INDEX idx_race_results_driver_id ON public.race_results(driver_id);
CREATE INDEX idx_races_type ON public.races(type);
CREATE INDEX idx_races_date ON public.races(date);
