import { Driver, ChampionshipStanding } from '@/types/championship';

/**
 * Trie les standings par points décroissants, puis par nom alphabétique
 */
export const sortStandingsByPoints = (standings: ChampionshipStanding[]): void => {
  standings.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return a.driver.name.localeCompare(b.driver.name);
  });
};

/**
 * Trie les standings Montagne par points Montagne décroissants, puis par nom alphabétique
 */
export const sortMontagneStandingsByPoints = (standings: ChampionshipStanding[]): void => {
  standings.sort((a, b) => {
    if (b.montagnePoints !== a.montagnePoints) {
      return b.montagnePoints - a.montagnePoints;
    }
    return a.driver.name.localeCompare(b.driver.name);
  });
};

/**
 * Trie les standings Rallye par points Rallye décroissants, puis par nom alphabétique
 */
export const sortRallyeStandingsByPoints = (standings: ChampionshipStanding[]): void => {
  standings.sort((a, b) => {
    if (b.rallyePoints !== a.rallyePoints) {
      return b.rallyePoints - a.rallyePoints;
    }
    return a.driver.name.localeCompare(b.driver.name);
  });
};

/**
 * Calcule et attribue les positions pour un classement
 */
export const calculatePositions = (standings: ChampionshipStanding[]): void => {
  standings.forEach((standing, index) => {
    standing.position = index + 1;
  });
};

/**
 * Crée un standing de base pour un pilote
 */
export const createBaseStanding = (
  driver: Driver,
  montagnePoints: number,
  rallyePoints: number
): ChampionshipStanding => {
  return {
    driver,
    montagnePoints,
    rallyePoints,
    totalPoints: montagnePoints + rallyePoints,
    position: 0
  };
};
