
import { supabase } from '@/integrations/supabase/client';
import { isValidUUID } from './utils';
import { Race } from '@/types/championship';

export const validateRaceData = (race: Omit<Race, 'id' | 'results'> | Race): void => {
  if ('id' in race && !isValidUUID(race.id)) {
    console.error('❌ UUID invalide pour la course:', race.id);
    throw new Error('ID de la course invalide');
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
  console.log('🔍 Vérification FRAÎCHE de l\'existence des pilotes:', driverIds.length, 'pilotes à vérifier');

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
    
    console.log('🔍 Analyse détaillée des pilotes manquants:');
    missingDrivers.forEach((missingId, index) => {
      console.log(`  ${index + 1}. ID manquant: ${missingId}`);
    });
    
    throw new Error(`Pilotes manquants dans la base de données. IDs manquants: ${missingDrivers.join(', ')}`);
  }

  console.log('✅ Tous les pilotes existent dans la base, sauvegarde des résultats...');
};
