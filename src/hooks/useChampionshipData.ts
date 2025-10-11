import { useMemo, useEffect } from 'react';
import { calculateChampionshipStandings } from '@/utils/championship';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useChampionshipImport } from '@/hooks/championship/useChampionshipImport';
import { useChampionshipHandlers } from '@/hooks/championship/useChampionshipHandlers';
import { useChampionshipConfig } from '@/hooks/useChampionshipConfig';
import { ViewType } from '@/hooks/useViewNavigation';

export const useChampionshipData = (currentView: ViewType) => {
  // Charger la configuration du championnat basée sur la vue actuelle
  const { config: championshipConfig, loading: configLoading } = useChampionshipConfig(currentView);

  const {
    drivers,
    montagneRaces,
    rallyeRaces,
    previousStandings,
    championshipTitle,
    championshipYear,
    championshipId,
    loading: dataLoading,
    saveDriver,
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

  // Utiliser useMemo pour s'assurer que les classements se recalculent à chaque changement de données
  const standings = useMemo(() => {
    console.log('🏆 Recalcul des classements avec:', {
      drivers: drivers.length,
      montagneRaces: montagneRaces.length,
      rallyeRaces: rallyeRaces.length,
      previousStandings: previousStandings.length
    });
    
    const calculatedStandings = calculateChampionshipStandings(drivers, montagneRaces, rallyeRaces, previousStandings);
    
    console.log('✅ Classements recalculés:', calculatedStandings.slice(0, 3).map(s => ({
      position: s.position,
      name: s.driver.name,
      totalPoints: s.totalPoints
    })));
    
    return calculatedStandings;
  }, [drivers, montagneRaces, rallyeRaces, previousStandings]);

  const { handleImport } = useChampionshipImport(
    drivers,
    saveDriver,
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
    resetAllData
  };
};
