
import { Race } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateRaceData } from './raceValidation';
import { deleteExistingResults, deleteResultsByCategory, deleteResultsByDriverRole, saveRaceResults } from './raceResultsOperations';
import { createRaceInDatabase, updateRaceInDatabase, deleteRaceFromDatabase, findExistingRace } from './raceDatabaseOperations';

export const createRaceOperations = (toast: ReturnType<typeof useToast>['toast'], loadData: () => Promise<void>, championshipId?: string) => {

  const saveRace = async (race: Omit<Race, 'id' | 'results'> | Race) => {
    try {
      console.log('💾 Sauvegarde de la course:', race.name, { championshipId });
      
      // Validate race data
      validateRaceData(race);
      
      let raceId: string;
      
      // Si la course a un ID, c'est une mise à jour
      if ('id' in race && race.id) {
        console.log('🔄 Mise à jour de la course existante:', race.id);
        
        await updateRaceInDatabase(race, championshipId);
        raceId = race.id;
        
        // Pour le karting avec catégories, supprimer uniquement les résultats de la catégorie concernée
        // Pour le rallye, supprimer uniquement les résultats du même rôle (pilote/copilote)
        if ('results' in race && race.results.length > 0) {
          const isKarting = race.type === 'karting';
          const isRallye = race.type === 'rallye';
          const category = race.results[0]?.category;
          
          if (isKarting && category) {
            console.log(`🗑️ Suppression des résultats de la catégorie "${category}"...`);
            await deleteResultsByCategory(raceId, category);
          } else if (isRallye) {
            // Pour le rallye, détecter le rôle des résultats à importer
            const firstDriverId = race.results[0]?.driverId;
            const { data: driverData, error: driverError } = await supabase
              .from('drivers')
              .select('driver_role')
              .eq('id', firstDriverId)
              .maybeSingle();
            
            if (driverError) {
              console.error('❌ Erreur lors de la récupération du driver_role:', driverError);
              console.log('🗑️ Suppression de tous les résultats par sécurité...');
              await deleteExistingResults(raceId);
            } else if (driverData?.driver_role) {
              console.log(`🗑️ Suppression des résultats des ${driverData.driver_role}s uniquement...`);
              await deleteResultsByDriverRole(raceId, driverData.driver_role);
            } else {
              console.warn('⚠️ Driver non trouvé, pas de suppression de résultats');
            }
          } else {
            console.log('🗑️ Suppression de tous les résultats...');
            await deleteExistingResults(raceId);
          }
        }
      } else {
        // Sinon, vérifier si une course avec le même nom, date et type existe déjà
        const finalChampionshipId = race.championshipId || championshipId;
        const existingRace = await findExistingRace(race.name, race.date, finalChampionshipId, race.type);
        
        if (existingRace) {
          console.log('⚠️ Course existante trouvée, ajout des résultats à la course existante:', existingRace.id);
          raceId = existingRace.id;
          
          // Pour le karting avec catégories, supprimer uniquement les résultats de la catégorie concernée
          // Pour le rallye, supprimer uniquement les résultats du même rôle (pilote/copilote)
          if ('results' in race && race.results.length > 0) {
            const isKarting = existingRace.type === 'karting';
            const isRallye = existingRace.type === 'rallye';
            const category = race.results[0]?.category;
            
            if (isKarting && category) {
              console.log(`🗑️ Suppression des résultats existants pour la catégorie "${category}"...`);
              await deleteResultsByCategory(raceId, category);
            } else if (isRallye) {
              // Pour le rallye, détecter le rôle des résultats à importer
              const firstDriverId = race.results[0]?.driverId;
              const { data: driverData, error: driverError } = await supabase
                .from('drivers')
                .select('driver_role')
                .eq('id', firstDriverId)
                .maybeSingle();
              
              if (driverError) {
                console.error('❌ Erreur lors de la récupération du driver_role:', driverError);
                console.log('🗑️ Suppression de tous les résultats par sécurité...');
                await deleteExistingResults(raceId);
              } else if (driverData?.driver_role) {
                console.log(`🗑️ Suppression des résultats des ${driverData.driver_role}s uniquement...`);
                await deleteResultsByDriverRole(raceId, driverData.driver_role);
              } else {
                console.warn('⚠️ Driver non trouvé, pas de suppression de résultats');
              }
            } else {
              console.log('🗑️ Suppression de tous les résultats...');
              await deleteExistingResults(raceId);
            }
          }
        } else {
          console.log('🆕 [SAVE_RACE] Création d\'une nouvelle course:', race.name);
          console.log('🔍 [SAVE_RACE] ChampionshipIds disponibles:', {
            'race.championshipId': race.championshipId,
            'context championshipId': championshipId,
            'sera utilisé': race.championshipId || championshipId
          });
          
          raceId = await createRaceInDatabase({
            name: race.name,
            date: race.date,
            endDate: race.endDate,
            organizer: race.organizer,
            type: race.type,
            championshipId: race.championshipId || championshipId
          }, race.championshipId || championshipId);
        }
      }

      // Insert race results if they exist
      console.log('🔍 [SAVE_RACE] Vérification des résultats...');
      console.log('🔍 [SAVE_RACE] "results" in race:', 'results' in race);
      
      if ('results' in race) {
        const raceWithResults = race as Race;
        console.log('🔍 [SAVE_RACE] race.results:', raceWithResults.results);
        console.log('🔍 [SAVE_RACE] race.results.length:', raceWithResults.results?.length);
        
        if (raceWithResults.results && raceWithResults.results.length > 0) {
          console.log(`📊 [SAVE_RACE] Ajout de ${raceWithResults.results.length} résultats à la course ${raceId}...`);
          console.log(`📊 [SAVE_RACE] Premier résultat - Position: ${raceWithResults.results[0].position}, Points: ${raceWithResults.results[0].points}`);
          await saveRaceResults(raceId, raceWithResults.results);
          console.log('✅ [SAVE_RACE] Résultats sauvegardés avec succès');
        } else {
          console.warn('⚠️ [SAVE_RACE] AUCUN RÉSULTAT À SAUVEGARDER pour cette course !');
        }
      } else {
        console.warn('⚠️ [SAVE_RACE] La course ne contient pas de propriété results');
      }

      console.log('✅ Course et résultats sauvegardés avec succès');
      
      // Toujours recharger les données après une sauvegarde réussie
      console.log('🔄 Appel de loadData() pour rafraîchir les données...');
      await loadData();
      console.log('✅ loadData() terminé, données rafraîchies');
      
      toast({
        title: 'id' in race && race.id ? "Course mise à jour" : "Course créée",
        description: 'id' in race && race.id ? "La course a été mise à jour avec succès." : "La course a été créée avec succès.",
      });
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la course:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error instanceof Error ? error.message : "Impossible de sauvegarder la course.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteRace = async (raceId: string) => {
    try {
      console.log('🗑️ Suppression de la course avec ID:', raceId);

      await deleteRaceFromDatabase(raceId);

      await loadData();
      toast({
        title: "Course supprimée",
        description: "La course a été supprimée avec succès.",
      });
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la course:', error);
      toast({
        title: "Erreur de suppression",
        description: error instanceof Error ? error.message : "Impossible de supprimer la course.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return { saveRace, deleteRace };
};
