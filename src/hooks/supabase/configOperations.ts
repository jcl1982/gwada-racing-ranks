
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

  const saveCurrentStandingsAsPrevious = async (saveName?: string) => {
    console.log('💾 DÉBUT: Sauvegarde du classement actuel...', { championshipId, saveName });
    
    try {
      console.log('📞 Appel de la fonction RPC save_current_standings_as_previous...');
      const result = await supabase.rpc('save_current_standings_as_previous', { 
        p_championship_id: championshipId,
        p_save_name: saveName || null
      });

      if (result.error) {
        console.error('❌ ERREUR RPC:', result.error);
        
        toast({
          title: "Erreur",
          description: `Erreur base de données: ${result.error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Classement sauvegardé avec succès');
      
      toast({
        title: "Sauvegarde créée",
        description: saveName || "Le classement actuel a été sauvegardé.",
      });
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      
      toast({
        title: "Erreur",
        description: `Erreur: ${error?.message || 'Erreur inconnue'}`,
        variant: "destructive"
      });
    }
  };

  const resetDriversEvolution = async () => {
    try {
      console.log('🔄 Resetting drivers evolution...', { championshipId });

      const result = await supabase.rpc('reset_drivers_evolution', { 
        p_championship_id: championshipId 
      });

      if (result.error) {
        console.error('❌ Error resetting drivers evolution:', result.error);
        toast({
          title: "Erreur RPC",
          description: `Erreur base de données: ${result.error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Drivers evolution reset successfully');
      toast({
        title: "Évolution réinitialisée",
        description: "L'évolution des pilotes a été réinitialisée.",
      });
    } catch (error) {
      console.error('❌ Error resetting drivers evolution:', error);
      toast({
        title: "Erreur",
        description: `Erreur: ${error?.message || 'Erreur inconnue'}`,
        variant: "destructive"
      });
    }
  };

  const restorePreviousStandings = async () => {
    try {
      console.log('⏮️ Restoring previous standings...', { championshipId });

      const result = await supabase.rpc('restore_previous_standings', { 
        p_championship_id: championshipId 
      });

      if (result.error) {
        console.error('❌ Error restoring previous standings:', result.error);
        toast({
          title: "Erreur de restauration",
          description: `${result.error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Previous standings restored successfully');
      toast({
        title: "Classement restauré",
        description: "Le classement précédent a été restauré avec succès.",
      });
    } catch (error) {
      console.error('❌ Error restoring previous standings:', error);
      toast({
        title: "Erreur",
        description: `Erreur: ${error?.message || 'Erreur inconnue'}`,
        variant: "destructive"
      });
    }
  };

  const resetAllData = async () => {
    try {
      console.log('🔄 Resetting all data...', { championshipId });

      if (!championshipId) {
        throw new Error('Championship ID is required');
      }

      // First, get all race IDs for this championship
      const { data: races, error: racesQueryError } = await supabase
        .from('races')
        .select('id')
        .eq('championship_id', championshipId);

      if (racesQueryError) {
        console.error('❌ Error querying races:', racesQueryError);
        throw racesQueryError;
      }

      const raceIds = races?.map(r => r.id) || [];

      // Delete race results for races in this championship
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

      // Delete standings for this championship
      const { error: standingsError } = await supabase
        .from('previous_standings')
        .delete()
        .eq('championship_id', championshipId);

      if (standingsError) {
        console.error('❌ Error deleting standings:', standingsError);
        throw standingsError;
      }

      // Delete races for this championship
      const { error: racesError } = await supabase
        .from('races')
        .delete()
        .eq('championship_id', championshipId);

      if (racesError) {
        console.error('❌ Error deleting races:', racesError);
        throw racesError;
      }

      // Delete drivers for this championship
      const { error: driversError } = await supabase
        .from('drivers')
        .delete()
        .eq('championship_id', championshipId);

      if (driversError) {
        console.error('❌ Error deleting drivers:', driversError);
        throw driversError;
      }

      console.log('✅ All data reset successfully for championship:', championshipId);
      toast({
        title: "Données effacées",
        description: "Toutes les données du championnat ont été supprimées.",
      });
    } catch (error) {
      console.error('❌ Error resetting data:', error);
      toast({
        title: "Erreur de réinitialisation",
        description: "Impossible de réinitialiser les données.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return { updateChampionshipConfig, saveCurrentStandingsAsPrevious, resetDriversEvolution, restorePreviousStandings, resetAllData };
};
