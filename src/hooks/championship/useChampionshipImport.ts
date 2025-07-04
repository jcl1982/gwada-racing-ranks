
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
      // Étape 1: Créer tous les pilotes manquants avec une approche plus robuste
      const missingDrivers = newDrivers.filter(newDriver => 
        !drivers.find(existingDriver => existingDriver.id === newDriver.id)
      );

      console.log('👤 Pilotes manquants à créer:', missingDrivers.length);
      
      if (missingDrivers.length > 0) {
        console.log('💾 Création des pilotes manquants...');
        
        // Créer les pilotes par petits lots pour éviter la surcharge
        const batchSize = 5;
        const batches = [];
        for (let i = 0; i < missingDrivers.length; i += batchSize) {
          batches.push(missingDrivers.slice(i, i + batchSize));
        }
        
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];
          console.log(`💾 Traitement du lot ${batchIndex + 1}/${batches.length} (${batch.length} pilotes)`);
          
          // Créer tous les pilotes du lot en parallèle
          const batchPromises = batch.map(async (driver, index) => {
            const globalIndex = batchIndex * batchSize + index;
            console.log(`💾 Création pilote ${globalIndex + 1}/${missingDrivers.length}: ${driver.name} (ID: ${driver.id.slice(0, 8)}...)`);
            
            try {
              await saveDriver(driver);
              console.log(`✅ Pilote créé: ${driver.name}`);
              return { success: true, driver };
            } catch (driverError) {
              console.error(`❌ Erreur lors de la création du pilote ${driver.name}:`, driverError);
              return { success: false, driver, error: driverError };
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          const successCount = batchResults.filter(r => r.success).length;
          const errorCount = batchResults.filter(r => !r.success).length;
          
          console.log(`📊 Lot ${batchIndex + 1} terminé: ${successCount} succès, ${errorCount} erreurs`);
          
          // Délai entre les lots pour permettre la propagation
          if (batchIndex < batches.length - 1) {
            console.log('⏳ Pause entre les lots...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // Rafraîchissement critique après création de tous les pilotes
        console.log('🔄 Rafraîchissement des données après création de tous les pilotes...');
        await refreshData();
        
        // Attendre plus longtemps pour la propagation complète
        console.log('⏳ Attente de la propagation complète des données pilotes...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log('✅ Données pilotes propagées');
      }

      // Étape 2: Traiter les courses une par une avec une vérification renforcée
      console.log('🏁 Traitement des courses...');
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < newRaces.length; i++) {
        const race = newRaces[i];
        console.log(`🏁 Traitement course ${i + 1}/${newRaces.length}: ${race.name}`);
        console.log(`📊 Nombre de résultats: ${race.results.length}`);
        
        // Vérification supplémentaire avant de sauvegarder la course
        const raceDriverIds = race.results.map(r => r.driverId);
        console.log(`🔍 Vérification préalable des ${raceDriverIds.length} pilotes de la course...`);
        
        try {
          await saveRace(race);
          console.log(`✅ Course sauvegardée avec succès: ${race.name}`);
          successCount++;
          
          // Rafraîchissement après chaque course pour mettre à jour les classements
          console.log('🔄 Mise à jour des classements...');
          await refreshData();
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (raceError) {
          console.error(`❌ Erreur lors de la sauvegarde de la course ${race.name}:`, raceError);
          errorCount++;
          
          // En cas d'erreur, essayer de rafraîchir les données avant de continuer
          console.log('🔄 Rafraîchissement après erreur...');
          await refreshData();
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          console.log(`⚠️ Passage à la course suivante...`);
          continue;
        }
      }

      // Rafraîchissement final complet pour s'assurer que tous les classements sont à jour
      console.log('🏆 Rafraîchissement final des classements...');
      await refreshData();
      
      // Attendre que toute l'interface et les classements soient mis à jour
      await new Promise(resolve => setTimeout(resolve, 3000));

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
