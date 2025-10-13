import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ViewType } from './useViewNavigation';

export interface ChampionshipConfig {
  id: string;
  title: string;
  year: string;
}

// Mapping des vues vers les types de championnats (identifiants stables)
const VIEW_TO_CHAMPIONSHIP_TYPE: Record<string, string> = {
  // Rallye-Montagne views
  'admin': 'rallye-montagne',
  'general': 'rallye-montagne',
  'montagne': 'rallye-montagne',
  'rallye': 'rallye-montagne',
  'c2r2': 'rallye-montagne',
  
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
  const [refreshKey, setRefreshKey] = useState(0);

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
        setConfig({
          id: data.id,
          title: data.title,
          year: data.year
        });
        console.log('✅ Configuration chargée:', data);
      } else {
        console.warn('⚠️ Aucune configuration trouvée pour le type:', championshipType);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [currentView, refreshKey]);

  const refresh = () => {
    console.log('🔄 Rafraîchissement de la configuration demandé');
    setRefreshKey(prev => prev + 1);
  };

  return { config, loading, refresh };
};
