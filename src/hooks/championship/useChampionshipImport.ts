
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

        // Rafraîchissement critique après création des pilotes
        console.log('🔄 Rafraîchissement des données après création des pilotes...');
        await refreshData();
        
        // Attendre que l'interface soit mise à jour
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('✅ Données pilotes rafraîchies');
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
          
          // Rafraîchissement après chaque course pour mettre à jour les classements
          console.log('🔄 Mise à jour des classements...');
          await refreshData();
          await new Promise(resolve => setTimeout(resolve, 800));
          
        } catch (raceError) {
          console.error(`❌ Erreur lors de la sauvegarde de la course ${race.name}:`, raceError);
          errorCount++;
          console.log(`⚠️ Passage à la course suivante...`);
          continue;
        }
      }

      // Rafraîchissement final complet pour s'assurer que tous les classements sont à jour
      console.log('🏆 Rafraîchissement final des classements...');
      await refreshData();
      
      // Attendre que toute l'interface et les classements soient mis à jour
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('🎉 Import terminé !', { successCount, errorCount, driversCreated: missingDrivers.length });
      
      const totalDriversMessage = missingDrivers.length > 0 ? ` et ${missingDrivers.length} nouveau(x) pilote(s) créé(s)` : '';
      
      if (errorCount === 0) {
        toast({
          title: "Import réussi",
          description: `${successCount} course(s) importée(s) avec succès${totalDriversMessage}. Les classements ont été mis à jour.`,
        });
      } else {
        toast({
          title: "Import partiellement réussi", 
          description: `${successCount} course(s) importée(s) avec succès, ${errorCount} erreur(s)${totalDriversMessage}. Les classements ont été mis à jour.`,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('💥 Erreur critique lors de l\'import:', error);
      
      // Toujours rafraîchir les données même en cas d'erreur pour mettre à jour les classements
      console.log('🔄 Rafraîchissement des classements après erreur...');
      await refreshData();
      
      toast({
        title: "Erreur d'import",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'import. Les classements ont été partiellement mis à jour.",
        variant: "destructive"
      });
    }
  };

  return { handleImport };
};
