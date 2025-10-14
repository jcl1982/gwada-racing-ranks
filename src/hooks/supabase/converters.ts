import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { SupabaseDriver, SupabaseRace, SupabaseRaceResult } from './types';

// Convert Supabase data to app format
export const convertSupabaseDriver = (supabaseDriver: SupabaseDriver): Driver => ({
  id: supabaseDriver.id,
  name: supabaseDriver.name,
  team: supabaseDriver.team,
  number: supabaseDriver.number || 0,
  carModel: supabaseDriver.car_model,
  championshipId: supabaseDriver.championship_id,
  driverRole: ((supabaseDriver as any).driver_role as 'pilote' | 'copilote') || 'pilote'
});

export const convertSupabaseRace = (supabaseRace: SupabaseRace & { race_results?: Array<SupabaseRaceResult & { drivers: SupabaseDriver }> }): Race => ({
  id: supabaseRace.id,
  name: supabaseRace.name,
  date: supabaseRace.date,
  endDate: supabaseRace.end_date || undefined,
  organizer: supabaseRace.organizer || undefined,
  type: supabaseRace.type,
  championshipId: supabaseRace.championship_id,
  results: (supabaseRace.race_results || []).map(result => ({
    driverId: result.driver_id,
    position: result.position,
    points: result.points,
    time: result.time,
    dnf: result.dnf || false,
    carModel: result.car_model,
    category: result.category,
    bonus: result.bonus || 0
  }))
});

export const convertSupabaseStanding = (supabaseStanding: any): ChampionshipStanding => ({
  driver: {
    id: supabaseStanding.driver_id,
    name: supabaseStanding.drivers?.name || 'Unknown Driver',
    team: supabaseStanding.drivers?.team,
    number: supabaseStanding.drivers?.number || 0,
    carModel: supabaseStanding.drivers?.car_model,
    driverRole: (supabaseStanding.drivers?.driver_role as 'pilote' | 'copilote') || 'pilote'
  },
  position: supabaseStanding.position,
  totalPoints: supabaseStanding.total_points,
  montagnePoints: supabaseStanding.montagne_points,
  rallyePoints: supabaseStanding.rallye_points,
  positionChange: 0,
  // Charger toutes les positions spécifiques
  previousGeneralPosition: supabaseStanding.general_position,
  previousMontagnePosition: supabaseStanding.montagne_position,
  previousRallyePosition: supabaseStanding.rallye_position,
  previousC2R2Position: supabaseStanding.c2r2_position
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
  championshipId: supabaseRace.championship_id,
  results: results.map(result => ({
    driverId: result.driver_id,
    position: result.position,
    points: result.points,
    time: result.time,
    dnf: result.dnf || false,
    carModel: result.car_model,
    category: result.category,
    bonus: result.bonus || 0
  }))
});
