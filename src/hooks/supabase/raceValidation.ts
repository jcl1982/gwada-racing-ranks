
import { supabase } from '@/integrations/supabase/client';
import { isValidUUID } from './utils';
import { Race } from '@/types/championship';

const isValidDate = (dateString: string): boolean => {
  // Vérifier le format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  
  // Vérifier que la date est valide
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString().split('T')[0] === dateString;
};

export const validateRaceData = (race: Omit<Race, 'id' | 'results'> | Race): void => {
  if ('id' in race && !isValidUUID(race.id)) {
    console.error('❌ UUID invalide pour la course:', race.id);
    throw new Error('ID de la course invalide');
  }
  
  // Valider la date
  if (!race.date || !isValidDate(race.date)) {
    console.error('❌ Date invalide pour la course:', race.date);
    throw new Error(`Date de course invalide: "${race.date}". Le format attendu est YYYY-MM-DD.`);
  }
  
  // Valider le nom
  if (!race.name || race.name.trim().length === 0) {
    console.error('❌ Nom de course invalide:', race.name);
    throw new Error('Le nom de la course ne peut pas être vide');
  }
  
  // Valider le type
  if (!race.type || (race.type !== 'montagne' && race.type !== 'rallye')) {
    console.error('❌ Type de course invalide:', race.type);
    throw new Error('Le type de course doit être "montagne" ou "rallye"');
  }
};

export const validateDriverIds = (results: Array<{ driverId: string }>): void => {
  const invalidDriverIds: string[] = [];
  
  for (const result of results) {
    if (!isValidUUID(result.driverId)) {
      invalidDriverIds.push(result.driverId);
    }
  }

  if (invalidDriverIds.length > 0) {
    console.error('❌ UUIDs de pilotes invalides dans les résultats:', invalidDriverIds);
    throw new Error(`IDs de pilotes invalides dans les résultats: ${invalidDriverIds.join(', ')}`);
  }
};

// Fonction avec retry pour gérer les problèmes de timing
const queryDriversWithRetry = async (driverIds: string[], maxRetries = 3): Promise<any[]> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔍 Tentative ${attempt}/${maxRetries} - Recherche des pilotes dans la base...`);
    
    const { data: existingDrivers, error: driverCheckError } = await supabase
      .from('drivers')
      .select('id, name')
      .in('id', driverIds);

    if (driverCheckError) {
      console.error('❌ Erreur lors de la vérification des pilotes:', driverCheckError);
      if (attempt === maxRetries) {
        throw driverCheckError;
      }
      console.log('⏳ Attente avant retry...');
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      continue;
    }

    console.log(`📋 Tentative ${attempt}: ${existingDrivers?.length || 0} pilotes trouvés sur ${driverIds.length} demandés`);
    
    if (existingDrivers && existingDrivers.length > 0) {
      return existingDrivers;
    }

    if (attempt < maxRetries) {
      console.log(`⏳ Aucun pilote trouvé, attente de ${1000 * attempt}ms avant retry...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return [];
};

export const validateDriversExistence = async (driverIds: string[]): Promise<void> => {
  console.log('🔍 Vérification de l\'existence des pilotes:', driverIds.length, 'pilotes à vérifier');
  console.log('📋 IDs à vérifier:', driverIds.slice(0, 5), driverIds.length > 5 ? `... et ${driverIds.length - 5} autres` : '');

  const existingDrivers = await queryDriversWithRetry(driverIds);
  
  if (existingDrivers && existingDrivers.length > 0) {
    console.log('📋 Détail des pilotes existants:', existingDrivers.map(d => `${d.name} (${d.id.slice(0, 8)}...)`));
  }

  const existingDriverIds = existingDrivers?.map(d => d.id) || [];
  const missingDrivers = driverIds.filter(id => !existingDriverIds.includes(id));
  
  if (missingDrivers.length > 0) {
    console.error('❌ Pilotes DÉFINITIVEMENT manquants dans la base de données:', missingDrivers.length);
    console.log('📋 IDs manquants (premiers 5):', missingDrivers.slice(0, 5).map(id => id.slice(0, 8) + '...'));
    console.log('📋 IDs trouvés:', existingDriverIds.length);
    
    // Essayer une dernière requête avec tous les IDs pour debug
    console.log('🔍 Vérification finale - requête directe sur tous les pilotes...');
    const { data: allDrivers, error } = await supabase
      .from('drivers')
      .select('id, name');
    
    if (!error && allDrivers) {
      console.log(`📊 Total des pilotes dans la base: ${allDrivers.length}`);
      console.log('📋 Premiers pilotes dans la base:', allDrivers.slice(0, 3).map(d => `${d.name} (${d.id.slice(0, 8)}...)`));
    }
    
    throw new Error(`Pilotes manquants dans la base de données. ${missingDrivers.length} pilotes non trouvés sur ${driverIds.length} attendus.`);
  }

  console.log('✅ Tous les pilotes existent dans la base, sauvegarde des résultats...');
};
