import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { SupabaseDriver, SupabaseRace, SupabaseRaceResult } from './types';

// Convert Supabase data to app format
export const convertSupabaseDriver = (supabaseDriver: SupabaseDriver): Driver => ({
  id: supabaseDriver.id,
  name: supabaseDriver.name,
  team: supabaseDriver.team,
  number: supabaseDriver.number || 0,
  carModel: supabaseDriver.car_model
});

export const convertSupabaseRace = (supabaseRace: SupabaseRace & { race_results?: Array<SupabaseRaceResult & { drivers: SupabaseDriver }> }): Race => ({
  id: supabaseRace.id,
  name: supabaseRace.name,
  date: supabaseRace.date,
  endDate: supabaseRace.end_date || undefined,
  organizer: supabaseRace.organizer || undefined,
  type: supabaseRace.type,
  results: (supabaseRace.race_results || []).map(result => ({
    driverId: result.driver_id,
    position: result.position,
    points: result.points,
    time: result.time,
    dnf: result.dnf || false,
    carModel: result.car_model
  }))
});

export const convertSupabaseStanding = (supabaseStanding: any): ChampionshipStanding => ({
  driver: {
    id: supabaseStanding.driver_id,
    name: supabaseStanding.drivers?.name || 'Unknown Driver',
    team: supabaseStanding.drivers?.team,
    number: supabaseStanding.drivers?.number || 0,
    carModel: supabaseStanding.drivers?.car_model
  },
  position: supabaseStanding.position,
  totalPoints: supabaseStanding.total_points,
  montagnePoints: supabaseStanding.montagne_points,
  rallyePoints: supabaseStanding.rallye_points,
  positionChange: 0
});

// Keep the original function names for backward compatibility
export const convertSupabaseDriverToApp = convertSupabaseDriver;
export const convertSupabaseRaceToApp = (supabaseRace: SupabaseRace, results: SupabaseRaceResult[]): Race => ({
  id: supabaseRace.id,
  name: supabaseRace.name,
  date: supabaseRace.date,
  endDate: supabaseRace.end_date || undefined,
  organizer: supabaseRace.organizer || undefined,
  type: supabaseRace.type,
  results: results.map(result => ({
    driverId: result.driver_id,
    position: result.position,
    points: result.points,
    time: result.time,
    dnf: result.dnf || false,
    carModel: result.car_model
  }))
});
