
import { Driver, Race } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import { createMissingDrivers } from './importDrivers';
import { processRaces } from './importRaces';
import { validateImportData, findMissingDrivers, logImportSummary } from './importValidation';
import { generateSuccessMessage, generateErrorMessage, performFinalRefresh } from './importUtils';

export const useChampionshipImport = (
  drivers: Driver[],
  saveDriver: (driver: Driver) => Promise<void>,
  saveRace: (race: Omit<Race, 'id' | 'results'> | Race) => Promise<void>,
  refreshData: () => Promise<void>,
  autoSaveStandings: () => Promise<void>
) => {
  const { toast } = useToast();

  const handleImport = async (newRaces: Race[], newDrivers: Driver[]) => {
    try {
      // Validation initiale
      validateImportData(newRaces, newDrivers);
      
      // Étape 1: Créer tous les pilotes manquants
      const missingDrivers = findMissingDrivers(newDrivers, drivers);
      const { totalCreated, totalErrors } = await createMissingDrivers(
        missingDrivers,
        saveDriver,
        refreshData,
        toast
      );

      // Étape 2: Traiter les courses
      const { successCount, errorCount } = await processRaces(
        newRaces,
        saveRace,
        refreshData,
        toast
      );

      // Rafraîchissement final complet - ATTEND la fin avant de continuer
      await performFinalRefresh(refreshData);

      // Sauvegarde automatique des positions pour l'évolution
      console.log('💾 Sauvegarde automatique des positions pour le tracking d\'évolution...');
      await autoSaveStandings();
      console.log('✅ Positions sauvegardées automatiquement');

      // Log du résumé
      logImportSummary(successCount, errorCount, totalCreated);
      
      // Affichage du toast de résultat
      const message = generateSuccessMessage(successCount, errorCount, totalCreated);
      toast(message);
      
      console.log('✅ Import complètement terminé - toutes les données sont synchronisées');
      
    } catch (error) {
      console.error('💥 Erreur critique lors de l\'import:', error);
      
      // Toujours rafraîchir les données même en cas d'erreur
      console.log('🔄 Rafraîchissement des classements après erreur...');
      await refreshData();
      
      const errorMessage = generateErrorMessage(error);
      toast(errorMessage);
    }
  };

  return { handleImport };
};
