
import { supabase } from '@/integrations/supabase/client';
import { Driver } from '@/types/championship';
import { isValidUUID } from '../utils';
import { useToast } from '@/hooks/use-toast';

export const createDriverCrudOperations = (toast: ReturnType<typeof useToast>['toast'], loadData: () => Promise<void>) => {
  const saveDriver = async (driver: Omit<Driver, 'id'> | Driver, championshipId?: string) => {
    try {
      console.log('💾 Saving driver:', { driver, championshipId });

      if ('id' in driver && driver.id) {
        // Check if driver exists in database
        const { data: existingDriver, error: checkError } = await supabase
          .from('drivers')
          .select('id')
          .eq('id', driver.id)
          .maybeSingle();

        if (checkError) {
          console.error('❌ Error checking existing driver:', checkError);
          throw checkError;
        }

        if (existingDriver) {
          // Update existing driver
          console.log('🔄 Updating existing driver:', driver.id);
          
          const { error } = await supabase
            .from('drivers')
            .update({
              name: driver.name,
              number: driver.number,
              car_model: driver.carModel,
              updated_at: new Date().toISOString()
            })
            .eq('id', driver.id);

          if (error) {
            console.error('❌ Update driver error:', error);
            throw error;
          }

          console.log('✅ Driver updated successfully');
        } else {
          // Driver has ID but doesn't exist in DB - create with specific ID
          const driverChampionshipId = driver.championshipId || championshipId;
          
          console.log('➕ Creating new driver with specific ID:', {
            id: driver.id,
            championshipId: driverChampionshipId,
            fromDriver: driver.championshipId,
            fromParam: championshipId
          });
          
          if (!driverChampionshipId) {
            throw new Error('Championship ID is required to create a driver');
          }
          
          const { data, error } = await supabase
            .from('drivers')
            .insert({
              id: driver.id,
              name: driver.name,
              number: driver.number,
              car_model: driver.carModel,
              championship_id: driverChampionshipId
            })
            .select()
            .single();

          if (error) {
            console.error('❌ Insert driver with ID error:', error);
            throw error;
          }

          console.log('✅ Driver created with ID successfully:', data);
        }
      } else {
        // Create new driver without specific ID
        const driverChampionshipId = driver.championshipId || championshipId;
        
        console.log('➕ Creating new driver with auto-generated ID:', {
          name: driver.name,
          number: driver.number,
          championshipId: driverChampionshipId,
          fromDriver: driver.championshipId,
          fromParam: championshipId
        });

        if (!driverChampionshipId) {
          throw new Error('Championship ID is required to create a driver');
        }

        const { data, error } = await supabase
          .from('drivers')
          .insert({
            name: driver.name,
            number: driver.number,
            car_model: driver.carModel,
            championship_id: driverChampionshipId
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

  return { saveDriver };
};
