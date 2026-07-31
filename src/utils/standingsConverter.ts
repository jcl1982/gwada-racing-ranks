import { ChampionshipStanding, Driver } from '@/types/championship';

/**
 * Format simplifié utilisé par StandingsTable et PodiumSection
 */
export interface SimplifiedStanding {
  driver: Driver;
  points: number;
  position: number;
}

/**
 * Convertit un ChampionshipStanding complet vers le format simplifié
 * utilisé par StandingsTable et PodiumSection
 */
export const toSimplifiedStanding = (
  standing: ChampionshipStanding,
  type: 'general' | 'montagne' | 'rallye' | 'r2' | 'copilote'
): SimplifiedStanding => {
  switch (type) {
    case 'montagne':
      return {
        driver: standing.driver,
        points: standing.montagnePoints,
        position: standing.position
      };

    case 'rallye':
    case 'copilote':
      return {
        driver: standing.driver,
        points: standing.rallyePoints,
        position: standing.position
      };

    case 'r2':
    case 'general':
    default:
      return {
        driver: standing.driver,
        points: standing.totalPoints,
        position: standing.position
      };
  }
};

/**
 * Convertit un tableau de ChampionshipStanding vers le format simplifié
 */
export const toSimplifiedStandings = (
  standings: ChampionshipStanding[],
  type: 'general' | 'montagne' | 'rallye' | 'r2' | 'copilote'
): SimplifiedStanding[] => {
  return standings.map(standing => toSimplifiedStanding(standing, type));
};
