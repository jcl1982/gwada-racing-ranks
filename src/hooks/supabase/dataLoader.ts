
import { supabase } from '@/integrations/supabase/client';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { convertSupabaseDriverToApp, convertSupabaseRaceToApp } from './converters';
import { SupabaseRace } from './types';

export const loadSupabaseData = async () => {
  // Load drivers
  const { data: driversData, error: driversError } = await supabase
    .from('drivers')
    .select('*')
    .order('name');

  if (driversError) {
    console.error('Drivers error:', driversError);
    throw driversError;
  }

  // Load races
  const { data: racesData, error: racesError } = await supabase
    .from('races')
    .select('*')
    .order('date');

  if (racesError) {
    console.error('Races error:', racesError);
    throw racesError;
  }

  // Load race results
  const { data: resultsData, error: resultsError } = await supabase
    .from('race_results')
    .select('*');

  if (resultsError) {
    console.error('Results error:', resultsError);
    throw resultsError;
  }

  // Load championship config
  const { data: configData, error: configError } = await supabase
    .from('championship_config')
    .select('*')
    .limit(1);

  if (configError) {
    console.error('Config error:', configError);
    throw configError;
  }

  // Load previous standings
  const { data: standingsData, error: standingsError } = await supabase
    .from('previous_standings')
    .select('*');

  if (standingsError) {
    console.error('Standings error:', standingsError);
    throw standingsError;
  }

  // Convert and return data
  const appDrivers = driversData?.map(convertSupabaseDriverToApp) || [];
  
  const appRaces = racesData?.map(race => {
    const raceResults = resultsData?.filter(result => result.race_id === race.id) || [];
    const typedRace: SupabaseRace = {
      ...race,
      type: race.type as 'montagne' | 'rallye'
    };
    return convertSupabaseRaceToApp(typedRace, raceResults);
  }) || [];

  // Convert previous standings
  const appPreviousStandings: ChampionshipStanding[] = standingsData?.map(standing => {
    const driver = appDrivers.find(d => d.id === standing.driver_id);
    return {
      driver: driver!,
      position: standing.position,
      montagnePoints: standing.montagne_points,
      rallyePoints: standing.rallye_points,
      totalPoints: standing.total_points,
      previousPosition: standing.position,
      positionChange: 0
    };
  }).filter(standing => standing.driver) || [];

  return {
    drivers: appDrivers,
    races: appRaces,
    previousStandings: appPreviousStandings,
    championshipTitle: configData?.[0]?.title || 'Championnat Automobile',
    championshipYear: configData?.[0]?.year || 'de Guadeloupe 2024'
  };
};
