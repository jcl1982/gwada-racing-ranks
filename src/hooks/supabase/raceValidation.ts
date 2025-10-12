
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
  const validTypes = ['montagne', 'rallye', 'karting', 'acceleration'];
  if (!race.type || !validTypes.includes(race.type)) {
    console.error('❌ Type de course invalide:', race.type);
    throw new Error('Le type de course doit être "montagne", "rallye", "karting" ou "acceleration"');
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
  
  // Stratégie renforcée avec plus de tentatives et délais plus longs
  let attempt = 0;
  const maxAttempts = 8; // Augmenté de 5 à 8
  let existingDrivers = null;
  
  while (attempt < maxAttempts) {
    attempt++;
    
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('id, name')
        .in('id', driverIds);

      if (error) {
        console.error('❌ Erreur lors de la vérification des pilotes:', error);
        
        // Si c'est une erreur de connexion temporaire, continuer les tentatives
        if (attempt < maxAttempts) {
          const waitTime = Math.min(attempt * 3000, 15000); // Max 15s
          console.log(`⚠️ Erreur de connexion, nouvelle tentative dans ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        throw new Error('Erreur lors de la vérification des pilotes dans la base de données');
      }

      existingDrivers = data;
      
      console.log(`🔍 Tentative ${attempt}/${maxAttempts}: ${existingDrivers?.length || 0}/${driverIds.length} pilotes trouvés`);
      
      if (existingDrivers && existingDrivers.length === driverIds.length) {
        console.log('✅ Tous les pilotes trouvés dans la base de données');
        break;
      }
      
      if (attempt < maxAttempts) {
        // Délai progressif plus long : 3s, 6s, 9s, 12s, 15s, 15s, 15s
        const waitTime = Math.min(attempt * 3000, 15000);
        console.log(`⏳ Attente de ${waitTime}ms avant la prochaine tentative...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    } catch (dbError) {
      console.error(`❌ Erreur de base de données lors de la tentative ${attempt}:`, dbError);
      
      if (attempt < maxAttempts) {
        const waitTime = Math.min(attempt * 3000, 15000);
        console.log(`⏳ Nouvelle tentative dans ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      throw new Error('Impossible de se connecter à la base de données pour vérifier les pilotes');
    }
  }

  const existingDriverIds = existingDrivers?.map(d => d.id) || [];
  const missingDrivers = driverIds.filter(id => !existingDriverIds.includes(id));
  
  if (missingDrivers.length > 0) {
    console.error('❌ Pilotes manquants dans la base de données:', missingDrivers.length);
    console.log('📋 IDs manquants:', missingDrivers.slice(0, 10).map(id => id.slice(0, 8) + '...'));
    
    // Diagnostic final approfondi
    console.log('🔍 Diagnostic final - vérification complète...');
    try {
      const { data: allDrivers, error: debugError } = await supabase
        .from('drivers')
        .select('id, name, created_at')
        .order('created_at', { ascending: false });
      
      if (debugError) {
        console.error('❌ Erreur lors du diagnostic:', debugError);
      } else {
        console.log('📊 Total pilotes dans la base:', allDrivers?.length || 0);
        console.log('🎯 Pilotes recherchés:', driverIds.length);
        console.log('🔍 Derniers pilotes créés:', allDrivers?.slice(0, 5).map(d => ({
          name: d.name,
          id: d.id.slice(0, 8) + '...',
          created: d.created_at
        })));
        
        // Vérifier si certains des IDs manquants sont dans la liste complète
        const actuallyExisting = missingDrivers.filter(id => 
          allDrivers?.some(d => d.id === id)
        );
        
        if (actuallyExisting.length > 0) {
          console.log('⚠️ ATTENTION: Certains pilotes "manquants" existent en réalité:', actuallyExisting.length);
          console.log('🔧 Ceci indique un problème de requête ou de filtrage');
        }
      }
    } catch (diagnosticError) {
      console.error('❌ Erreur lors du diagnostic final:', diagnosticError);
    }
    
    throw new Error(`${missingDrivers.length} pilote(s) manquant(s) dans la base de données. Essayez de relancer l'import après quelques secondes, ou vérifiez que tous les pilotes ont bien été créés.`);
  }

  console.log('✅ Tous les pilotes existent dans la base, sauvegarde des résultats...');
};
