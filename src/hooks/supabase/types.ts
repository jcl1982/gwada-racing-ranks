
export interface SupabaseDriver {
  id: string;
  name: string;
  team?: string;
  number?: number;
  car_model?: string;
  championship_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseRace {
  id: string;
  name: string;
  date: string;
  end_date?: string;
  organizer?: string;
  type: 'montagne' | 'rallye' | 'karting' | 'acceleration';
  championship_id: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseRaceResult {
  id: string;
  race_id: string;
  driver_id: string;
  position: number;
  points: number;
  time?: string;
  dnf?: boolean;
  car_model?: string;
  category?: string;
  bonus?: number;
  created_at: string;
  updated_at: string;
}

export interface SupabasePreviousStanding {
  id: string;
  driver_id: string;
  position: number;
  montagne_points: number;
  rallye_points: number;
  total_points: number;
  championship_id: string;
  created_at: string;
}

export interface SupabaseChampionshipConfig {
  id: string;
  title: string;
  year: string;
  created_at: string;
  updated_at: string;
}
