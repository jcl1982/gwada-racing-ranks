
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const createConfigOperations = (toast: ReturnType<typeof useToast>['toast']) => {
  const updateChampionshipConfig = async (title: string, year: string) => {
    try {
      console.log('⚙️ Updating championship config:', { title, year });

      const { data: existingConfig } = await supabase
        .from('championship_config')
        .select('id')
        .limit(1);

      if (existingConfig && existingConfig.length > 0) {
        const { error } = await supabase
          .from('championship_config')
          .update({
            title,
            year,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig[0].id);

        if (error) {
          console.error('❌ Update config error:', error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('championship_config')
          .insert({ title, year });

        if (error) {
          console.error('❌ Insert config error:', error);
          throw error;
        }
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
      console.log('🔄 Resetting all data...');

      // Delete all data in correct order to avoid foreign key constraints
      const { error: resultsError } = await supabase
        .from('race_results')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (resultsError) {
        console.error('❌ Error deleting race results:', resultsError);
        throw resultsError;
      }

      const { error: standingsError } = await supabase
        .from('previous_standings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (standingsError) {
        console.error('❌ Error deleting standings:', standingsError);
        throw standingsError;
      }

      const { error: racesError } = await supabase
        .from('races')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (racesError) {
        console.error('❌ Error deleting races:', racesError);
        throw racesError;
      }

      const { error: driversError } = await supabase
        .from('drivers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (driversError) {
        console.error('❌ Error deleting drivers:', driversError);
        throw driversError;
      }

      console.log('✅ All data reset successfully');
      toast({
        title: "Données effacées",
        description: "Toutes les données ont été supprimées.",
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

  return { updateChampionshipConfig, resetAllData };
};
