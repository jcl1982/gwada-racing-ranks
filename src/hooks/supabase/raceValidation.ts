
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

export const validateDriversExistence = async (driverIds: string[]): Promise<void> => {
  console.log('🔍 Vérification de l\'existence des pilotes:', driverIds.length, 'pilotes à vérifier');
  
  const { data: existingDrivers, error } = await supabase
    .from('drivers')
    .select('id, name')
    .in('id', driverIds);

  if (error) {
    console.error('❌ Erreur lors de la vérification des pilotes:', error);
    throw new Error('Erreur lors de la vérification des pilotes dans la base de données');
  }

  const existingDriverIds = existingDrivers?.map(d => d.id) || [];
  const missingDrivers = driverIds.filter(id => !existingDriverIds.includes(id));
  
  if (missingDrivers.length > 0) {
    console.error('❌ Pilotes manquants dans la base de données:', missingDrivers.length);
    console.log('📋 IDs manquants:', missingDrivers.slice(0, 5).map(id => id.slice(0, 8) + '...'));
    
    throw new Error(`${missingDrivers.length} pilote(s) manquant(s) dans la base de données. Ces pilotes doivent être créés avant de pouvoir sauvegarder les résultats.`);
  }

  console.log('✅ Tous les pilotes existent dans la base, sauvegarde des résultats...');
};
