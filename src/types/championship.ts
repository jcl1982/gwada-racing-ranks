
export interface Driver {
  id: string;
  name: string;
  team?: string;
  number?: number;
  carModel?: string;
}

export interface RaceResult {
  driverId: string;
  position: number;
  points: number;
  time?: string;
  dnf?: boolean;
}

export interface Race {
  id: string;
  name: string;
  date: string;
  type: 'montagne' | 'rallye';
  results: RaceResult[];
}

export interface ChampionshipStanding {
  driver: Driver;
  montagnePoints: number;
  rallyePoints: number;
  totalPoints: number;
  position: number;
  previousPosition?: number;
  positionChange: number;
}
