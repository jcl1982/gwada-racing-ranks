
import { supabase } from '@/integrations/supabase/client';
import { Driver } from '@/types/championship';
import { isValidUUID } from '../utils';
import { useToast } from '@/hooks/use-toast';

export const createDriverCrudOperations = (toast: ReturnType<typeof useToast>['toast'], loadData: () => Promise<void>) => {
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

  return { saveDriver };
};
