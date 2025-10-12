import { useMemo, useEffect } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useChampionshipImport } from '@/hooks/championship/useChampionshipImport';
import { useChampionshipHandlers } from '@/hooks/championship/useChampionshipHandlers';
import { useChampionshipConfig } from '@/hooks/useChampionshipConfig';
import { useStandingsCalculation } from '@/hooks/useStandingsCalculation';
import { ViewType } from '@/hooks/useViewNavigation';

export const useChampionshipData = (currentView: ViewType) => {
  // Charger la configuration du championnat basée sur la vue actuelle
  const { config: championshipConfig, loading: configLoading } = useChampionshipConfig(currentView);

  const {
    drivers,
    montagneRaces,
    rallyeRaces,
    kartingRaces,
    accelerationRaces,
    previousStandings,
    championshipTitle,
    championshipYear,
    championshipId,
    loading: dataLoading,
    saveDriver,
    saveDriverForImport,
    deleteDriver,
    deleteAllDrivers,
    saveRace,
    deleteRace,
    updateChampionshipConfig,
    resetAllData,
    refreshData,
    autoSaveStandingsForEvolution,
    setChampionshipId
  } = useSupabaseData(championshipConfig?.id);

  // Mettre à jour le championshipId quand la config change
  useEffect(() => {
    if (championshipConfig?.id && championshipConfig.id !== championshipId) {
      console.log('🔄 Changement de championnat détecté:', {
        from: championshipId,
        to: championshipConfig.id,
        title: championshipConfig.title
      });
      setChampionshipId(championshipConfig.id);
    }
  }, [championshipConfig?.id, championshipId, setChampionshipId]);

  // Utiliser le hook centralisé pour calculer tous les standings
  const standingsCalculation = useStandingsCalculation({
    drivers,
    montagneRaces,
    rallyeRaces,
    previousStandings: previousStandings.general,
    championshipId: championshipConfig?.id || championshipId || ''
  });

  // Alias pour compatibilité avec le code existant
  const standings = standingsCalculation.generalStandings;

  const { handleImport } = useChampionshipImport(
    drivers,
    saveDriverForImport,
    saveRace,
    refreshData,
    autoSaveStandingsForEvolution
  );

  const {
    handleReset,
    handleRacesChange,
    handleDriversChange,
    handleTitleChange
  } = useChampionshipHandlers(
    refreshData,
    resetAllData,
    updateChampionshipConfig
  );

  return {
    drivers,
    montagneRaces,
    rallyeRaces,
    kartingRaces,
    accelerationRaces,
    standings,
    previousStandings,
    championshipTitle: championshipConfig?.title || championshipTitle,
    championshipYear: championshipConfig?.year || championshipYear,
    championshipId: championshipConfig?.id || championshipId,
    loading: configLoading || dataLoading,
    handleImport,
    handleReset,
    handleRacesChange,
    handleDriversChange,
    handleTitleChange,
    // Expose Supabase operations for direct use
    saveDriver,
    deleteDriver,
    deleteAllDrivers,
    saveRace,
    deleteRace,
    refreshData,
    resetAllData,
    // Exposer tous les classements calculés pour un accès direct
    standingsCalculation
  };
};
