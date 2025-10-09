
import { useMemo } from 'react';
import { calculateChampionshipStandings } from '@/utils/championship';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useChampionshipImport } from '@/hooks/championship/useChampionshipImport';
import { useChampionshipHandlers } from '@/hooks/championship/useChampionshipHandlers';

export const useChampionshipData = () => {
  const {
    drivers,
    montagneRaces,
    rallyeRaces,
    previousStandings,
    championshipTitle,
    championshipYear,
    loading,
    saveDriver,
    deleteDriver,
    deleteAllDrivers,
    saveRace,
    deleteRace,
    updateChampionshipConfig,
    saveCurrentStandingsAsPrevious,
    resetDriversEvolution,
    resetAllData,
    refreshData
  } = useSupabaseData();

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
    saveCurrentStandingsAsPrevious
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
    championshipTitle,
    championshipYear,
    loading,
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
    saveCurrentStandingsAsPrevious,
    resetDriversEvolution
  };
};
