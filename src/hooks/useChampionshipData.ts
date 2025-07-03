import { useState, useEffect } from 'react';
import { calculateChampionshipStandings } from '@/utils/championship';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

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

  const { toast } = useToast();

  const standings = calculateChampionshipStandings(drivers, montagneRaces, rallyeRaces, previousStandings);

  const handleImport = async (newRaces: Race[], newDrivers: Driver[]) => {
    console.log('Starting import process...');
    console.log('New races to import:', newRaces.length);
    console.log('New drivers to import:', newDrivers.length);
    
    try {
      // First, save all new drivers
      console.log('Step 1: Saving drivers...');
      for (const driver of newDrivers) {
        // Check if this is a new driver (doesn't exist in current drivers)
        const existingDriver = drivers.find(d => d.id === driver.id);
        if (!existingDriver) {
          console.log('Saving new driver:', driver.name);
          await saveDriver(driver);
        } else {
          console.log('Driver already exists:', driver.name);
        }
      }
      
      // Wait a bit to ensure drivers are saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh data to get the latest drivers
      console.log('Step 2: Refreshing data after driver save...');
      await refreshData();
      
      // Wait a bit more
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then save all races with their results
      console.log('Step 3: Saving races...');
      for (const race of newRaces) {
        console.log('Saving race:', race.name, 'with', race.results.length, 'results');
        await saveRace(race);
        
        // Small delay between races to avoid conflicts
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Final refresh
      console.log('Step 4: Final data refresh...');
      await refreshData();

      console.log('Import completed successfully!');
      toast({
        title: "Import réussi",
        description: `${newRaces.length} course(s) et ${newDrivers.length - drivers.length} nouveau(x) pilote(s) importé(s).`,
      });
    } catch (error) {
      console.error('❌ Error during import:', error);
      toast({
        title: "Erreur d'import",
        description: error instanceof Error ? error.message : "Une erreur s'est produite lors de l'import.",
        variant: "destructive"
      });
      throw error;
    }
  };

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
