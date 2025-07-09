
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
  return newDrivers.filter(newDriver => 
    !existingDrivers.find(existingDriver => 
      existingDriver.name.toLowerCase() === newDriver.name.toLowerCase()
    )
  );
};

export const logImportSummary = (
  successCount: number,
  errorCount: number,
  driversCreated: number
) => {
  console.log('🎉 Import terminé !', { successCount, errorCount, driversCreated });
};
