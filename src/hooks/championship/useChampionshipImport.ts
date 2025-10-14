
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
      
      // Étape 1: Créer une map complète TEMP_ID → REAL_ID pour TOUS les pilotes
      console.log('🗺️ [IMPORT] Construction de la map complète des IDs...');
      console.log(`🗺️ [IMPORT] Pilotes dans newDrivers: ${newDrivers.length}`);
      console.log(`🗺️ [IMPORT] Pilotes dans drivers (existants): ${drivers.length}`);
      
      const completeIdMap = new Map<string, string>();
      
      // D'abord, mapper les pilotes existants (leurs IDs temporaires du Excel → IDs réels de la DB)
      console.log('🗺️ [IMPORT] === Mapping des pilotes existants ===');
      newDrivers.forEach((newDriver, index) => {
        console.log(`🔍 [IMPORT] Recherche pilote ${index + 1}/${newDrivers.length}: "${newDriver.name}" (Rôle: ${newDriver.driverRole}, ChampID: ${newDriver.championshipId?.slice(0, 8)}..., TempID: ${newDriver.id.slice(0, 8)}...)`);
        
        const existingDriver = drivers.find(d => {
          const normalizedNewName = newDriver.name.trim().toLowerCase()
            .replace(/\s+/g, ' ')
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const normalizedExistingName = d.name.trim().toLowerCase()
            .replace(/\s+/g, ' ')
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          
          const nameMatch = normalizedNewName === normalizedExistingName;
          const championshipMatch = d.championshipId === newDriver.championshipId;
          const roleMatch = d.driverRole === newDriver.driverRole;
          
          if (normalizedNewName === normalizedExistingName) {
            console.log(`  🔎 Candidat: "${d.name}" (Rôle: ${d.driverRole}, ChampID: ${d.championshipId?.slice(0, 8)}...) - NameMatch: ${nameMatch}, ChampMatch: ${championshipMatch}, RoleMatch: ${roleMatch}`);
          }
          
          return nameMatch && championshipMatch && roleMatch;
        });
        
        if (existingDriver) {
          console.log(`  ✅ [IMPORT] Pilote existant mappé: "${newDriver.name}" (${newDriver.driverRole}) - Temp ID: ${newDriver.id.slice(0, 8)}... → Real ID: ${existingDriver.id.slice(0, 8)}...`);
          completeIdMap.set(newDriver.id, existingDriver.id);
        } else {
          console.log(`  ⚠️ [IMPORT] Pilote NON trouvé dans les existants (sera créé): "${newDriver.name}" (${newDriver.driverRole})`);
        }
      });
      
      // Étape 2: Créer tous les pilotes manquants
      const missingDrivers = findMissingDrivers(newDrivers, drivers);
      const { totalCreated, totalErrors, idMap } = await createMissingDrivers(
        missingDrivers,
        saveDriver,
        refreshData,
        toast
      );
      
      // Ajouter les nouveaux pilotes créés à la map complète
      idMap.forEach((realId, tempId) => {
        console.log(`  ➕ Nouveau pilote mappé: Temp ID: ${tempId.slice(0, 8)}... → Real ID: ${realId.slice(0, 8)}...`);
        completeIdMap.set(tempId, realId);
      });
      
      console.log(`🗺️ [IMPORT] Map complète: ${completeIdMap.size} correspondances totales`);

      // Étape 3: Mettre à jour TOUS les IDs des pilotes dans les résultats de course
      console.log('🔄 [IMPORT] Mise à jour des IDs des pilotes dans les résultats de course...');
      let updatedCount = 0;
      let notFoundCount = 0;
      
      newRaces.forEach((race, raceIndex) => {
        race.results.forEach((result, resultIndex) => {
          const realId = completeIdMap.get(result.driverId);
          if (realId) {
            console.log(`  ✅ Course "${race.name}", Résultat #${resultIndex + 1}: ${result.driverId.slice(0, 8)}... → ${realId.slice(0, 8)}...`);
            result.driverId = realId;
            updatedCount++;
          } else {
            console.error(`  ❌ ERREUR: ID introuvable pour le résultat #${resultIndex + 1} de "${race.name}" - ID: ${result.driverId.slice(0, 8)}...`);
            notFoundCount++;
          }
        });
      });
      
      console.log(`✅ [IMPORT] ${updatedCount} références de pilotes mises à jour dans les courses`);
      if (notFoundCount > 0) {
        console.error(`❌ [IMPORT] ${notFoundCount} références de pilotes NON TROUVÉES!`);
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
