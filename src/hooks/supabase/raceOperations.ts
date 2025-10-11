
import { Race } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateRaceData } from './raceValidation';
import { deleteExistingResults, saveRaceResults } from './raceResultsOperations';
import { createRaceInDatabase, updateRaceInDatabase, deleteRaceFromDatabase, findExistingRace } from './raceDatabaseOperations';

export const createRaceOperations = (toast: ReturnType<typeof useToast>['toast'], loadData: () => Promise<void>, championshipId?: string) => {
  
  // Fonction pour sauvegarder automatiquement le classement avant une modification de type de course
  const autoSaveStandingsBeforeTypeChange = async (raceId: string, newType: string) => {
    try {
      // Vérifier si le type de course change
      const { data: existingRace } = await supabase
        .from('races')
        .select('type')
        .eq('id', raceId)
        .single();
      
      if (existingRace && existingRace.type !== newType && championshipId) {
        console.log('🔄 Changement de type de course détecté:', existingRace.type, '→', newType);
        console.log('💾 AUTO-SAVE: Sauvegarde du classement avant modification...');
        
        // Sauvegarder le classement actuel avant la modification
        const { error } = await supabase.rpc('save_current_standings_as_previous', {
          p_championship_id: championshipId,
          p_save_name: `Avant modification de type (${existingRace.type} → ${newType})`
        });
        
        if (error) {
          console.error('❌ Erreur lors de la sauvegarde automatique:', error);
        } else {
          console.log('✅ AUTO-SAVE: Classement sauvegardé avec succès');
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du type de course:', error);
    }
  };
  const saveRace = async (race: Omit<Race, 'id' | 'results'> | Race) => {
    try {
      console.log('💾 Sauvegarde de la course:', race.name, { championshipId });
      
      // Validate race data
      validateRaceData(race);
      
      let raceId: string;
      
      // Si la course a un ID, c'est une mise à jour
      if ('id' in race && race.id) {
        console.log('🔄 Mise à jour de la course existante:', race.id);
        
        // Auto-sauvegarder si le type de course change
        await autoSaveStandingsBeforeTypeChange(race.id, race.type);
        
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
