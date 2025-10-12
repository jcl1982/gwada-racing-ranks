
import { Driver, Race } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import { createMissingDrivers } from './importDrivers';
import { processRaces } from './importRaces';
import { validateImportData, findMissingDrivers, logImportSummary } from './importValidation';
import { generateSuccessMessage, generateErrorMessage, performFinalRefresh } from './importUtils';

export const useChampionshipImport = (
  drivers: Driver[],
  saveDriver: (driver: Driver) => Promise<string>,
  saveRace: (race: Omit<Race, 'id' | 'results'> | Race) => Promise<void>,
  refreshData: () => Promise<void>,
  autoSaveStandings: () => Promise<void>
) => {
  const { toast } = useToast();

  const handleImport = async (newRaces: Race[], newDrivers: Driver[]) => {
    try {
      // Validation initiale
      validateImportData(newRaces, newDrivers);
      
      // Sauvegarder AVANT l'import pour préserver les évolutions
      console.log('💾 [IMPORT] Sauvegarde du classement avant import...');
      try {
        await autoSaveStandings();
        console.log('✅ [IMPORT] Positions sauvegardées avant import');
      } catch (error) {
        console.error('❌ [IMPORT] Erreur lors de la sauvegarde avant import:', error);
      }
      
      // Étape 1: Créer tous les pilotes manquants
      const missingDrivers = findMissingDrivers(newDrivers, drivers);
      const { totalCreated, totalErrors, idMap } = await createMissingDrivers(
        missingDrivers,
        saveDriver,
        refreshData,
        toast
      );

      // Étape 2: Mettre à jour les IDs des pilotes dans les résultats de course
      if (idMap.size > 0) {
        console.log('🔄 [IMPORT] Mise à jour des IDs des pilotes dans les résultats de course...');
        let updatedCount = 0;
        
        newRaces.forEach((race, raceIndex) => {
          race.results.forEach((result, resultIndex) => {
            const realId = idMap.get(result.driverId);
            if (realId) {
              console.log(`  🔄 Course ${raceIndex + 1}, Résultat ${resultIndex + 1}: ${result.driverId.slice(0, 8)}... → ${realId.slice(0, 8)}...`);
              result.driverId = realId;
              updatedCount++;
            }
          });
        });
        
        console.log(`✅ [IMPORT] ${updatedCount} références de pilotes mises à jour dans les courses`);
      }

      // Étape 3: Traiter les courses
      const { successCount, errorCount } = await processRaces(
        newRaces,
        saveRace,
        refreshData,
        toast
      );

      // Rafraîchissement final complet - ATTEND la fin avant de continuer
      await performFinalRefresh(refreshData);

      // Log du résumé
      logImportSummary(successCount, errorCount, totalCreated);
      
      // Affichage du toast de résultat
      const message = generateSuccessMessage(successCount, errorCount, totalCreated);
      toast(message);
      
      console.log('✅ Import Excel terminé et données synchronisées');
      
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
