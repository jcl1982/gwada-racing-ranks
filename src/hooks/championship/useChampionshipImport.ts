
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

        // Attendre que les pilotes soient bien synchronisés et rafraîchir les données
        console.log('⏳ Attente de la synchronisation des pilotes...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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
          // Créer la course
          console.log(`💾 Création de la course: ${race.name} avec ${race.results.length} résultats`);
          await saveRace(race);
          console.log(`✅ Course créée/sauvegardée avec succès: ${race.name}`);
          
          // Rafraîchir les données après chaque course pour mettre à jour les classements
          console.log('🔄 Rafraîchissement des données après création de la course...');
          await refreshData();
          
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
              
              // Rafraîchir à nouveau après le retry réussi
              await refreshData();
            } catch (retryError) {
              console.error(`❌ Échec définitif pour la course ${race.name}:`, retryError);
              // Ne pas arrêter tout l'import pour une course qui échoue
              console.log(`⚠️ Passage à la course suivante...`);
              continue;
            }
          } else {
            console.log(`⚠️ Erreur non critique, passage à la course suivante: ${raceError instanceof Error ? raceError.message : 'Erreur inconnue'}`);
            continue;
          }
        }
      }

      // Rafraîchissement final pour s'assurer que tous les classements sont à jour
      console.log('🔄 Rafraîchissement final des données...');
      await refreshData();
      
      // Attendre un peu pour que l'interface se mette à jour
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('🎉 Import terminé avec succès !');
      toast({
        title: "Import réussi",
        description: `${newRaces.length} course(s) importée(s) et ${newDriversToSave.length} nouveau(x) pilote(s) ajouté(s). Les classements ont été mis à jour.`,
      });
      
    } catch (error) {
      console.error('💥 Erreur critique lors de l\'import:', error);
      
      // Toujours rafraîchir les données même en cas d'erreur partielle
      console.log('🔄 Rafraîchissement des données après erreur...');
      await refreshData();
      
      toast({
        title: "Import partiellement réussi",
        description: "Certaines données ont pu être importées. Vérifiez les classements et recommencez si nécessaire.",
        variant: "destructive"
      });
    }
  };

  return { handleImport };
};
