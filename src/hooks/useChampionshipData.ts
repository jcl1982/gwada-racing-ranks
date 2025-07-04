
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
    saveRace,
    deleteRace,
    updateChampionshipConfig,
    resetAllData,
    refreshData
  } = useSupabaseData();

  const standings = calculateChampionshipStandings(drivers, montagneRaces, rallyeRaces, previousStandings);

  const { handleImport } = useChampionshipImport(
    drivers,
    saveDriver,
    saveRace,
    refreshData
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
    saveRace,
    deleteRace
  };
};
