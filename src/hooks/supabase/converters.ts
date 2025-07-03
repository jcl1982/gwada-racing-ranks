
import { Driver, Race } from '@/types/championship';
import { SupabaseDriver, SupabaseRace, SupabaseRaceResult } from './types';

// Convert Supabase data to app format
export const convertSupabaseDriverToApp = (supabaseDriver: SupabaseDriver): Driver => ({
  id: supabaseDriver.id,
  name: supabaseDriver.name,
  number: supabaseDriver.number || 0
});

export const convertSupabaseRaceToApp = (supabaseRace: SupabaseRace, results: SupabaseRaceResult[]): Race => ({
  id: supabaseRace.id,
  name: supabaseRace.name,
  date: supabaseRace.date,
  type: supabaseRace.type,
  results: results.map(result => ({
    driverId: result.driver_id,
    position: result.position,
    points: result.points,
    time: result.time,
    dnf: result.dnf || false
  }))
});
