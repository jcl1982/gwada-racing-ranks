
import { supabase } from '@/integrations/supabase/client';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { convertSupabaseDriver, convertSupabaseRace, convertSupabaseStanding } from './converters';

export const loadSupabaseData = async () => {
  console.log('🔄 Chargement des données depuis Supabase...');

  try {
    // Load drivers
    console.log('👤 Chargement des pilotes...');
    const { data: driversData, error: driversError } = await supabase
      .from('drivers')
      .select('*')
      .order('name');

    if (driversError) {
      console.error('❌ Erreur lors du chargement des pilotes:', driversError);
      throw driversError;
    }

    const drivers: Driver[] = driversData?.map(convertSupabaseDriver) || [];
    console.log('✅ Pilotes chargés:', drivers.length);

    // Load races with results
    console.log('🏁 Chargement des courses...');
    const { data: racesData, error: racesError } = await supabase
      .from('races')
      .select(`
        *,
        race_results (
          *,
          drivers (*)
        )
      `)
      .order('date');

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
        type: cafeiere.type
      });
    }

    // Load previous standings
    console.log('📊 Chargement des classements précédents...');
    const { data: standingsData, error: standingsError } = await supabase
      .from('previous_standings')
      .select(`
        *,
        drivers (*)
      `)
      .order('position');

    if (standingsError) {
      console.error('❌ Erreur lors du chargement des classements:', standingsError);
      throw standingsError;
    }

    const previousStandings: ChampionshipStanding[] = standingsData?.map(convertSupabaseStanding) || [];
    console.log('✅ Classements précédents chargés:', previousStandings.length);

    // Load championship config
    console.log('⚙️ Chargement de la configuration...');
    const { data: configData, error: configError } = await supabase
      .from('championship_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (configError) {
      console.error('❌ Erreur lors du chargement de la configuration:', configError);
      throw configError;
    }

    const championshipTitle = configData?.title || 'Championnat Automobile';
    const championshipYear = configData?.year || 'de Guadeloupe 2024';

    console.log('✅ Configuration chargée:', { championshipTitle, championshipYear });

    const result = {
      drivers,
      races,
      previousStandings,
      championshipTitle,
      championshipYear
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
