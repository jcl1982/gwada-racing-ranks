
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

// Nouvelle fonction pour supprimer uniquement les résultats d'une catégorie spécifique (pour karting)
export const deleteResultsByCategory = async (raceId: string, category: string): Promise<void> => {
  console.log(`🗑️ Suppression des résultats pour la catégorie "${category}" de la course ${raceId}`);
  
  const { error: deleteError } = await supabase
    .from('race_results')
    .delete()
    .eq('race_id', raceId)
    .eq('category', category);

  if (deleteError) {
    console.error('❌ Erreur lors de la suppression des résultats par catégorie:', deleteError);
    throw deleteError;
  }
  
  console.log(`✅ Résultats de la catégorie "${category}" supprimés`);
};

export const saveRaceResults = async (raceId: string, results: RaceResult[]): Promise<void> => {
  console.log('📊 [SAVE_RESULTS] Début saveRaceResults - RaceId:', raceId);
  console.log('📊 [SAVE_RESULTS] Nombre de résultats reçus:', results.length);
  
  if (results.length === 0) {
    console.warn('⚠️ [SAVE_RESULTS] AUCUN RÉSULTAT À SAUVEGARDER !');
    return;
  }

  console.log('📊 [SAVE_RESULTS] Sauvegarde de', results.length, 'résultats');
  console.log('📊 [SAVE_RESULTS] Premier résultat:', {
    driverId: results[0].driverId.slice(0, 8) + '...',
    position: results[0].position,
    points: results[0].points,
    carModel: results[0].carModel
  });
  
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
    car_model: result.carModel || carModelMap.get(result.driverId) || null,
    category: result.category || null,
    bonus: result.bonus || 0
  }));

  console.log('📊 [SAVE_RESULTS] Données à insérer (premier élément):', resultsToInsert[0]);
  console.log('📊 [SAVE_RESULTS] Insertion dans race_results...');

  const { error: resultError } = await supabase
    .from('race_results')
    .insert(resultsToInsert);

  if (resultError) {
    console.error('❌ Erreur lors de la sauvegarde des résultats:', resultError);
    throw resultError;
  }

  console.log('✅ Tous les résultats ont été sauvegardés avec succès');
};
