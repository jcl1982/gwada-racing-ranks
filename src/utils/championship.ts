
import { Driver, Race, ChampionshipStanding } from '@/types/championship';

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
    const totalPoints = montagnePoints + rallyePoints;

    // Trouver la position précédente du pilote
    const previousStanding = previousStandings?.find(s => s.driver.id === driver.id);
    const previousPosition = previousStanding?.position;

    console.log(`🔍 Pilote ${driver.name}:`, {
      montagnePoints,
      rallyePoints,
      totalPoints: totalPoints,
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

  // Sort by total points (descending), then by name (ascending) for stable order
  standings.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return a.driver.name.localeCompare(b.driver.name);
  });
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
    // Utiliser la fonction spécifique qui vérifie le car_model dans les résultats
    const montagnePoints = calculateC2R2DriverPoints(driver.id, montagneRaces);
    const rallyePoints = calculateC2R2DriverPoints(driver.id, rallyeRaces);
    const totalPoints = montagnePoints + rallyePoints;

    // Trouver la position précédente du pilote dans le classement C2 R2
    const previousStanding = previousStandings?.find(s => s.driver.id === driver.id);
    const previousPosition = previousStanding?.position;

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

  // Trier par points totaux (décroissant), puis par nom (alphabétique) pour un ordre stable
  standings.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return a.driver.name.localeCompare(b.driver.name);
  });
  standings.forEach((standing, index) => {
    standing.position = index + 1;
    
    if (standing.previousPosition) {
      standing.positionChange = standing.previousPosition - standing.position;
    } else {
      standing.positionChange = 0;
    }
  });

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
