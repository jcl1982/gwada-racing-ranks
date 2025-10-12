import { ChampionshipStanding, Driver } from '@/types/championship';

/**
 * Format simplifié utilisé par StandingsTable et PodiumSection
 */
export interface SimplifiedStanding {
  driver: Driver;
  points: number;
  position: number;
  positionChange?: number;
  previousPosition?: number;
}

/**
 * Convertit un ChampionshipStanding complet vers le format simplifié
 * utilisé par StandingsTable et PodiumSection
 */
export const toSimplifiedStanding = (
  standing: ChampionshipStanding,
  type: 'general' | 'montagne' | 'rallye' | 'c2r2'
): SimplifiedStanding => {
  switch (type) {
    case 'montagne':
      return {
        driver: standing.driver,
        points: standing.montagnePoints,
        position: standing.position,
        positionChange: standing.positionChange,
        previousPosition: standing.previousMontagnePosition
      };
    
    case 'rallye':
      return {
        driver: standing.driver,
        points: standing.rallyePoints,
        position: standing.position,
        positionChange: standing.positionChange,
        previousPosition: standing.previousRallyePosition
      };
    
    case 'c2r2':
    case 'general':
    default:
      return {
        driver: standing.driver,
        points: standing.totalPoints,
        position: standing.position,
        positionChange: standing.positionChange,
        previousPosition: standing.previousGeneralPosition || standing.previousPosition
      };
  }
};

/**
 * Convertit un tableau de ChampionshipStanding vers le format simplifié
 */
export const toSimplifiedStandings = (
  standings: ChampionshipStanding[],
  type: 'general' | 'montagne' | 'rallye' | 'c2r2'
): SimplifiedStanding[] => {
  return standings.map(standing => toSimplifiedStanding(standing, type));
};
