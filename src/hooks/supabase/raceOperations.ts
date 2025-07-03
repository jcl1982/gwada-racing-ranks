
import { supabase } from '@/integrations/supabase/client';
import { Race } from '@/types/championship';
import { isValidUUID } from './utils';
import { useToast } from '@/hooks/use-toast';

export const createRaceOperations = (toast: ReturnType<typeof useToast>['toast'], loadData: () => Promise<void>) => {
  const saveRace = async (race: Omit<Race, 'id' | 'results'> | Race) => {
    try {
      console.log('💾 Saving race:', race);
      let raceId: string;
      
      if ('id' in race) {
        // Validate UUID for existing race
        if (!isValidUUID(race.id)) {
          console.error('❌ Invalid UUID for race update:', race.id);
          throw new Error('ID de la course invalide');
        }

        const { error } = await supabase
          .from('races')
          .update({
            name: race.name,
            date: race.date,
            type: race.type,
            updated_at: new Date().toISOString()
          })
          .eq('id', race.id);

        if (error) {
          console.error('❌ Update race error:', error);
          throw error;
        }
        raceId = race.id;

        // Delete existing results
        const { error: deleteError } = await supabase
          .from('race_results')
          .delete()
          .eq('race_id', race.id);

        if (deleteError) {
          console.error('❌ Delete race results error:', deleteError);
          throw deleteError;
        }

        console.log('✅ Race updated successfully');
      } else {
        // Create new race
        const { data, error } = await supabase
          .from('races')
          .insert({
            name: race.name,
            date: race.date,
            type: race.type
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Insert race error:', error);
          throw error;
        }
        raceId = data.id;
        console.log('✅ Race created successfully:', data);
      }

      // Insert race results if they exist
      if ('results' in race && race.results.length > 0) {
        console.log('💾 Saving race results:', race.results.length, 'results');
        
        // Validate all driver IDs before inserting
        for (const result of race.results) {
          if (!isValidUUID(result.driverId)) {
            console.error('❌ Invalid driver UUID in race results:', result.driverId);
            throw new Error(`ID du pilote invalide dans les résultats: ${result.driverId}`);
          }
        }

        const { error: resultsError } = await supabase
          .from('race_results')
          .insert(
            race.results.map(result => ({
              race_id: raceId,
              driver_id: result.driverId,
              position: result.position,
              points: result.points,
              time: result.time,
              dnf: result.dnf || false
            }))
          );

        if (resultsError) {
          console.error('❌ Insert race results error:', resultsError);
          throw resultsError;
        }

        console.log('✅ Race results saved successfully');
      }

      await loadData();
      toast({
        title: "Course sauvegardée",
        description: "La course a été sauvegardée avec succès.",
      });
    } catch (error) {
      console.error('❌ Error saving race:', error);
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
      console.log('🗑️ Deleting race with ID:', raceId);

      // Validate UUID
      if (!isValidUUID(raceId)) {
        console.error('❌ Invalid UUID for race deletion:', raceId);
        throw new Error('ID de la course invalide');
      }

      const { error } = await supabase
        .from('races')
        .delete()
        .eq('id', raceId);

      if (error) {
        console.error('❌ Delete race error:', error);
        throw error;
      }

      console.log('✅ Race deleted successfully');
      await loadData();
      toast({
        title: "Course supprimée",
        description: "La course a été supprimée avec succès.",
      });
    } catch (error) {
      console.error('❌ Error deleting race:', error);
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
