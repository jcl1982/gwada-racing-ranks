
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

// Nouvelle fonction pour supprimer uniquement les résultats d'un rôle spécifique (pilote/copilote)
export const deleteResultsByDriverRole = async (raceId: string, driverRole: 'pilote' | 'copilote'): Promise<void> => {
  console.log(`🗑️ [DELETE_BY_ROLE] Suppression des résultats des ${driverRole}s pour la course ${raceId}`);
  
  // Récupérer le championship_id de la course
  const { data: raceData, error: raceError } = await supabase
    .from('races')
    .select('championship_id')
    .eq('id', raceId)
    .single();

  if (raceError) {
    console.error('❌ Erreur lors de la récupération du championship_id:', raceError);
    throw raceError;
  }

  const championshipId = raceData.championship_id;
  console.log(`🔍 [DELETE_BY_ROLE] ChampionshipId de la course: ${championshipId}`);
  
  // Récupérer les IDs des drivers avec le rôle spécifié ET du même championnat
  const { data: driversWithRole, error: fetchError } = await supabase
    .from('drivers')
    .select('id, name')
    .eq('driver_role', driverRole)
    .eq('championship_id', championshipId);

  if (fetchError) {
    console.error('❌ Erreur lors de la récupération des drivers:', fetchError);
    throw fetchError;
  }

  if (!driversWithRole || driversWithRole.length === 0) {
    console.log(`ℹ️ [DELETE_BY_ROLE] Aucun ${driverRole} trouvé dans ce championnat, rien à supprimer`);
    return;
  }

  console.log(`🔍 [DELETE_BY_ROLE] ${driversWithRole.length} ${driverRole}s trouvés:`, driversWithRole.map(d => d.name));

  const driverIds = driversWithRole.map(d => d.id);
  
  const { error: deleteError } = await supabase
    .from('race_results')
    .delete()
    .eq('race_id', raceId)
    .in('driver_id', driverIds);

  if (deleteError) {
    console.error(`❌ Erreur lors de la suppression des résultats des ${driverRole}s:`, deleteError);
    throw deleteError;
  }
  
  console.log(`✅ [DELETE_BY_ROLE] Résultats des ${driverRole}s supprimés avec succès`);
};

export const saveRaceResults = async (raceId: string, results: RaceResult[]): Promise<void> => {
  console.log('📊 [SAVE_RESULTS] Début saveRaceResults - RaceId:', raceId);
  console.log('📊 [SAVE_RESULTS] Nombre de résultats reçus:', results.length);
  
  if (results.length === 0) {
    console.warn('⚠️ [SAVE_RESULTS] AUCUN RÉSULTAT À SAUVEGARDER !');
    return;
  }

  console.log('📊 [SAVE_RESULTS] Sauvegarde de', results.length, 'résultats');
  console.log('📊 [SAVE_RESULTS] Tous les résultats:', results.map(r => ({
    driverId: r.driverId.slice(0, 8) + '...',
    position: r.position,
    points: r.points,
    carModel: r.carModel
  })));
  
  // Validate all driver IDs before inserting
  validateDriverIds(results);

  // Verify all drivers exist in database
  const driverIds = results.map(r => r.driverId);
  
  // Récupérer le championshipId de la course pour valider les pilotes dans le bon championnat
  const { data: raceData, error: raceError } = await supabase
    .from('races')
    .select('championship_id')
    .eq('id', raceId)
    .single();
  
  if (raceError) {
    console.error('❌ Erreur lors de la récupération du championship_id de la course:', raceError);
  }
  
  await validateDriversExistence(driverIds, raceData?.championship_id);

  // Récupérer les informations complètes des pilotes/copilotes
  const { data: driversData, error: driversError } = await supabase
    .from('drivers')
    .select('id, car_model, driver_role, name')
    .in('id', driverIds);

  if (driversError) {
    console.error('❌ Erreur lors de la récupération des infos des pilotes:', driversError);
    throw driversError;
  }

  console.log('📊 [SAVE_RESULTS] Pilotes/Copilotes récupérés:', driversData?.map(d => ({
    name: d.name,
    role: d.driver_role,
    carModel: d.car_model
  })));

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
