
import { Driver, Race } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { convertSupabaseDriver } from '@/hooks/supabase/converters';
import { createMissingDrivers } from './importDrivers';
import { processRaces } from './importRaces';
import { validateImportData, findMissingDrivers, logImportSummary } from './importValidation';
import { generateSuccessMessage, generateErrorMessage, performFinalRefresh } from './importUtils';

export const useChampionshipImport = (
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
      
      // Détecter le championshipId depuis les courses à importer
      const targetChampionshipId = newRaces[0]?.championshipId;
      if (!targetChampionshipId) {
        throw new Error('Aucun championshipId trouvé dans les courses à importer');
      }
      
      console.log('🎯 [IMPORT] ChampionshipId cible:', targetChampionshipId);
      
      // Charger TOUS les drivers de ce championnat pour le mapping
      console.log('👥 [IMPORT] Chargement des drivers du championnat cible...');
      const { data: targetDriversData, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .eq('championship_id', targetChampionshipId)
        .order('name');
      
      if (driversError) {
        console.error('❌ [IMPORT] Erreur lors du chargement des drivers:', driversError);
        throw driversError;
      }
      
      const targetChampionshipDrivers: Driver[] = targetDriversData?.map(convertSupabaseDriver) || [];
      console.log('✅ [IMPORT] Drivers du championnat cible chargés:', targetChampionshipDrivers.length);
      console.log('👥 [IMPORT] Répartition:', {
        pilotes: targetChampionshipDrivers.filter(d => d.driverRole === 'pilote').length,
        copilotes: targetChampionshipDrivers.filter(d => d.driverRole === 'copilote').length
      });
      
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
      console.log(`🗺️ [IMPORT] Pilotes dans targetChampionshipDrivers (existants): ${targetChampionshipDrivers.length}`);
      
      // Afficher les noms des pilotes pour debug
      console.log('🗺️ [IMPORT] Liste des newDrivers:', newDrivers.map(d => `"${d.name}" (${d.driverRole})`));
      console.log('🗺️ [IMPORT] Liste des targetChampionshipDrivers:', targetChampionshipDrivers.map(d => `"${d.name}" (${d.driverRole})`));
      
      const completeIdMap = new Map<string, string>();
      
      // D'abord, mapper les pilotes existants (leurs IDs temporaires du Excel → IDs réels de la DB)
      console.log('🗺️ [IMPORT] === Mapping des pilotes existants ===');
      newDrivers.forEach((newDriver, index) => {
        console.log(`🔍 [IMPORT] Recherche pilote ${index + 1}/${newDrivers.length}: "${newDriver.name}" (Rôle: ${newDriver.driverRole}, ChampID: ${newDriver.championshipId?.slice(0, 8)}..., TempID: ${newDriver.id.slice(0, 8)}...)`);
        
        const existingDriver = targetChampionshipDrivers.find(d => {
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
      
      console.log(`🗺️ [IMPORT] Résultat du premier mapping: ${completeIdMap.size} correspondances trouvées`);
      
      // Étape 2: Créer tous les pilotes manquants
      const missingDrivers = findMissingDrivers(newDrivers, targetChampionshipDrivers);
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

      // Étape 4: Traiter les courses
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
