import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ViewType } from './useViewNavigation';

export interface ChampionshipConfig {
  id: string;
  title: string;
  year: string;
}

// Mapping des vues vers les titres de championnats
const VIEW_TO_CHAMPIONSHIP_TITLE: Record<string, string> = {
  // Rallye-Montagne views
  'admin': 'Championnat Rallye-Montagne',
  'general': 'Championnat Rallye-Montagne',
  'montagne': 'Championnat Rallye-Montagne',
  'rallye': 'Championnat Rallye-Montagne',
  'c2r2': 'Championnat Rallye-Montagne',
  // 'import' ne devrait pas être lié à un championnat spécifique
  // car l'utilisateur choisit le championnat via le sélecteur de type de course
  
  // Accélération views
  'admin-acceleration': 'Championnat Accélération',
  'acceleration': 'Championnat Accélération',
  
  // Karting views  
  'admin-karting': 'Championnat Karting',
  'karting': 'Championnat Karting',
};

export const useChampionshipConfig = (currentView: ViewType) => {
  const [config, setConfig] = useState<ChampionshipConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const championshipTitle = VIEW_TO_CHAMPIONSHIP_TITLE[currentView] || 'Championnat Rallye-Montagne';
        
        console.log('🔧 Chargement de la configuration pour:', championshipTitle);
        
        const { data, error } = await supabase
          .from('championship_config')
          .select('*')
          .eq('title', championshipTitle)
          .maybeSingle();

        if (error) {
          console.error('❌ Erreur lors du chargement de la configuration:', error);
          throw error;
        }

        if (data) {
          setConfig({
            id: data.id,
            title: data.title,
            year: data.year
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
