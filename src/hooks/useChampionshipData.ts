
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
      // Étape 1: Identifier et sauvegarder UNIQUEMENT les nouveaux pilotes
      const newDriversToSave = newDrivers.filter(newDriver => 
        !drivers.find(existingDriver => existingDriver.id === newDriver.id)
      );

      console.log('👤 Pilotes à sauvegarder:', newDriversToSave.length);
      
      if (newDriversToSave.length > 0) {
        console.log('💾 Sauvegarde des nouveaux pilotes...');
        
        // Sauvegarder les pilotes un par un avec vérification
        for (let i = 0; i < newDriversToSave.length; i++) {
          const driver = newDriversToSave[i];
          console.log(`💾 Sauvegarde pilote ${i + 1}/${newDriversToSave.length}: ${driver.name} (ID: ${driver.id})`);
          
          try {
            await saveDriver(driver);
            console.log(`✅ Pilote sauvegardé avec succès: ${driver.name}`);
            
            // Délai entre chaque sauvegarde pour éviter les conflits
            if (i < newDriversToSave.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          } catch (driverError) {
            console.error(`❌ Erreur lors de la sauvegarde du pilote ${driver.name}:`, driverError);
            throw new Error(`Impossible de sauvegarder le pilote ${driver.name}: ${driverError instanceof Error ? driverError.message : 'Erreur inconnue'}`);
          }
        }

        // Attendre que les pilotes soient bien en base
        console.log('⏳ Attente de la synchronisation des pilotes...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Rafraîchir les données pour récupérer les nouveaux pilotes
        console.log('🔄 Rafraîchissement des données après sauvegarde des pilotes...');
        await refreshData();
        
        // Attendre encore un peu pour s'assurer que les données sont à jour
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Étape 2: Vérifier que tous les pilotes nécessaires existent maintenant
      console.log('🔍 Vérification de la présence de tous les pilotes...');
      await refreshData(); // Double vérification
      
      // Récupérer les pilotes actuels après la sauvegarde
      const currentDrivers = drivers.length > 0 ? drivers : newDrivers.filter(driver => 
        drivers.find(d => d.id === driver.id) || newDriversToSave.find(d => d.id === driver.id)
      );
      
      console.log('📋 Pilotes actuellement disponibles:', currentDrivers.length);

      // Étape 3: Sauvegarder les courses avec vérification des pilotes
      console.log('🏁 Sauvegarde des courses...');
      
      for (let i = 0; i < newRaces.length; i++) {
        const race = newRaces[i];
        console.log(`🏁 Sauvegarde course ${i + 1}/${newRaces.length}: ${race.name}`);
        
        // Vérifier que tous les pilotes de cette course existent
        const missingDrivers = race.results.filter(result => 
          !currentDrivers.find(driver => driver.id === result.driverId) &&
          !newDrivers.find(driver => driver.id === result.driverId)
        );
        
        if (missingDrivers.length > 0) {
          const missingIds = missingDrivers.map(r => r.driverId);
          console.error('❌ Pilotes manquants pour la course', race.name, ':', missingIds);
          throw new Error(`Pilotes manquants pour la course ${race.name}. IDs manquants: ${missingIds.join(', ')}`);
        }
        
        try {
          await saveRace(race);
          console.log(`✅ Course sauvegardée avec succès: ${race.name}`);
          
          // Délai entre chaque course
          if (i < newRaces.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 400));
          }
        } catch (raceError) {
          console.error(`❌ Erreur lors de la sauvegarde de la course ${race.name}:`, raceError);
          throw new Error(`Impossible de sauvegarder la course ${race.name}: ${raceError instanceof Error ? raceError.message : 'Erreur inconnue'}`);
        }
      }

      // Étape 4: Rafraîchissement final
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
