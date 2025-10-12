
import { Driver } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';

export const createMissingDrivers = async (
  missingDrivers: Driver[],
  saveDriver: (driver: Driver) => Promise<string>,
  refreshData: () => Promise<void>,
  toast: ReturnType<typeof useToast>['toast']
) => {
  if (missingDrivers.length === 0) {
    console.log('👤 Aucun pilote manquant à créer');
    return { totalCreated: 0, totalErrors: 0 };
  }

  console.log('👤 Pilotes manquants à créer:', missingDrivers.length);
  console.log('💾 Création des pilotes manquants...');
  
  // Créer les pilotes par très petits lots pour une meilleure fiabilité
  const batchSize = 3;
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
        const actualDriverId = await saveDriver(driver);
        console.log(`✅ Pilote créé/mis à jour: ${driver.name} - ID réel: ${actualDriverId.slice(0, 8)}...`);
        
        // Mettre à jour l'ID du pilote dans l'objet pour que les résultats utilisent le bon ID
        driver.id = actualDriverId;
        
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
  await performDriverPropagation(refreshData);

  return { totalCreated, totalErrors };
};

const performDriverPropagation = async (refreshData: () => Promise<void>) => {
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
};
