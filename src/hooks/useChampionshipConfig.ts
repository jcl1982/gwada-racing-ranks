import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ViewType } from './useViewNavigation';

export interface StandingsTitles {
  general: string;
  montagne: string;
  rallye: string;
  r2: string;
  copilote: string;
  [key: string]: string;
}

export const DEFAULT_STANDINGS_TITLES: StandingsTitles = {
  general: 'Classement Général Provisoire',
  montagne: 'Trophée de la Montagne',
  rallye: 'Trophée des Rallyes',
  r2: 'Trophée R2',
  copilote: 'Trophée Copilote',
};

export interface ChampionshipConfig {
  id: string;
  title: string;
  year: string;
  standingsTitles: StandingsTitles;
}

// Mapping des vues vers les types de championnats (stable identifiers)
const VIEW_TO_CHAMPIONSHIP_TYPE: Record<string, string> = {
  // Rallye-Montagne views
  'admin': 'rallye-montagne',
  'general': 'rallye-montagne',
  'montagne': 'rallye-montagne',
  'rallye': 'rallye-montagne',
  'r2': 'rallye-montagne',
  
  // Accélération views
  'admin-acceleration': 'acceleration',
  'acceleration': 'acceleration',
  
  // Karting views  
  'admin-karting': 'karting',
  'karting': 'karting',
};

export const useChampionshipConfig = (currentView: ViewType) => {
  const [config, setConfig] = useState<ChampionshipConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const championshipType = VIEW_TO_CHAMPIONSHIP_TYPE[currentView] || 'rallye-montagne';
        
        console.log('🔧 Chargement de la configuration pour le type:', championshipType);
        
        const { data, error } = await supabase
          .from('championship_config')
          .select('*')
          .eq('type', championshipType)
          .maybeSingle();

        if (error) {
          console.error('❌ Erreur lors du chargement de la configuration:', error);
          throw error;
        }

        if (data) {
          const rawTitles = (data as any).standings_titles as Record<string, string> | null;
          const standingsTitles: StandingsTitles = {
            ...DEFAULT_STANDINGS_TITLES,
            ...(rawTitles || {}),
          };

          setConfig({
            id: data.id,
            title: data.title,
            year: data.year,
            standingsTitles,
          });
          console.log('✅ Configuration chargée:', data);
        }
      } catch (error) {
        console.error('❌ Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [currentView]);

  return { config, loading };
};
