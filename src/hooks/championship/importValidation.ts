
import { Driver, Race } from '@/types/championship';

export const validateImportData = (newRaces: Race[], newDrivers: Driver[]) => {
  console.log('🚀 Démarrage du processus d\'import...');
  console.log('📊 Données à importer:', {
    races: newRaces.length,
    totalDrivers: newDrivers.length
  });

  if (newRaces.length === 0) {
    throw new Error('Aucune course à importer');
  }

  if (newDrivers.length === 0) {
    throw new Error('Aucun pilote trouvé dans les données');
  }
};

export const findMissingDrivers = (newDrivers: Driver[], existingDrivers: Driver[]): Driver[] => {
  console.log('🔍 [FIND_MISSING] Recherche de pilotes manquants...');
  console.log('🔍 [FIND_MISSING] Nouveaux pilotes:', newDrivers.length);
  console.log('🔍 [FIND_MISSING] Pilotes existants:', existingDrivers.length);
  
  const missing = newDrivers.filter(newDriver => {
    // Normaliser les noms (trim + lowercase) pour comparaison robuste
    const normalizedNewName = newDriver.name.trim().toLowerCase();
    const exists = existingDrivers.find(existingDriver => 
      existingDriver.name.trim().toLowerCase() === normalizedNewName
    );
    
    if (!exists) {
      console.log(`➕ [FIND_MISSING] Pilote manquant trouvé: ${newDriver.name}`);
    }
    
    return !exists;
  });
  
  console.log(`📊 [FIND_MISSING] Total pilotes manquants: ${missing.length}`);
  return missing;
};

export const logImportSummary = (
  successCount: number,
  errorCount: number,
  driversCreated: number
) => {
  console.log('🎉 Import terminé !', { successCount, errorCount, driversCreated });
};
