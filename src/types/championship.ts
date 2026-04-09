
export type DriverRole = 'pilote' | 'copilote';

export interface Driver {
  id: string;
  name: string;
  team?: string;
  number?: number;
  carModel?: string;
  championshipId?: string;
  driverRole?: DriverRole;
}

export interface RaceResult {
  driverId: string;
  position: number;
  points: number;
  time?: string;
  dnf?: boolean;
  carModel?: string;
  category?: string;
  bonus?: number;
}

export type RaceLevel = 'national' | 'regional';

export interface Race {
  id: string;
  name: string;
  date: string;
  endDate?: string;
  type: 'montagne' | 'rallye' | 'karting' | 'acceleration';
  organizer?: string;
  raceLevel?: RaceLevel;
  results: RaceResult[];
  championshipId?: string;
}

export interface ChampionshipStanding {
  driver: Driver;
  montagnePoints: number;
  rallyePoints: number;
  totalPoints: number;
  position: number;
  previousPosition?: number;
  positionChange: number;
  // Positions spécifiques pour chaque type de classement
  previousGeneralPosition?: number;
  previousMontagnePosition?: number;
  previousRallyePosition?: number;
  previousR2Position?: number;
}
