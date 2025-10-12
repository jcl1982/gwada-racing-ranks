
import { supabase } from '@/integrations/supabase/client';
import { Driver } from '@/types/championship';
import { isValidUUID } from '../utils';
import { useToast } from '@/hooks/use-toast';

export const createDriverCrudOperations = (toast: ReturnType<typeof useToast>['toast'], loadData: () => Promise<void>) => {
  const saveDriver = async (driver: Omit<Driver, 'id'> | Driver, championshipId?: string) => {
    try {
      const driverChampionshipId = driver.championshipId || championshipId;
      
      if (!driverChampionshipId) {
        throw new Error('Championship ID is required to save a driver');
      }

      console.log('💾 Saving driver:', { driver, championshipId: driverChampionshipId });

      // Normaliser le nom pour la vérification
      const normalizedName = driver.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // Vérifier si un pilote avec le même nom existe déjà dans ce championnat
      const { data: existingDrivers, error: nameCheckError } = await supabase
        .from('drivers')
        .select('id, name, number, car_model')
        .eq('championship_id', driverChampionshipId);

      if (nameCheckError) {
        console.error('❌ Error checking existing drivers by name:', nameCheckError);
        throw nameCheckError;
      }

      // Filtrer les pilotes par nom normalisé
      const matchingDriver = existingDrivers?.find(existingDriver => {
        const existingNormalized = existingDriver.name
          .toLowerCase()
          .trim()
          .replace(/\s+/g, ' ')
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return existingNormalized === normalizedName;
      });

      if (matchingDriver) {
        // Pilote avec le même nom existe déjà - mettre à jour
        console.log('🔄 Updating existing driver by name:', matchingDriver.id);
        
        const { error } = await supabase
          .from('drivers')
          .update({
            name: driver.name,
            number: driver.number || matchingDriver.number,
            car_model: driver.carModel || matchingDriver.car_model,
            updated_at: new Date().toISOString()
          })
          .eq('id', matchingDriver.id);

        if (error) {
          console.error('❌ Update driver error:', error);
          throw error;
        }

        console.log('✅ Driver updated successfully (by name match)');
        
        // Force reload of data to ensure UI updates
        console.log('🔄 Reloading data after driver operation...');
        await loadData();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        toast({
          title: "Pilote mis à jour",
          description: "Le pilote existant a été mis à jour.",
        });
        
        return;
      }

      if ('id' in driver && driver.id) {
        // Check if driver exists by ID
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
          console.log('➕ Creating new driver with specific ID:', {
            id: driver.id,
            championshipId: driverChampionshipId
          });
          
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
        console.log('➕ Creating new driver with auto-generated ID:', {
          name: driver.name,
          number: driver.number,
          championshipId: driverChampionshipId
        });

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
