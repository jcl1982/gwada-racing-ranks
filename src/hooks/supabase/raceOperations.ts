
import { Race } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateRaceData } from './raceValidation';
import { deleteExistingResults, saveRaceResults } from './raceResultsOperations';
import { createRaceInDatabase, updateRaceInDatabase, deleteRaceFromDatabase, findExistingRace } from './raceDatabaseOperations';

export const createRaceOperations = (toast: ReturnType<typeof useToast>['toast'], loadData: () => Promise<void>, championshipId?: string) => {
  
  // Fonction pour sauvegarder automatiquement le classement AVANT une modification
  const autoSaveStandingsBeforeChange = async (actionDescription: string) => {
    try {
      if (championshipId) {
        console.log('💾 AUTO-SAVE: Sauvegarde du classement avant', actionDescription);
        
        // Sauvegarder le classement actuel AVANT la modification
        const { error } = await supabase.rpc('save_current_standings_as_previous', {
          p_championship_id: championshipId,
          p_save_name: `Avant ${actionDescription}`
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
      let existingRaceName: string | undefined;
      
      // Si la course a un ID, c'est une mise à jour
      if ('id' in race && race.id) {
        console.log('🔄 Mise à jour de la course existante:', race.id);
        
        // Vérifier si le type de course change pour sauvegarde automatique
        const { data: existingRace } = await supabase
          .from('races')
          .select('type, name')
          .eq('id', race.id)
          .single();
        
        typeChanged = existingRace ? existingRace.type !== race.type : false;
        existingRaceName = existingRace?.name;
        
        // Sauvegarder AVANT la modification si le type change
        if (typeChanged && existingRace) {
          await autoSaveStandingsBeforeChange(
            `modification de type de "${existingRace.name}" (${existingRace.type} → ${race.type})`
          );
        }
        
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
          // Sauvegarder AVANT la création d'une nouvelle course
          await autoSaveStandingsBeforeChange(`ajout de la course "${race.name}"`);
          
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
      
      // Sauvegarder APRÈS la modification pour établir le nouvel état comme référence
      if (typeChanged && existingRaceName && championshipId) {
        console.log('💾 AUTO-SAVE: Sauvegarde du nouvel état après modification de type');
        const { error } = await supabase.rpc('save_current_standings_as_previous', {
          p_championship_id: championshipId,
          p_save_name: `Nouvel état après modification de "${existingRaceName}"`
        });
        
        if (error) {
          console.error('❌ Erreur lors de la sauvegarde du nouvel état:', error);
        } else {
          console.log('✅ AUTO-SAVE: Nouvel état sauvegardé comme référence');
        }
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
