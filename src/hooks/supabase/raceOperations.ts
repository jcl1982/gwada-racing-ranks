import { supabase } from '@/integrations/supabase/client';
import { Race } from '@/types/championship';
import { isValidUUID } from './utils';
import { useToast } from '@/hooks/use-toast';

export const createRaceOperations = (toast: ReturnType<typeof useToast>['toast'], loadData: () => Promise<void>) => {
  const saveRace = async (race: Omit<Race, 'id' | 'results'> | Race) => {
    try {
      console.log('💾 Sauvegarde de la course:', race.name);
      let raceId: string;
      
      if ('id' in race) {
        // Validate UUID for existing race
        if (!isValidUUID(race.id)) {
          console.error('❌ UUID invalide pour la mise à jour de la course:', race.id);
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
          console.error('❌ Erreur lors de la mise à jour de la course:', error);
          throw error;
        }
        raceId = race.id;

        // Delete existing results
        const { error: deleteError } = await supabase
          .from('race_results')
          .delete()
          .eq('race_id', race.id);

        if (deleteError) {
          console.error('❌ Erreur lors de la suppression des anciens résultats:', deleteError);
          throw deleteError;
        }

        console.log('✅ Course mise à jour avec succès');
      } else {
        // Create new race
        console.log('➕ Création d\'une nouvelle course:', {
          name: race.name,
          date: race.date,
          type: race.type
        });

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
          console.error('❌ Erreur lors de la création de la course:', error);
          throw error;
        }
        raceId = data.id;
        console.log('✅ Course créée avec succès, ID:', raceId);
      }

      // Insert race results if they exist
      if ('results' in race && race.results.length > 0) {
        console.log('📊 Sauvegarde des résultats:', race.results.length, 'résultats');
        
        // Validate all driver IDs before inserting
        const invalidDriverIds: string[] = [];
        for (const result of race.results) {
          if (!isValidUUID(result.driverId)) {
            invalidDriverIds.push(result.driverId);
          }
        }

        if (invalidDriverIds.length > 0) {
          console.error('❌ UUIDs de pilotes invalides dans les résultats:', invalidDriverIds);
          throw new Error(`IDs de pilotes invalides dans les résultats: ${invalidDriverIds.join(', ')}`);
        }

        // Requête fraîche pour vérifier tous les pilotes existants
        const driverIds = race.results.map(r => r.driverId);
        console.log('🔍 Vérification FRAÎCHE de l\'existence des pilotes:', driverIds.length, 'pilotes à vérifier');

        // Triple vérification avec requête ultra-fraîche
        const { data: existingDrivers, error: driverCheckError } = await supabase
          .from('drivers')
          .select('id, name')
          .in('id', driverIds);

        if (driverCheckError) {
          console.error('❌ Erreur lors de la vérification des pilotes:', driverCheckError);
          throw driverCheckError;
        }

        console.log('📋 Pilotes trouvés dans la base:', existingDrivers?.length || 0, 'sur', driverIds.length, 'demandés');
        
        if (existingDrivers) {
          console.log('📋 Détail des pilotes existants:', existingDrivers.map(d => `${d.name} (${d.id})`));
        }

        const existingDriverIds = existingDrivers?.map(d => d.id) || [];
        const missingDrivers = driverIds.filter(id => !existingDriverIds.includes(id));
        
        if (missingDrivers.length > 0) {
          console.error('❌ Pilotes DÉFINITIVEMENT manquants dans la base de données:', missingDrivers.length);
          console.log('📋 IDs manquants:', missingDrivers);
          console.log('📋 IDs demandés:', driverIds);
          console.log('📋 IDs trouvés:', existingDriverIds);
          
          // Log détaillé pour debug
          console.log('🔍 Analyse détaillée des pilotes manquants:');
          missingDrivers.forEach((missingId, index) => {
            console.log(`  ${index + 1}. ID manquant: ${missingId}`);
          });
          
          throw new Error(`Pilotes manquants dans la base de données. IDs manquants: ${missingDrivers.join(', ')}`);
        }

        console.log('✅ Tous les pilotes existent dans la base, sauvegarde des résultats...');

        // Insert results en batch pour plus d'efficacité
        const resultsToInsert = race.results.map(result => ({
          race_id: raceId,
          driver_id: result.driverId,
          position: result.position,
          points: result.points,
          time: result.time,
          dnf: result.dnf || false
        }));

        const { error: resultError } = await supabase
          .from('race_results')
          .insert(resultsToInsert);

        if (resultError) {
          console.error('❌ Erreur lors de la sauvegarde des résultats:', resultError);
          throw resultError;
        }

        console.log('✅ Tous les résultats ont été sauvegardés avec succès');
      }

      await loadData();
      toast({
        title: "Course sauvegardée",
        description: "La course a été sauvegardée avec succès.",
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

      // Validate UUID
      if (!isValidUUID(raceId)) {
        console.error('❌ UUID invalide pour la suppression de la course:', raceId);
        throw new Error('ID de la course invalide');
      }

      const { error } = await supabase
        .from('races')
        .delete()
        .eq('id', raceId);

      if (error) {
        console.error('❌ Erreur lors de la suppression de la course:', error);
        throw error;
      }

      console.log('✅ Course supprimée avec succès');
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
