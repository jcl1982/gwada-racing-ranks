
import { supabase } from '@/integrations/supabase/client';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { convertSupabaseDriver, convertSupabaseRace, convertSupabaseStanding } from './converters';

export const loadSupabaseData = async (championshipId?: string) => {
  console.log('🔄 Chargement des données depuis Supabase...', { championshipId });

  try {
    let configData: any = null;
    let championshipTitle = 'Championnat Automobile';
    let championshipYear = 'de Guadeloupe 2025';

    // Si on a un championshipId, charger cette config spécifique
    if (championshipId) {
      console.log('⚙️ Chargement de la configuration pour championshipId:', championshipId);
      const { data, error: configError } = await supabase
        .from('championship_config')
        .select('*')
        .eq('id', championshipId)
        .maybeSingle();

      if (configError) {
        console.error('❌ Erreur lors du chargement de la configuration:', configError);
        throw configError;
      }

      configData = data;
      championshipTitle = data?.title || championshipTitle;
      championshipYear = data?.year || championshipYear;
    } else {
      // Sinon, charger le championnat Rallye-Montagne par défaut
      console.log('⚙️ Chargement de la configuration par défaut (Rallye-Montagne)...');
      const { data, error: configError } = await supabase
        .from('championship_config')
        .select('*')
        .eq('title', 'Championnat Rallye-Montagne')
        .maybeSingle();

      if (configError) {
        console.error('❌ Erreur lors du chargement de la configuration:', configError);
        throw configError;
      }

      configData = data;
      championshipId = data?.id;
      championshipTitle = data?.title || championshipTitle;
      championshipYear = data?.year || championshipYear;
    }

    console.log('✅ Configuration chargée:', { championshipId, championshipTitle, championshipYear });

    // Load drivers filtered by championship
    console.log('👤 Chargement des pilotes...');
    const driversQuery = supabase
      .from('drivers')
      .select('*')
      .order('name');
    
    // Filter by championship if we have one
    if (championshipId) {
      driversQuery.eq('championship_id', championshipId);
    }

    const { data: driversData, error: driversError } = await driversQuery;

    if (driversError) {
      console.error('❌ Erreur lors du chargement des pilotes:', driversError);
      throw driversError;
    }

    const drivers: Driver[] = driversData?.map(convertSupabaseDriver) || [];
    console.log('✅ Pilotes chargés:', drivers.length);

    // Load races with results, filtered by championship
    console.log('🏁 Chargement des courses...');
    const racesQuery = supabase
      .from('races')
      .select(`
        *,
        race_results (
          *,
          drivers (*)
        )
      `)
      .order('date');

    // Filter by championship if we have one
    if (championshipId) {
      racesQuery.eq('championship_id', championshipId);
    }

    const { data: racesData, error: racesError } = await racesQuery;

    if (racesError) {
      console.error('❌ Erreur lors du chargement des courses:', racesError);
      throw racesError;
    }

    const races: Race[] = racesData?.map(race => convertSupabaseRace({
      ...race,
      type: race.type as 'montagne' | 'rallye' // Type assertion to handle the database string type
    })) || [];
    console.log('✅ Courses chargées:', races.length);
    
    // Log détaillé de la Course de Côte de Caféière
    const cafeiere = races.find(r => r.name.includes('Caféière'));
    if (cafeiere) {
      console.log('📅 Course de Côte de Caféière chargée:', {
        id: cafeiere.id,
        name: cafeiere.name,
        date: cafeiere.date,
        type: cafeiere.type,
        championshipId: cafeiere.championshipId
      });
    }

    // Load previous standings (only the most recent save for evolution tracking)
    console.log('📊 Chargement des classements précédents...');
    const standingsQuery = supabase
      .from('previous_standings')
      .select(`
        *,
        drivers (*)
      `)
      .order('saved_at', { ascending: false });

    // Filter by championship if we have one
    if (championshipId) {
      standingsQuery.eq('championship_id', championshipId);
    }

    const { data: standingsData, error: standingsError } = await standingsQuery;

    if (standingsError) {
      console.error('❌ Erreur lors du chargement des classements:', standingsError);
      throw standingsError;
    }

    // Get the second most recent save for evolution tracking (not the latest one)
    // This ensures that after saving, evolutions are still calculated from the previous state
    const uniqueSaveTimes = [...new Set(standingsData?.map(s => s.saved_at))].sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    // Use second most recent save if it exists, otherwise use the most recent
    const referenceTimestamp = uniqueSaveTimes.length > 1 ? uniqueSaveTimes[1] : uniqueSaveTimes[0];
    
    const previousStandings: ChampionshipStanding[] = referenceTimestamp
      ? standingsData
          ?.filter(s => s.saved_at === referenceTimestamp)
          .map(convertSupabaseStanding) || []
      : [];
    
    console.log('✅ Classements précédents chargés:', {
      total: standingsData?.length || 0,
      uniqueSaves: uniqueSaveTimes.length,
      latestSave: uniqueSaveTimes[0],
      referenceForEvolution: referenceTimestamp,
      forEvolution: previousStandings.length
    });

    const result = {
      drivers,
      races,
      previousStandings,
      championshipTitle,
      championshipYear,
      championshipId
    };

    console.log('🎉 Toutes les données chargées avec succès:', {
      drivers: result.drivers.length,
      races: result.races.length,
      previousStandings: result.previousStandings.length
    });

    return result;

  } catch (error) {
    console.error('💥 Erreur fatale lors du chargement des données:', error);
    throw error;
  }
};
