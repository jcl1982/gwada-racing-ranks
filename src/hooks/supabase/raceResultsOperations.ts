
import { supabase } from '@/integrations/supabase/client';
import { RaceResult } from '@/types/championship';
import { validateDriverIds, validateDriversExistence } from './raceValidation';

export const deleteExistingResults = async (raceId: string): Promise<void> => {
  const { error: deleteError } = await supabase
    .from('race_results')
    .delete()
    .eq('race_id', raceId);

  if (deleteError) {
    console.error('❌ Erreur lors de la suppression des anciens résultats:', deleteError);
    throw deleteError;
  }
};

export const saveRaceResults = async (raceId: string, results: RaceResult[]): Promise<void> => {
  if (results.length === 0) {
    console.log('📊 Aucun résultat à sauvegarder');
    return;
  }

  console.log('📊 Sauvegarde des résultats:', results.length, 'résultats');
  
  // Validate all driver IDs before inserting
  validateDriverIds(results);

  // Verify all drivers exist in database
  const driverIds = results.map(r => r.driverId);
  await validateDriversExistence(driverIds);

  // Récupérer les modèles de voiture des pilotes
  const { data: driversData, error: driversError } = await supabase
    .from('drivers')
    .select('id, car_model')
    .in('id', driverIds);

  if (driversError) {
    console.error('❌ Erreur lors de la récupération des modèles de voiture:', driversError);
    throw driversError;
  }

  // Créer une map pour accéder facilement aux car_model
  const carModelMap = new Map(driversData?.map(d => [d.id, d.car_model]) || []);

  // Insert results in batch for efficiency
  const resultsToInsert = results.map(result => ({
    race_id: raceId,
    driver_id: result.driverId,
    position: result.position,
    points: result.points,
    time: result.time,
    dnf: result.dnf || false,
    // Utiliser le car_model du résultat s'il existe, sinon celui du pilote
    car_model: result.carModel || carModelMap.get(result.driverId) || null
  }));

  const { error: resultError } = await supabase
    .from('race_results')
    .insert(resultsToInsert);

  if (resultError) {
    console.error('❌ Erreur lors de la sauvegarde des résultats:', resultError);
    throw resultError;
  }

  console.log('✅ Tous les résultats ont été sauvegardés avec succès');
};
