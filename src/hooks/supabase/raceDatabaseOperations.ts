
import { supabase } from '@/integrations/supabase/client';
import { Race } from '@/types/championship';
import { isValidUUID } from './utils';

export const findExistingRace = async (name: string, date: string, championshipId?: string, raceType?: string): Promise<{ id: string; type: string } | null> => {
  console.log('🔍 [FIND_RACE] Recherche d\'une course existante:', { name, date, championshipId, raceType });
  
  // Normaliser le nom pour la comparaison (trim + lowercase)
  const normalizedName = name.trim().toLowerCase();
  
  let query = supabase
    .from('races')
    .select('id, name, date, type, championship_id')
    .eq('date', date);
  
  // Filtrer par championnat si fourni
  if (championshipId) {
    query = query.eq('championship_id', championshipId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ [FIND_RACE] Erreur lors de la recherche de course:', error);
    return null;
  }

  if (!data || data.length === 0) {
    console.log('ℹ️ [FIND_RACE] Aucune course existante trouvée pour cette date et ce championnat');
    return null;
  }

  // Chercher une course avec le même nom et le même type (case-insensitive)
  const matchingRace = data.find(race => 
    race.name.trim().toLowerCase() === normalizedName &&
    (!raceType || race.type === raceType)
  );
  
  if (matchingRace) {
    console.log('✅ [FIND_RACE] Course existante trouvée (même nom, date, type et championnat):', { 
      id: matchingRace.id, 
      name: matchingRace.name,
      type: matchingRace.type
    });
    return { id: matchingRace.id, type: matchingRace.type };
  }
  
  console.log('ℹ️ [FIND_RACE] Course(s) avec même date mais nom/type différent:', { 
    existing: data.map(r => ({ name: r.name, type: r.type })), 
    new: { name, type: raceType }
  });
  return null;
};

export const createRaceInDatabase = async (race: Omit<Race, 'id' | 'results'>, championshipId?: string): Promise<string> => {
  console.log('➕ [CREATE_RACE_DB] Création d\'une nouvelle course:', {
    name: race.name,
    date: race.date,
    endDate: race.endDate,
    organizer: race.organizer,
    type: race.type,
    'race.championshipId': race.championshipId,
    'param championshipId': championshipId
  });

  const finalChampionshipId = championshipId || race.championshipId;
  
  console.log('🔑 [CREATE_RACE_DB] CHAMPIONSHIPID FINAL UTILISÉ POUR L\'INSERTION:', finalChampionshipId);
  
  if (!finalChampionshipId) {
    throw new Error('Championship ID is required to create a race');
  }

  const insertData = {
    name: race.name,
    date: race.date,
    end_date: race.endDate || null,
    organizer: race.organizer || null,
    type: race.type,
    race_level: race.raceLevel || 'regional',
    championship_id: finalChampionshipId
  };
  
  console.log('📤 [CREATE_RACE_DB] Données envoyées à Supabase:', insertData);

  const { data, error } = await supabase
    .from('races')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('❌ Erreur lors de la création de la course:', error);
    throw error;
  }

  console.log('✅ Course créée avec succès, ID:', data.id);
  return data.id;
};

export const updateRaceInDatabase = async (race: Race, championshipId?: string): Promise<void> => {
  console.log('🔄 updateRaceInDatabase - Début');
  console.log('📦 Race reçue:', race);
  console.log('📅 Date à enregistrer:', race.date);
  
  if (!isValidUUID(race.id)) {
    console.error('❌ UUID invalide pour la mise à jour de la course:', race.id);
    throw new Error('ID de la course invalide');
  }

  const finalChampionshipId = championshipId || race.championshipId;

  const updateData: any = {
    name: race.name,
    date: race.date,
    end_date: race.endDate || null,
    organizer: race.organizer || null,
    type: race.type,
    race_level: race.raceLevel || 'regional',
    updated_at: new Date().toISOString()
  };
  
  if (finalChampionshipId) {
    updateData.championship_id = finalChampionshipId;
  }
  
  console.log('📤 Données envoyées à Supabase:', updateData);

  const { data, error } = await supabase
    .from('races')
    .update(updateData)
    .eq('id', race.id)
    .select();

  if (error) {
    console.error('❌ Erreur lors de la mise à jour de la course:', error);
    throw error;
  }

  console.log('✅ Course mise à jour avec succès');
  console.log('📥 Données retournées par Supabase:', data);
};

export const deleteRaceFromDatabase = async (raceId: string): Promise<void> => {
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
};
