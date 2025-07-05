
import { supabase } from '@/integrations/supabase/client';
import { Driver } from '@/types/championship';
import { isValidUUID } from './utils';
import { useToast } from '@/hooks/use-toast';

export const createDriverOperations = (toast: ReturnType<typeof useToast>['toast'], loadData: () => Promise<void>) => {
  const saveDriver = async (driver: Omit<Driver, 'id'> | Driver) => {
    try {
      console.log('💾 Saving driver:', driver);

      if ('id' in driver) {
        // Update existing driver - validate UUID first
        if (!isValidUUID(driver.id)) {
          console.error('❌ Invalid UUID for driver update:', driver.id);
          throw new Error('ID du pilote invalide');
        }

        const { error } = await supabase
          .from('drivers')
          .update({
            name: driver.name,
            number: driver.number,
            updated_at: new Date().toISOString()
          })
          .eq('id', driver.id);

        if (error) {
          console.error('❌ Update driver error:', error);
          throw error;
        }

        console.log('✅ Driver updated successfully');
      } else {
        // Create new driver
        console.log('➕ Creating new driver with data:', {
          name: driver.name,
          number: driver.number
        });

        const { data, error } = await supabase
          .from('drivers')
          .insert({
            name: driver.name,
            number: driver.number
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Insert driver error:', error);
          throw error;
        }

        console.log('✅ Driver created successfully:', data);
      }

      // Force reload of data to ensure UI updates
      console.log('🔄 Reloading data after driver operation...');
      await loadData();
      
      // Add a small delay to ensure data propagation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast({
        title: "Pilote sauvegardé",
        description: "Le pilote a été sauvegardé avec succès.",
      });
    } catch (error) {
      console.error('❌ Error saving driver:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error instanceof Error ? error.message : "Impossible de sauvegarder le pilote.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteDriver = async (driverId: string) => {
    try {
      console.log('🗑️ Starting driver deletion process for ID:', driverId);

      // Validate UUID
      if (!isValidUUID(driverId)) {
        console.error('❌ Invalid UUID for driver deletion:', driverId);
        throw new Error('ID du pilote invalide');
      }

      // First, check if driver exists
      console.log('🔍 Checking if driver exists...');
      const { data: existingDriver, error: checkError } = await supabase
        .from('drivers')
        .select('id, name')
        .eq('id', driverId)
        .single();

      if (checkError) {
        console.error('❌ Error checking driver existence:', checkError);
        if (checkError.code === 'PGRST116') {
          throw new Error('Ce pilote n\'existe pas ou a déjà été supprimé');
        }
        throw checkError;
      }

      console.log('✅ Driver found:', existingDriver);

      // Check for related race results
      console.log('🔍 Checking for related race results...');
      const { data: relatedResults, error: resultsError } = await supabase
        .from('race_results')
        .select('id, race_id')
        .eq('driver_id', driverId);

      if (resultsError) {
        console.error('❌ Error checking race results:', resultsError);
        throw resultsError;
      }

      if (relatedResults && relatedResults.length > 0) {
        console.log(`⚠️ Found ${relatedResults.length} related race results. Deleting them first...`);
        
        // Delete race results first
        const { error: deleteResultsError } = await supabase
          .from('race_results')
          .delete()
          .eq('driver_id', driverId);

        if (deleteResultsError) {
          console.error('❌ Error deleting race results:', deleteResultsError);
          throw new Error('Impossible de supprimer les résultats de course associés');
        }

        console.log('✅ Race results deleted successfully');
      }

      // Check for related previous standings
      console.log('🔍 Checking for related previous standings...');
      const { data: relatedStandings, error: standingsError } = await supabase
        .from('previous_standings')
        .select('id')
        .eq('driver_id', driverId);

      if (standingsError) {
        console.error('❌ Error checking previous standings:', standingsError);
        throw standingsError;
      }

      if (relatedStandings && relatedStandings.length > 0) {
        console.log(`⚠️ Found ${relatedStandings.length} related previous standings. Deleting them first...`);
        
        // Delete previous standings
        const { error: deleteStandingsError } = await supabase
          .from('previous_standings')
          .delete()
          .eq('driver_id', driverId);

        if (deleteStandingsError) {
          console.error('❌ Error deleting previous standings:', deleteStandingsError);
          throw new Error('Impossible de supprimer les classements précédents associés');
        }

        console.log('✅ Previous standings deleted successfully');
      }

      // Finally, delete the driver
      console.log('🗑️ Deleting driver...');
      const { error: deleteDriverError } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);

      if (deleteDriverError) {
        console.error('❌ Delete driver error:', deleteDriverError);
        throw deleteDriverError;
      }

      console.log('✅ Driver deleted successfully');
      
      // Force reload of data to ensure UI updates
      console.log('🔄 Reloading data after driver deletion...');
      await loadData();
      
      // Add a small delay to ensure data propagation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast({
        title: "Pilote supprimé",
        description: `Le pilote "${existingDriver.name}" a été supprimé avec succès.`,
      });
    } catch (error) {
      console.error('❌ Error deleting driver:', error);
      toast({
        title: "Erreur de suppression",
        description: error instanceof Error ? error.message : "Impossible de supprimer le pilote.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return { saveDriver, deleteDriver };
};
