
import { Driver, Race } from '@/types/championship';

export const useChampionshipHandlers = (
  refreshData: () => Promise<void>,
  resetAllData: () => Promise<void>,
  updateChampionshipConfig: (title: string, year: string) => Promise<void>
) => {
  const handleReset = async () => {
    await resetAllData();
  };

  const handleRacesChange = async (newMontagneRaces: Race[], newRallyeRaces: Race[]) => {
    console.log('handleRacesChange called with:', { newMontagneRaces, newRallyeRaces });
    
    // This function is called when races are modified
    // The individual race operations are handled by the RacesManagement component
    // We just need to refresh the data to get the latest state
    await refreshData();
  };

  const handleDriversChange = async (newDrivers: Driver[]) => {
    console.log('Updating drivers:', newDrivers);
    
    // This function is called when drivers are modified
    // The individual driver operations are handled by the DriversManagement component
    // We just need to refresh the data to get the latest state
    await refreshData();
  };

  const handleTitleChange = async (title: string, year: string) => {
    await updateChampionshipConfig(title, year);
  };

  return {
    handleReset,
    handleRacesChange,
    handleDriversChange,
    handleTitleChange
  };
};
