import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import {
  sortStandingsByPoints,
  calculatePositionsAndEvolution,
  findPreviousStanding,
  createBaseStanding,
  type StandingType
} from './championshipEvolution';

export const calculateDriverPoints = (driverId: string, races: Race[]): number => {
  return races.reduce((total, race) => {
    const result = race.results.find(r => r.driverId === driverId);
    return total + (result?.points || 0);
  }, 0);
};

// Calculer les points d'un pilote uniquement pour les courses où il a utilisé une C2 R2
export const calculateC2R2DriverPoints = (driverId: string, races: Race[]): number => {
  return races.reduce((total, race) => {
    const result = race.results.find(r => r.driverId === driverId);
    // Ne compter que si le car_model contient "C2" et "R2"
    if (result && result.carModel?.toLowerCase().includes('c2') && result.carModel?.toLowerCase().includes('r2')) {
      return total + result.points;
    }
    return total;
  }, 0);
};

export const calculateChampionshipStandings = (
  drivers: Driver[],
  montagneRaces: Race[],
  rallyeRaces: Race[],
  previousStandings?: ChampionshipStanding[]
): ChampionshipStanding[] => {
  console.log('🏆 Calcul des standings généraux:', {
    drivers: drivers.length,
    montagneRaces: montagneRaces.length,
    rallyeRaces: rallyeRaces.length,
    previousStandings: previousStandings?.length || 0
  });

  const standings = drivers.map(driver => {
    const montagnePoints = calculateDriverPoints(driver.id, montagneRaces);
    const rallyePoints = calculateDriverPoints(driver.id, rallyeRaces);
    const previousStanding = findPreviousStanding(driver.id, previousStandings);
    
    return createBaseStanding(driver, montagnePoints, rallyePoints, previousStanding);
  });

  sortStandingsByPoints(standings);
  calculatePositionsAndEvolution(standings, 'general');

  return standings;
};

// Calculer le classement Montagne
export const calculateMontagneStandings = (
  drivers: Driver[],
  montagneRaces: Race[],
  previousStandings?: ChampionshipStanding[]
): ChampionshipStanding[] => {
  console.log('⛰️ Calcul des standings montagne:', {
    drivers: drivers.length,
    montagneRaces: montagneRaces.length,
    previousStandings: previousStandings?.length || 0
  });

  const standings = drivers.map(driver => {
    const montagnePoints = calculateDriverPoints(driver.id, montagneRaces);
    const previousStanding = findPreviousStanding(driver.id, previousStandings);
    
    return createBaseStanding(driver, montagnePoints, 0, previousStanding);
  });

  sortStandingsByPoints(standings);
  calculatePositionsAndEvolution(standings, 'montagne');

  return standings;
};

// Calculer le classement Rallye
export const calculateRallyeStandings = (
  drivers: Driver[],
  rallyeRaces: Race[],
  previousStandings?: ChampionshipStanding[]
): ChampionshipStanding[] => {
  console.log('🏁 Calcul des standings rallye:', {
    drivers: drivers.length,
    rallyeRaces: rallyeRaces.length,
    previousStandings: previousStandings?.length || 0
  });

  const standings = drivers.map(driver => {
    const rallyePoints = calculateDriverPoints(driver.id, rallyeRaces);
    const previousStanding = findPreviousStanding(driver.id, previousStandings);
    
    return createBaseStanding(driver, 0, rallyePoints, previousStanding);
  });

  sortStandingsByPoints(standings);
  calculatePositionsAndEvolution(standings, 'rallye');

  return standings;
};

// Calculer le classement C2 R2 pour les pilotes avec une Citroën C2 R2
export const calculateC2R2Standings = (
  drivers: Driver[],
  montagneRaces: Race[],
  rallyeRaces: Race[],
  previousStandings?: ChampionshipStanding[]
): ChampionshipStanding[] => {
  const allRaces = [...montagneRaces, ...rallyeRaces];
  
  // Filtrer les pilotes qui ont au moins un résultat avec une C2 R2
  const c2r2Drivers = drivers.filter(driver => {
    // Vérifier si le pilote a une C2 R2 dans sa fiche
    const hasC2R2Profile = driver.carModel?.toLowerCase().includes('c2') && 
                           driver.carModel?.toLowerCase().includes('r2');
    
    // Vérifier si le pilote a au moins une course avec une C2 R2
    const hasC2R2Results = allRaces.some(race => 
      race.results.some(result => 
        result.driverId === driver.id && 
        result.carModel?.toLowerCase().includes('c2') && 
        result.carModel?.toLowerCase().includes('r2')
      )
    );
    
    return hasC2R2Profile || hasC2R2Results;
  });

  console.log('🏁 Calcul du classement C2 R2:', {
    totalDrivers: drivers.length,
    c2r2Drivers: c2r2Drivers.length,
    c2r2DriversList: c2r2Drivers.map(d => `${d.name} (${d.carModel || 'Variable'})`)
  });

  if (c2r2Drivers.length === 0) {
    console.log('⚠️ Aucun pilote C2 R2 trouvé');
    return [];
  }

  // Calculer les standings pour les pilotes C2 R2 uniquement
  const standings = c2r2Drivers.map(driver => {
    const montagnePoints = calculateC2R2DriverPoints(driver.id, montagneRaces);
    const rallyePoints = calculateC2R2DriverPoints(driver.id, rallyeRaces);
    const previousStanding = findPreviousStanding(driver.id, previousStandings);
    
    return createBaseStanding(driver, montagnePoints, rallyePoints, previousStanding);
  });

  sortStandingsByPoints(standings);
  calculatePositionsAndEvolution(standings, 'c2r2');

  console.log('✅ Classement C2 R2 calculé:', standings.slice(0, 3).map(s => ({
    name: s.driver.name,
    carModel: s.driver.carModel,
    position: s.position,
    totalPoints: s.totalPoints
  })));

  return standings;
};

export const getPositionBadgeColor = (position: number): string => {
  if (position === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
  if (position === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
  if (position === 3) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
  if (position <= 5) return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white';
  return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
};
