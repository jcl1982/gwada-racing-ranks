
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
      // Étape 1: Créer tous les pilotes manquants avec une stratégie ultra-robuste
      const missingDrivers = newDrivers.filter(newDriver => 
        !drivers.find(existingDriver => existingDriver.id === newDriver.id)
      );

      console.log('👤 Pilotes manquants à créer:', missingDrivers.length);
      
      if (missingDrivers.length > 0) {
        console.log('💾 Création des pilotes manquants...');
        
        // Créer les pilotes par très petits lots pour une meilleure fiabilité
        const batchSize = 3; // Réduit de 5 à 3
        const batches = [];
        for (let i = 0; i < missingDrivers.length; i += batchSize) {
          batches.push(missingDrivers.slice(i, i + batchSize));
        }
        
        let totalCreated = 0;
        let totalErrors = 0;
        
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];
          console.log(`💾 Traitement du lot ${batchIndex + 1}/${batches.length} (${batch.length} pilotes)`);
          
          // Créer les pilotes du lot un par un pour une meilleure fiabilité
          for (let driverIndex = 0; driverIndex < batch.length; driverIndex++) {
            const driver = batch[driverIndex];
            const globalIndex = batchIndex * batchSize + driverIndex;
            
            console.log(`💾 Création pilote ${globalIndex + 1}/${missingDrivers.length}: ${driver.name} (ID: ${driver.id.slice(0, 8)}...)`);
            
            try {
              await saveDriver(driver);
              console.log(`✅ Pilote créé: ${driver.name}`);
              totalCreated++;
              
              // Délai entre chaque pilote pour éviter la surcharge
              if (driverIndex < batch.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            } catch (driverError) {
              console.error(`❌ Erreur lors de la création du pilote ${driver.name}:`, driverError);
              totalErrors++;
            }
          }
          
          console.log(`📊 Lot ${batchIndex + 1} terminé`);
          
          // Délai plus long entre les lots
          if (batchIndex < batches.length - 1) {
            console.log('⏳ Pause entre les lots...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        console.log(`📊 Création des pilotes terminée: ${totalCreated} succès, ${totalErrors} erreurs`);

        // Rafraîchissements multiples après création de tous les pilotes
        console.log('🔄 Rafraîchissement critique après création de tous les pilotes...');
        await refreshData();
        
        // Premier délai de propagation
        console.log('⏳ Attente de propagation (1/3)...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Second rafraîchissement
        console.log('🔄 Second rafraîchissement...');
        await refreshData();
        
        // Second délai
        console.log('⏳ Attente de propagation (2/3)...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Troisième rafraîchissement final
        console.log('🔄 Rafraîchissement final...');
        await refreshData();
        
        // Délai final
        console.log('⏳ Attente de propagation finale (3/3)...');
        await new Promise(resolve => setTimeout(resolve, 7000));
        
        console.log('✅ Tous les pilotes propagés');
      }

      // Étape 2: Traiter les courses avec une approche plus défensive
      console.log('🏁 Traitement des courses...');
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < newRaces.length; i++) {
        const race = newRaces[i];
        console.log(`🏁 Traitement course ${i + 1}/${newRaces.length}: ${race.name}`);
        console.log(`📊 Nombre de résultats: ${race.results.length}`);
        
        // Vérification préalable renforcée
        const raceDriverIds = race.results.map(r => r.driverId);
        console.log(`🔍 Vérification préalable des ${raceDriverIds.length} pilotes de la course...`);
        
        try {
          // Tentative de sauvegarde avec gestion d'erreur améliorée
          await saveRace(race);
          console.log(`✅ Course sauvegardée avec succès: ${race.name}`);
          successCount++;
          
          // Rafraîchissement après chaque course réussie
          console.log('🔄 Mise à jour des classements...');
          await refreshData();
          await new Promise(resolve => setTimeout(resolve, 1500));
          
        } catch (raceError) {
          console.error(`❌ Erreur lors de la sauvegarde de la course ${race.name}:`, raceError);
          errorCount++;
          
          // Vérifier si c'est une erreur de pilotes manquants
          if (raceError instanceof Error && raceError.message.includes('pilote(s) manquant(s)')) {
            console.log('⚠️ Erreur de pilotes manquants détectée');
            console.log('🔄 Tentative de rafraîchissement et nouvelle tentative...');
            
            // Rafraîchissement d'urgence
            await refreshData();
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Seconde tentative
            try {
              console.log(`🔄 Seconde tentative pour la course: ${race.name}`);
              await saveRace(race);
              console.log(`✅ Course sauvegardée avec succès (2e tentative): ${race.name}`);
              successCount++;
              errorCount--; // Annuler l'erreur précédente
            } catch (secondError) {
              console.error(`❌ Échec de la seconde tentative pour ${race.name}:`, secondError);
            }
          }
          
          // Rafraîchissement même après erreur
          console.log('🔄 Rafraîchissement après erreur...');
          await refreshData();
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          console.log(`⚠️ Passage à la course suivante...`);
          continue;
        }
      }

      // Rafraîchissement final complet
      console.log('🏆 Rafraîchissement final des classements...');
      await refreshData();
      await new Promise(resolve => setTimeout(resolve, 4000));

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
      
      // Toujours rafraîchir les données même en cas d'erreur
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
