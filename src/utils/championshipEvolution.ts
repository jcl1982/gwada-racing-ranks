import { Driver, ChampionshipStanding } from '@/types/championship';

/**
 * Type de classement pour identifier quelle position précédente utiliser
 */
export type StandingType = 'general' | 'montagne' | 'rallye' | 'c2r2';

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
 * Obtient la position précédente d'un pilote selon le type de classement
 */
const getPreviousPosition = (
  standing: ChampionshipStanding,
  type: StandingType
): number | undefined => {
  switch (type) {
    case 'general':
      return standing.previousGeneralPosition;
    case 'montagne':
      return standing.previousMontagnePosition;
    case 'rallye':
      return standing.previousRallyePosition;
    case 'c2r2':
      return standing.previousC2R2Position;
    default:
      return undefined;
  }
};

/**
 * Calcule et attribue les positions et évolutions pour un classement
 */
export const calculatePositionsAndEvolution = (
  standings: ChampionshipStanding[],
  type: StandingType
): void => {
  standings.forEach((standing, index) => {
    const newPosition = index + 1;
    standing.position = newPosition;
    
    const previousPosition = getPreviousPosition(standing, type);
    standing.previousPosition = previousPosition;
    
    if (previousPosition) {
      standing.positionChange = previousPosition - newPosition;
    } else {
      standing.positionChange = 0;
    }
  });
};

/**
 * Trouve la position précédente d'un pilote dans les classements sauvegardés
 */
export const findPreviousStanding = (
  driverId: string,
  previousStandings?: ChampionshipStanding[]
): ChampionshipStanding | undefined => {
  return previousStandings?.find(s => s.driver.id === driverId);
};

/**
 * Crée un standing de base pour un pilote
 */
export const createBaseStanding = (
  driver: Driver,
  montagnePoints: number,
  rallyePoints: number,
  previousStanding?: ChampionshipStanding
): ChampionshipStanding => {
  return {
    driver,
    montagnePoints,
    rallyePoints,
    totalPoints: montagnePoints + rallyePoints,
    position: 0,
    previousPosition: undefined,
    positionChange: 0,
    previousGeneralPosition: previousStanding?.previousGeneralPosition,
    previousMontagnePosition: previousStanding?.previousMontagnePosition,
    previousRallyePosition: previousStanding?.previousRallyePosition,
    previousC2R2Position: previousStanding?.previousC2R2Position
  };
};
