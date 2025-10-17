import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import {
  sortStandingsByPoints,
  sortMontagneStandingsByPoints,
  sortRallyeStandingsByPoints,
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
export const calculateR2DriverPoints = (driverId: string, races: Race[]): number => {
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

  // Filtrer uniquement les pilotes (exclure les copilotes)
  const pilotes = drivers.filter(driver => driver.driverRole === 'pilote');

  const standings = pilotes.map(driver => {
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

  // Filtrer uniquement les pilotes (exclure les copilotes)
  const pilotes = drivers.filter(driver => driver.driverRole === 'pilote');

  const standings = pilotes
    .map(driver => {
      const montagnePoints = calculateDriverPoints(driver.id, montagneRaces);
      const previousStanding = findPreviousStanding(driver.id, previousStandings);
      
      return createBaseStanding(driver, montagnePoints, 0, previousStanding);
    })
    .filter(standing => standing.montagnePoints > 0);

  sortMontagneStandingsByPoints(standings);
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

  // Filtrer uniquement les pilotes (exclure les copilotes)
  const pilotes = drivers.filter(driver => driver.driverRole === 'pilote');

  const standings = pilotes
    .map(driver => {
      const rallyePoints = calculateDriverPoints(driver.id, rallyeRaces);
      const previousStanding = findPreviousStanding(driver.id, previousStandings);
      
      return createBaseStanding(driver, 0, rallyePoints, previousStanding);
    })
    .filter(standing => standing.rallyePoints > 0);

  sortRallyeStandingsByPoints(standings);
  calculatePositionsAndEvolution(standings, 'rallye');

  return standings;
};

// Calculer le classement C2 R2 pour les pilotes avec une Citroën C2 R2
export const calculateR2Standings = (
  drivers: Driver[],
  montagneRaces: Race[],
  rallyeRaces: Race[],
  previousStandings?: ChampionshipStanding[]
): ChampionshipStanding[] => {
  const allRaces = [...montagneRaces, ...rallyeRaces];
  
  // Filtrer uniquement les pilotes (exclure les copilotes)
  const pilotes = drivers.filter(driver => driver.driverRole === 'pilote');
  
  // Filtrer les pilotes qui ont au moins un résultat avec une C2 R2
  const c2r2Drivers = pilotes.filter(driver => {
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

  console.log('🏁 Calcul du classement R2:', {
    totalDrivers: drivers.length,
    r2Drivers: c2r2Drivers.length,
    r2DriversList: c2r2Drivers.map(d => `${d.name} (${d.carModel || 'Variable'})`)
  });

  if (c2r2Drivers.length === 0) {
    console.log('⚠️ Aucun pilote R2 trouvé');
    return [];
  }

  // Calculer les standings pour les pilotes R2 uniquement
  const standings = c2r2Drivers.map(driver => {
    const montagnePoints = calculateR2DriverPoints(driver.id, montagneRaces);
    const rallyePoints = calculateR2DriverPoints(driver.id, rallyeRaces);
    const previousStanding = findPreviousStanding(driver.id, previousStandings);
    
    return createBaseStanding(driver, montagnePoints, rallyePoints, previousStanding);
  });

  sortStandingsByPoints(standings);
  calculatePositionsAndEvolution(standings, 'r2');

  console.log('✅ Classement R2 calculé:', standings.slice(0, 3).map(s => ({
    name: s.driver.name,
    carModel: s.driver.carModel,
    position: s.position,
    totalPoints: s.totalPoints
  })));

  return standings;
};

// Calculer le classement Copilote (uniquement les copilotes en Rallye)
export const calculateCopiloteStandings = (
  drivers: Driver[],
  rallyeRaces: Race[],
  previousStandings?: ChampionshipStanding[]
): ChampionshipStanding[] => {
  console.log('👥 [COPILOTE] ===== CALCUL DU CLASSEMENT COPILOTE =====');
  console.log('👥 [COPILOTE] Pilotes reçus:', drivers.length);
  console.log('👥 [COPILOTE] Courses rallye reçues:', rallyeRaces.length);

  // Log détaillé des courses rallye
  rallyeRaces.forEach(race => {
    console.log(`👥 [COPILOTE] Course: ${race.name}`);
    console.log(`  - Résultats: ${race.results.length}`);
    if (race.results.length > 0) {
      race.results.forEach((result, idx) => {
        console.log(`    ${idx + 1}. DriverId: ${result.driverId.slice(0, 8)}... - Position: ${result.position} - Points: ${result.points}`);
      });
    }
  });

  // Filtrer uniquement les copilotes
  const copilotes = drivers.filter(driver => driver.driverRole === 'copilote');

  console.log('👥 [COPILOTE] Copilotes trouvés:', copilotes.length);
  copilotes.forEach((copilote, idx) => {
    console.log(`  ${idx + 1}. ${copilote.name} (ID: ${copilote.id.slice(0, 8)}..., Role: ${copilote.driverRole})`);
  });

  if (copilotes.length === 0) {
    console.warn('⚠️ [COPILOTE] AUCUN COPILOTE TROUVÉ !');
    return [];
  }

  const standings = copilotes
    .map(driver => {
      const rallyePoints = calculateDriverPoints(driver.id, rallyeRaces);
      console.log(`👥 [COPILOTE] ${driver.name}: ${rallyePoints} points`);
      
      const previousStanding = findPreviousStanding(driver.id, previousStandings);
      
      return createBaseStanding(driver, 0, rallyePoints, previousStanding);
    })
    .filter(standing => {
      const hasPoints = standing.rallyePoints > 0;
      if (!hasPoints) {
        console.log(`  ⏭️ [COPILOTE] ${standing.driver.name} exclu (0 points)`);
      }
      return hasPoints;
    });

  console.log('👥 [COPILOTE] Classement avant tri:', standings.length, 'copilotes avec des points');

  sortRallyeStandingsByPoints(standings);
  calculatePositionsAndEvolution(standings, 'rallye');

  console.log('👥 [COPILOTE] ===== CLASSEMENT FINAL =====');
  standings.forEach((standing, idx) => {
    console.log(`  ${idx + 1}. ${standing.driver.name}: ${standing.rallyePoints} points (Position: ${standing.position})`);
  });
  console.log('👥 [COPILOTE] =====================================');

  return standings;
};

export const getPositionBadgeColor = (position: number): string => {
  if (position === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
  if (position === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
  if (position === 3) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
  if (position <= 5) return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white';
  return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
};
