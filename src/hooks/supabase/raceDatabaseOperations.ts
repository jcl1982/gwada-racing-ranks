
import { supabase } from '@/integrations/supabase/client';
import { Race } from '@/types/championship';
import { isValidUUID } from './utils';

export const findExistingRace = async (name: string, date: string): Promise<{ id: string } | null> => {
  console.log('🔍 Recherche d\'une course existante:', { name, date });
  
  const { data, error } = await supabase
    .from('races')
    .select('id')
    .eq('name', name)
    .eq('date', date)
    .maybeSingle();

  if (error) {
    console.error('❌ Erreur lors de la recherche de course:', error);
    return null;
  }

  if (data) {
    console.log('✅ Course existante trouvée:', data.id);
  } else {
    console.log('ℹ️ Aucune course existante trouvée');
  }

  return data;
};

export const createRaceInDatabase = async (race: Omit<Race, 'id' | 'results'>): Promise<string> => {
  console.log('➕ Création d\'une nouvelle course:', {
    name: race.name,
    date: race.date,
    endDate: race.endDate,
    type: race.type
  });

  const { data, error } = await supabase
    .from('races')
    .insert({
      name: race.name,
      date: race.date,
      end_date: race.endDate || null,
      type: race.type
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Erreur lors de la création de la course:', error);
    throw error;
  }

  console.log('✅ Course créée avec succès, ID:', data.id);
  return data.id;
};

export const updateRaceInDatabase = async (race: Race): Promise<void> => {
  if (!isValidUUID(race.id)) {
    console.error('❌ UUID invalide pour la mise à jour de la course:', race.id);
    throw new Error('ID de la course invalide');
  }

  const { error } = await supabase
    .from('races')
    .update({
      name: race.name,
      date: race.date,
      end_date: race.endDate || null,
      type: race.type,
      updated_at: new Date().toISOString()
    })
    .eq('id', race.id);

  if (error) {
    console.error('❌ Erreur lors de la mise à jour de la course:', error);
    throw error;
  }

  console.log('✅ Course mise à jour avec succès');
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
