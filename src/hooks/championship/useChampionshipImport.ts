
import { Driver, Race } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';

export const useChampionshipImport = (
  drivers: Driver[],
  saveDriver: (driver: Driver) => Promise<void>,
  saveRace: (race: Omit<Race, 'id' | 'results'> | Race) => Promise<void>,
  refreshData: () => Promise<void>
) => {
  const { toast } = useToast();

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
      
      // Sauvegarder les nouveaux pilotes un par un
      if (newDriversToSave.length > 0) {
        console.log('💾 Sauvegarde des nouveaux pilotes...');
        
        for (let i = 0; i < newDriversToSave.length; i++) {
          const driver = newDriversToSave[i];
          console.log(`💾 Sauvegarde pilote ${i + 1}/${newDriversToSave.length}: ${driver.name} (ID: ${driver.id})`);
          
          try {
            await saveDriver(driver);
            console.log(`✅ Pilote sauvegardé: ${driver.name}`);
            
            // Délai entre chaque sauvegarde
            if (i < newDriversToSave.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 800));
            }
          } catch (driverError) {
            console.error(`❌ Erreur lors de la sauvegarde du pilote ${driver.name}:`, driverError);
            throw new Error(`Impossible de sauvegarder le pilote ${driver.name}: ${driverError instanceof Error ? driverError.message : 'Erreur inconnue'}`);
          }
        }

        // Attendre que les pilotes soient bien synchronisés
        console.log('⏳ Attente de la synchronisation des pilotes...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Rafraîchir les données pour s'assurer qu'on a les derniers pilotes
        console.log('🔄 Rafraîchissement des données après sauvegarde des pilotes...');
        await refreshData();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Étape 2: Créer/Sauvegarder les courses une par une
      console.log('🏁 Création/Sauvegarde des courses...');
      
      for (let i = 0; i < newRaces.length; i++) {
        const race = newRaces[i];
        console.log(`🏁 Traitement course ${i + 1}/${newRaces.length}: ${race.name}`);
        
        try {
          // Créer la course (nouveau ou existant) - saveRace gère automatiquement la création
          console.log(`💾 Création de la course: ${race.name} avec ${race.results.length} résultats`);
          await saveRace(race);
          console.log(`✅ Course créée/sauvegardée avec succès: ${race.name}`);
          
          // Délai entre chaque course
          if (i < newRaces.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (raceError) {
          console.error(`❌ Erreur lors de la création de la course ${race.name}:`, raceError);
          
          // Si c'est une erreur de pilotes manquants, on fait un dernier essai après refresh
          if (raceError instanceof Error && raceError.message.includes('Pilotes manquants')) {
            console.log('🔄 Tentative de récupération - Rafraîchissement et nouvel essai...');
            await refreshData();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            try {
              await saveRace(race);
              console.log(`✅ Course créée avec succès après retry: ${race.name}`);
            } catch (retryError) {
              console.error(`❌ Échec définitif pour la course ${race.name}:`, retryError);
              throw new Error(`Impossible de créer la course ${race.name} même après retry: ${retryError instanceof Error ? retryError.message : 'Erreur inconnue'}`);
            }
          } else {
            throw new Error(`Impossible de créer la course ${race.name}: ${raceError instanceof Error ? raceError.message : 'Erreur inconnue'}`);
          }
        }
      }

      // Rafraîchissement final
      console.log('🔄 Rafraîchissement final des données...');
      await refreshData();

      console.log('🎉 Import terminé avec succès !');
      toast({
        title: "Import réussi",
        description: `${newRaces.length} course(s) créée(s) et ${newDriversToSave.length} nouveau(x) pilote(s) importé(s).`,
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

  return { handleImport };
};
