
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const createConfigOperations = (toast: ReturnType<typeof useToast>['toast'], championshipId?: string) => {
  const updateChampionshipConfig = async (title: string, year: string) => {
    try {
      console.log('⚙️ Updating championship config:', { title, year, championshipId });

      if (!championshipId) {
        throw new Error('Championship ID is required');
      }

      const { error } = await supabase
        .from('championship_config')
        .update({
          title,
          year,
          updated_at: new Date().toISOString()
        })
        .eq('id', championshipId);

      if (error) {
        console.error('❌ Update config error:', error);
        throw error;
      }

      console.log('✅ Championship config updated successfully');
      toast({
        title: "Configuration mise à jour",
        description: "La configuration du championnat a été mise à jour.",
      });
    } catch (error) {
      console.error('❌ Error updating championship config:', error);
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de mettre à jour la configuration.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const resetAllData = async () => {
    try {
      console.log('🗑️ Resetting all data for championship:', championshipId);

      if (!championshipId) {
        throw new Error('Championship ID is required');
      }

      // D'abord récupérer tous les IDs des courses du championnat
      const { data: races, error: racesQueryError } = await supabase
        .from('races')
        .select('id')
        .eq('championship_id', championshipId);

      if (racesQueryError) {
        console.error('❌ Error querying races:', racesQueryError);
        throw racesQueryError;
      }

      const raceIds = races?.map(r => r.id) || [];

      // Supprimer tous les résultats de course si des courses existent
      if (raceIds.length > 0) {
        const { error: resultsError } = await supabase
          .from('race_results')
          .delete()
          .in('race_id', raceIds);

        if (resultsError) {
          console.error('❌ Error deleting race results:', resultsError);
          throw resultsError;
        }
      }

      // Supprimer toutes les courses
      const { error: racesError } = await supabase
        .from('races')
        .delete()
        .eq('championship_id', championshipId);

      if (racesError) {
        console.error('❌ Error deleting races:', racesError);
        throw racesError;
      }

      // Supprimer tous les pilotes
      const { error: driversError } = await supabase
        .from('drivers')
        .delete()
        .eq('championship_id', championshipId);

      if (driversError) {
        console.error('❌ Error deleting drivers:', driversError);
        throw driversError;
      }

      console.log('✅ All data reset successfully');
      toast({
        title: "Données réinitialisées",
        description: "Toutes les données du championnat ont été supprimées.",
      });
    } catch (error) {
      console.error('❌ Error resetting all data:', error);
      toast({
        title: "Erreur de réinitialisation",
        description: "Impossible de réinitialiser les données.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const saveStandingsForEvolution = async () => {
    try {
      console.log('💾 [AUTO-SAVE] Début de la sauvegarde automatique...');
      console.log('💾 [AUTO-SAVE] Championship ID:', championshipId);

      if (!championshipId) {
        const error = 'Championship ID is required for auto-save';
        console.error('❌ [AUTO-SAVE] Error:', error);
        toast({
          title: "Erreur de sauvegarde automatique",
          description: error,
          variant: "destructive"
        });
        throw new Error(error);
      }

      console.log('💾 [AUTO-SAVE] Appel RPC save_current_standings_as_previous...');
      const { data, error } = await supabase.rpc('save_current_standings_as_previous', {
        p_championship_id: championshipId,
        p_save_name: 'Auto-save'
      });

      if (error) {
        console.error('❌ [AUTO-SAVE] RPC Error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast({
          title: "Erreur de sauvegarde automatique",
          description: `Impossible de sauvegarder les positions: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }

      console.log('✅ [AUTO-SAVE] RPC data:', data);
      console.log('✅ [AUTO-SAVE] Positions sauvegardées pour l\'évolution');
      
      toast({
        title: "Positions sauvegardées",
        description: "Les positions actuelles ont été enregistrées pour le calcul de l'évolution.",
      });
    } catch (error) {
      console.error('❌ [AUTO-SAVE] Fatal error:', error);
      // Afficher l'erreur mais ne pas bloquer l'exécution
      toast({
        title: "Attention",
        description: "La sauvegarde automatique a échoué. Les évolutions ne seront pas calculées au prochain import.",
        variant: "destructive"
      });
    }
  };

  return { updateChampionshipConfig, resetAllData, saveStandingsForEvolution };
};
