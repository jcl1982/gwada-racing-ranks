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
    console.log('🚀 Démarrage du processus d\'import...');
    console.log('📊 Données à importer:', {
      races: newRaces.length,
      totalDrivers: newDrivers.length,
      existingDrivers: drivers.length,
      newDriversToAdd: newDrivers.length - drivers.length
    });
    
    try {
      // Étape 1: Identifier les nouveaux pilotes uniquement
      const newDriversToSave = newDrivers.filter(newDriver => 
        !drivers.find(existingDriver => existingDriver.id === newDriver.id)
      );

      console.log('👤 Pilotes à sauvegarder:', newDriversToSave.length);
      
      let currentDriversList = [...drivers]; // Copie des pilotes existants
      
      // Sauvegarder les nouveaux pilotes un par un
      if (newDriversToSave.length > 0) {
        console.log('💾 Sauvegarde des nouveaux pilotes...');
        
        for (let i = 0; i < newDriversToSave.length; i++) {
          const driver = newDriversToSave[i];
          console.log(`💾 Sauvegarde pilote ${i + 1}/${newDriversToSave.length}: ${driver.name} (ID: ${driver.id})`);
          
          try {
            await saveDriver(driver);
            // Ajouter immédiatement le pilote à notre liste locale
            currentDriversList.push(driver);
            console.log(`✅ Pilote sauvegardé et ajouté à la liste locale: ${driver.name}`);
            
            // Délai entre chaque sauvegarde
            if (i < newDriversToSave.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (driverError) {
            console.error(`❌ Erreur lors de la sauvegarde du pilote ${driver.name}:`, driverError);
            throw new Error(`Impossible de sauvegarder le pilote ${driver.name}: ${driverError instanceof Error ? driverError.message : 'Erreur inconnue'}`);
          }
        }

        // Attendre que les pilotes soient bien synchronisés
        console.log('⏳ Attente de la synchronisation finale des pilotes...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Double vérification en rafraîchissant les données
        await refreshData();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Étape 2: Sauvegarder les courses avec vérification renforcée
      console.log('🏁 Sauvegarde des courses...');
      console.log('📋 Pilotes disponibles pour vérification:', currentDriversList.length);
      
      for (let i = 0; i < newRaces.length; i++) {
        const race = newRaces[i];
        console.log(`🏁 Traitement course ${i + 1}/${newRaces.length}: ${race.name}`);
        
        // Vérifier que tous les pilotes de cette course existent dans notre liste locale
        const missingDrivers = race.results.filter(result => {
          const driverExists = currentDriversList.find(driver => driver.id === result.driverId);
          if (!driverExists) {
            console.error(`❌ Pilote manquant dans la liste locale: ${result.driverId}`);
          }
          return !driverExists;
        });
        
        if (missingDrivers.length > 0) {
          const missingIds = missingDrivers.map(r => r.driverId);
          console.error('❌ Pilotes manquants pour la course', race.name, ':', missingIds);
          console.log('📋 Pilotes disponibles:', currentDriversList.map(d => `${d.name} (${d.id})`));
          
          // Essayer un rafraîchissement final avant d'abandonner
          console.log('🔄 Tentative de rafraîchissement final...');
          await refreshData();
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          throw new Error(`Pilotes manquants pour la course ${race.name}. IDs manquants: ${missingIds.join(', ')}`);
        }
        
        try {
          console.log(`💾 Sauvegarde de la course: ${race.name} avec ${race.results.length} résultats`);
          await saveRace(race);
          console.log(`✅ Course sauvegardée avec succès: ${race.name}`);
          
          // Délai entre chaque course
          if (i < newRaces.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 600));
          }
        } catch (raceError) {
          console.error(`❌ Erreur lors de la sauvegarde de la course ${race.name}:`, raceError);
          throw new Error(`Impossible de sauvegarder la course ${race.name}: ${raceError instanceof Error ? raceError.message : 'Erreur inconnue'}`);
        }
      }

      // Rafraîchissement final
      console.log('🔄 Rafraîchissement final des données...');
      await refreshData();

      console.log('🎉 Import terminé avec succès !');
      toast({
        title: "Import réussi",
        description: `${newRaces.length} course(s) et ${newDriversToSave.length} nouveau(x) pilote(s) importé(s).`,
      });
      
    } catch (error) {
      console.error('💥 Erreur critique lors de l\'import:', error);
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
