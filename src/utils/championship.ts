
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
  previousStandings?: ChampionshipStanding[]
): ChampionshipStanding[] => {
  const standings = drivers.map(driver => {
    const montagnePoints = calculateDriverPoints(driver.id, montagneRaces);
    const rallyePoints = calculateDriverPoints(driver.id, rallyeRaces);
    const totalPoints = montagnePoints + rallyePoints;

    // Trouver la position précédente du pilote
    const previousPosition = previousStandings?.find(s => s.driver.id === driver.id)?.position;

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
    } else {
      standing.positionChange = 0; // Nouveau pilote ou première course
    }
  });

  return standings;
};

export const getPositionBadgeColor = (position: number): string => {
  if (position === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
  if (position === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
  if (position === 3) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
  if (position <= 5) return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white';
  return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
};
