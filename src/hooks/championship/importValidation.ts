
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
  console.log('🔍 [FIND_MISSING] ===== RECHERCHE DES PILOTES MANQUANTS =====');
  console.log('🔍 [FIND_MISSING] Pilotes de l\'import (newDrivers):', newDrivers.length);
  console.log('🔍 [FIND_MISSING] Pilotes existants (existingDrivers):', existingDrivers.length);
  
  console.log('🔍 [FIND_MISSING] Liste des pilotes existants:');
  existingDrivers.forEach((d, i) => {
    console.log(`  ${i + 1}. "${d.name}" (ID: ${d.id.substring(0, 8)}...)`);
  });
  
  console.log('🔍 [FIND_MISSING] Comparaison en cours...');
  
  const missing = newDrivers.filter(newDriver => {
    // Normaliser les noms (trim + lowercase) pour comparaison robuste
    const normalizedNewName = newDriver.name.trim().toLowerCase();
    const exists = existingDrivers.find(existingDriver => 
      existingDriver.name.trim().toLowerCase() === normalizedNewName
    );
    
    if (!exists) {
      console.log(`  ➕ Pilote manquant: "${newDriver.name}" (ID: ${newDriver.id.substring(0, 8)}..., sera créé)`);
    } else {
      console.log(`  ✅ Pilote existe déjà: "${newDriver.name}" → trouvé: "${exists.name}" (ID: ${exists.id.substring(0, 8)}...)`);
    }
    
    return !exists;
  });
  
  console.log('🔍 [FIND_MISSING] ===== RÉSULTAT =====');
  console.log(`🔍 [FIND_MISSING] Pilotes à créer: ${missing.length}`);
  if (missing.length > 0) {
    console.log('🔍 [FIND_MISSING] Liste des pilotes à créer:');
    missing.forEach((d, i) => {
      console.log(`  ${i + 1}. "${d.name}" (ID: ${d.id.substring(0, 8)}...)`);
    });
  }
  console.log('🔍 [FIND_MISSING] ====================');
  
  return missing;
};

export const logImportSummary = (
  successCount: number,
  errorCount: number,
  driversCreated: number
) => {
  console.log('🎉 Import terminé !', { successCount, errorCount, driversCreated });
};
