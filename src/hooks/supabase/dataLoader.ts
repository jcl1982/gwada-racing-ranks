
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
      type: race.type as 'montagne' | 'rallye' | 'karting' | 'acceleration' // Type assertion to handle the database string type
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

    // Load previous standings by type (only the most recent save per type for evolution tracking)
    console.log('📊 Chargement des classements précédents par type...');
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

    // Group standings by type and get the most recent save for each type
    const standingsByType: Record<string, ChampionshipStanding[]> = {
      general: [],
      montagne: [],
      rallye: [],
      c2r2: []
    };

    if (standingsData && standingsData.length > 0) {
      // Get unique save times per standing type
      const typeGroups: Record<string, string[]> = {};
      standingsData.forEach(s => {
        const type = s.standing_type || 'general';
        if (!typeGroups[type]) {
          typeGroups[type] = [];
        }
        if (!typeGroups[type].includes(s.saved_at)) {
          typeGroups[type].push(s.saved_at);
        }
      });

      // Sort save times for each type
      Object.keys(typeGroups).forEach(type => {
        typeGroups[type].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      });

      // Get the most recent save for each type
      Object.keys(standingsByType).forEach(type => {
        const latestSaveForType = typeGroups[type]?.[0];
        if (latestSaveForType) {
          standingsByType[type] = standingsData
            .filter(s => (s.standing_type || 'general') === type && s.saved_at === latestSaveForType)
            .map(convertSupabaseStanding);
        }
      });

      console.log('✅ Classements précédents chargés par type:', {
        total: standingsData.length,
        general: { count: standingsByType.general.length, latestSave: typeGroups.general?.[0] },
        montagne: { count: standingsByType.montagne.length, latestSave: typeGroups.montagne?.[0] },
        rallye: { count: standingsByType.rallye.length, latestSave: typeGroups.rallye?.[0] },
        c2r2: { count: standingsByType.c2r2.length, latestSave: typeGroups.c2r2?.[0] }
      });
    }
    
    const previousStandings = standingsByType;

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
