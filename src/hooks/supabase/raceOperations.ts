
import { Race } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateRaceData } from './raceValidation';
import { deleteExistingResults, saveRaceResults } from './raceResultsOperations';
import { createRaceInDatabase, updateRaceInDatabase, deleteRaceFromDatabase, findExistingRace } from './raceDatabaseOperations';

export const createRaceOperations = (toast: ReturnType<typeof useToast>['toast'], loadData: () => Promise<void>, championshipId?: string) => {
  
  // Fonction pour sauvegarder automatiquement le classement APRÈS une modification de type de course
  const autoSaveStandingsAfterTypeChange = async (raceId: string, newType: string) => {
    try {
      if (championshipId) {
        console.log('💾 AUTO-SAVE: Sauvegarde du classement après modification de type vers', newType);
        
        // Sauvegarder le classement actuel après la modification et le rechargement
        const { error } = await supabase.rpc('save_current_standings_as_previous', {
          p_championship_id: championshipId,
          p_save_name: `Après modification de type vers ${newType}`
        });
        
        if (error) {
          console.error('❌ Erreur lors de la sauvegarde automatique:', error);
        } else {
          console.log('✅ AUTO-SAVE: Classement sauvegardé avec succès');
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde automatique:', error);
    }
  };

  const saveRace = async (race: Omit<Race, 'id' | 'results'> | Race) => {
    try {
      console.log('💾 Sauvegarde de la course:', race.name, { championshipId });
      
      // Validate race data
      validateRaceData(race);
      
      let raceId: string;
      let typeChanged = false;
      
      // Si la course a un ID, c'est une mise à jour
      if ('id' in race && race.id) {
        console.log('🔄 Mise à jour de la course existante:', race.id);
        
        // Vérifier si le type de course change pour sauvegarde automatique après
        const { data: existingRace } = await supabase
          .from('races')
          .select('type')
          .eq('id', race.id)
          .single();
        
        typeChanged = existingRace ? existingRace.type !== race.type : false;
        
        await updateRaceInDatabase(race, championshipId);
        raceId = race.id;
        
        // Supprimer les anciens résultats avant d'ajouter les nouveaux
        if ('results' in race && race.results.length > 0) {
          console.log('🗑️ Suppression des anciens résultats...');
          await deleteExistingResults(raceId);
        }
      } else {
        // Sinon, vérifier si une course avec le même nom et date existe déjà
        const existingRace = await findExistingRace(race.name, race.date);
        
        if (existingRace) {
          console.log('🔄 Course existante trouvée, mise à jour:', existingRace.id);
          raceId = existingRace.id;
          
          // Supprimer les anciens résultats avant d'ajouter les nouveaux
          if ('results' in race && race.results.length > 0) {
            console.log('🗑️ Suppression des anciens résultats...');
            await deleteExistingResults(raceId);
          }
        } else {
          console.log('🆕 Création d\'une nouvelle course:', race.name);
          raceId = await createRaceInDatabase({
            name: race.name,
            date: race.date,
            endDate: race.endDate,
            organizer: race.organizer,
            type: race.type,
            championshipId: championshipId || race.championshipId
          }, championshipId);
        }
      }

      // Insert race results if they exist
      if ('results' in race && race.results.length > 0) {
        console.log('📊 Ajout des résultats à la course...');
        await saveRaceResults(raceId, race.results);
      }

      console.log('✅ Course et résultats sauvegardés avec succès');
      
      // Toujours recharger les données après une sauvegarde réussie
      console.log('🔄 Appel de loadData() pour rafraîchir les données...');
      await loadData();
      console.log('✅ loadData() terminé, données rafraîchies');
      
      // Si le type a changé, sauvegarder automatiquement les nouveaux standings
      if ('id' in race && race.id && typeChanged) {
        console.log('🔄 Type de course modifié, sauvegarde automatique des standings...');
        await autoSaveStandingsAfterTypeChange(race.id, race.type);
      }
      
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
