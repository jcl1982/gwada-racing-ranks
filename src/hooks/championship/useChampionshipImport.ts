
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
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (driverError) {
            console.error(`❌ Erreur lors de la sauvegarde du pilote ${driver.name}:`, driverError);
            throw new Error(`Impossible de sauvegarder le pilote ${driver.name}: ${driverError instanceof Error ? driverError.message : 'Erreur inconnue'}`);
          }
        }

        // Attendre que les pilotes soient bien synchronisés
        console.log('⏳ Attente de la synchronisation des pilotes...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('🔄 Rafraîchissement des données après sauvegarde des pilotes...');
        await refreshData();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Étape 2: Traiter les courses une par une
      console.log('🏁 Traitement des courses...');
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < newRaces.length; i++) {
        const race = newRaces[i];
        console.log(`🏁 Traitement course ${i + 1}/${newRaces.length}: ${race.name}`);
        
        try {
          console.log(`💾 Sauvegarde de la course: ${race.name} avec ${race.results.length} résultats`);
          await saveRace(race);
          console.log(`✅ Course sauvegardée avec succès: ${race.name}`);
          successCount++;
          
          // Délai entre chaque course
          if (i < newRaces.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (raceError) {
          console.error(`❌ Erreur lors de la sauvegarde de la course ${race.name}:`, raceError);
          errorCount++;
          
          // Continuer avec les autres courses même en cas d'erreur
          console.log(`⚠️ Passage à la course suivante...`);
          continue;
        }
      }

      // Rafraîchissement final
      console.log('🔄 Rafraîchissement final des données...');
      await refreshData();
      
      // Attendre que l'interface se mette à jour
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('🎉 Import terminé !', { successCount, errorCount });
      
      if (errorCount === 0) {
        toast({
          title: "Import réussi",
          description: `${successCount} course(s) importée(s) avec succès et ${newDriversToSave.length} nouveau(x) pilote(s) ajouté(s).`,
        });
      } else {
        toast({
          title: "Import partiellement réussi",
          description: `${successCount} course(s) importée(s) avec succès, ${errorCount} erreur(s). Vérifiez les données.`,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('💥 Erreur critique lors de l\'import:', error);
      
      // Toujours rafraîchir les données même en cas d'erreur
      console.log('🔄 Rafraîchissement des données après erreur...');
      await refreshData();
      
      toast({
        title: "Erreur d'import",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'import.",
        variant: "destructive"
      });
    }
  };

  return { handleImport };
};
