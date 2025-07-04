
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
      existingDrivers: drivers.length
    });
    
    try {
      // Étape 1: Créer tous les pilotes manquants
      const missingDrivers = newDrivers.filter(newDriver => 
        !drivers.find(existingDriver => existingDriver.id === newDriver.id)
      );

      console.log('👤 Pilotes manquants à créer:', missingDrivers.length);
      
      if (missingDrivers.length > 0) {
        console.log('💾 Création des pilotes manquants...');
        
        for (let i = 0; i < missingDrivers.length; i++) {
          const driver = missingDrivers[i];
          console.log(`💾 Création pilote ${i + 1}/${missingDrivers.length}: ${driver.name} (ID: ${driver.id.slice(0, 8)}...)`);
          
          try {
            await saveDriver(driver);
            console.log(`✅ Pilote créé: ${driver.name}`);
            
            // Délai entre chaque création
            if (i < missingDrivers.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (driverError) {
            console.error(`❌ Erreur lors de la création du pilote ${driver.name}:`, driverError);
            console.log(`⚠️ Passage au pilote suivant...`);
          }
        }

        // Attendre que les pilotes soient bien synchronisés avec plusieurs tentatives
        console.log('⏳ Attente de la synchronisation des pilotes...');
        let retryCount = 0;
        const maxRetries = 5;
        let currentDriversCount = drivers.length;
        
        while (retryCount < maxRetries && currentDriversCount < drivers.length + missingDrivers.length) {
          console.log(`🔄 Tentative de synchronisation ${retryCount + 1}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          await refreshData();
          
          // Vérifier le nombre de pilotes après refresh
          // Note: nous ne pouvons pas accéder directement au nouveau nombre ici
          // mais le refreshData() va mettre à jour l'état parent
          retryCount++;
        }
        
        console.log('✅ Synchronisation des pilotes terminée');
      }

      // Étape 2: Traiter les courses une par une
      console.log('🏁 Traitement des courses...');
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < newRaces.length; i++) {
        const race = newRaces[i];
        console.log(`🏁 Traitement course ${i + 1}/${newRaces.length}: ${race.name}`);
        console.log(`📊 Nombre de résultats: ${race.results.length}`);
        
        try {
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
          console.log(`⚠️ Passage à la course suivante...`);
          continue;
        }
      }

      // Rafraîchissement final
      console.log('🔄 Rafraîchissement final des données...');
      await refreshData();
      
      // Attendre que l'interface se mette à jour
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('🎉 Import terminé !', { successCount, errorCount, driversCreated: missingDrivers.length });
      
      const totalDriversMessage = missingDrivers.length > 0 ? ` et ${missingDrivers.length} nouveau(x) pilote(s) créé(s)` : '';
      
      if (errorCount === 0) {
        toast({
          title: "Import réussi",
          description: `${successCount} course(s) importée(s) avec succès${totalDriversMessage}.`,
        });
      } else {
        toast({
          title: "Import partiellement réussi",
          description: `${successCount} course(s) importée(s) avec succès, ${errorCount} erreur(s)${totalDriversMessage}. Vérifiez les données.`,
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
