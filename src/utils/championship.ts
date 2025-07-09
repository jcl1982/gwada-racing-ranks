
import { Driver, Race, ChampionshipStanding } from '@/types/championship';

export const calculateDriverPoints = (driverId: string, races: Race[]): number => {
  return races.reduce((total, race) => {
    const result = race.results.find(r => r.driverId === driverId);
    return total + (result?.points || 0);
  }, 0);
};

export const calculateChampionshipStandings = (
  drivers: Driver[],
  montagneRaces: Race[],
  rallyeRaces: Race[],
  c2r2Races: Race[] = [],
  previousStandings?: ChampionshipStanding[]
): ChampionshipStanding[] => {
  console.log('🏆 Calcul des standings généraux:', {
    drivers: drivers.length,
    montagneRaces: montagneRaces.length,
    rallyeRaces: rallyeRaces.length,
    c2r2Races: c2r2Races.length,
    previousStandings: previousStandings?.length || 0,
    previousStandingsData: previousStandings?.slice(0, 3).map(s => ({
      position: s.position,
      name: s.driver.name,
      totalPoints: s.totalPoints
    }))
  });

  const standings = drivers.map(driver => {
    const montagnePoints = calculateDriverPoints(driver.id, montagneRaces);
    const rallyePoints = calculateDriverPoints(driver.id, rallyeRaces);
    const c2r2Points = calculateDriverPoints(driver.id, c2r2Races);
    const totalPoints = montagnePoints + rallyePoints + c2r2Points;

    // Trouver la position précédente du pilote
    const previousStanding = previousStandings?.find(s => s.driver.id === driver.id);
    const previousPosition = previousStanding?.position;

    console.log(`🔍 Pilote ${driver.name}:`, {
      montagnePoints,
      rallyePoints,
      c2r2Points,
      totalPoints,
      previousPosition,
      previousStanding: previousStanding ? 'trouvé' : 'non trouvé'
    });

    return {
      driver,
      montagnePoints,
      rallyePoints,
      totalPoints,
      position: 0, // Will be calculated after sorting
      previousPosition,
      positionChange: 0 // Will be calculated after sorting
    };
  });

  // Sort by total points (descending) and assign positions
  standings.sort((a, b) => b.totalPoints - a.totalPoints);
  standings.forEach((standing, index) => {
    standing.position = index + 1;
    
    // Calculer le changement de position
    if (standing.previousPosition) {
      standing.positionChange = standing.previousPosition - standing.position;
      console.log(`📈 ${standing.driver.name}: ${standing.previousPosition} → ${standing.position} = ${standing.positionChange}`);
    } else {
      standing.positionChange = 0; // Nouveau pilote ou première course
      console.log(`🆕 ${standing.driver.name}: Nouveau pilote (pas de changement)`);
    }
  });

  console.log('✅ Standings calculés avec évolution:', standings.slice(0, 3).map(s => ({
    name: s.driver.name,
    position: s.position,
    previousPosition: s.previousPosition,
    positionChange: s.positionChange
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
