import * as XLSX from 'xlsx';
import { ChampionshipStanding, Race, Driver } from '@/types/championship';

interface CategoryStanding {
  driver: Driver;
  points: number;
  position: number;
  positionChange?: number;
  previousPosition?: number;
}

export const exportGeneralStandingsToExcel = (
  standings: ChampionshipStanding[],
  championshipTitle: string,
  championshipYear: string
) => {
  // Préparer les données pour l'export
  const data = standings.map(standing => ({
    'Position': standing.position,
    'Pilote': standing.driver.name,
    'Équipe': standing.driver.team || '-',
    'Véhicule': standing.driver.carModel || '-',
    'Points Montagne': standing.montagnePoints,
    'Points Rallye': standing.rallyePoints,
    'Total Points': standing.totalPoints,
    'Évolution': standing.positionChange > 0 ? `+${standing.positionChange}` : 
                 standing.positionChange < 0 ? standing.positionChange : '-'
  }));

  // Créer un nouveau classeur
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  // Ajouter le titre
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Classement Général');

  // Générer le fichier
  const filename = `classement-general-${championshipYear.replace(/\s+/g, '-')}.xlsx`;
  XLSX.writeFile(workbook, filename);
};

export const exportCategoryStandingsToExcel = (
  standings: CategoryStanding[],
  races: Race[],
  displayTitle: string,
  type: 'montagne' | 'rallye' | 'r2' | 'acceleration' | 'karting'
) => {
  // Filtrer les courses pertinentes
  const relevantRaces = races.filter(race => {
    return standings.some(standing => {
      const result = race.results.find(r => r.driverId === standing.driver.id);
      return result && result.points > 0;
    });
  });

  // Préparer les données de base
  const baseData = standings.map(standing => {
    const row: any = {
      'Position': standing.position,
      'Pilote': standing.driver.name,
      'Équipe': standing.driver.team || '-',
      'Véhicule': standing.driver.carModel || '-'
    };

    // Ajouter les points par course
    relevantRaces.forEach((race, index) => {
      const result = race.results.find(r => r.driverId === standing.driver.id);
      const points = result?.points || 0;
      row[`Course ${index + 1} (${race.name})`] = points > 0 ? points : '-';
    });

    // Ajouter le total
    row['Total Points'] = standing.points;

    // Ajouter l'évolution
    if (standing.positionChange !== undefined) {
      row['Évolution'] = standing.positionChange > 0 ? `+${standing.positionChange}` : 
                         standing.positionChange < 0 ? standing.positionChange : '-';
    }

    return row;
  });

  // Créer un nouveau classeur
  const worksheet = XLSX.utils.json_to_sheet(baseData);
  const workbook = XLSX.utils.book_new();
  
  // Ajouter le classement principal
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Classement');

  // Ajouter une feuille avec les détails des courses
  const racesData = relevantRaces.map((race, index) => ({
    'N°': index + 1,
    'Nom': race.name,
    'Date': race.date,
    'Type': race.type,
    'Organisateur': race.organizer || '-'
  }));

  if (racesData.length > 0) {
    const racesWorksheet = XLSX.utils.json_to_sheet(racesData);
    XLSX.utils.book_append_sheet(workbook, racesWorksheet, 'Courses');
  }

  // Générer le fichier
  const filename = `${displayTitle.toLowerCase().replace(/\s+/g, '-')}.xlsx`;
  XLSX.writeFile(workbook, filename);
};

export const exportAllStandingsToExcel = (
  generalStandings: ChampionshipStanding[],
  montagneStandings: CategoryStanding[],
  rallyeStandings: CategoryStanding[],
  r2Standings: CategoryStanding[],
  kartingStandings: CategoryStanding[],
  accelerationStandings: CategoryStanding[],
  montagneRaces: Race[],
  rallyeRaces: Race[],
  kartingRaces: Race[],
  accelerationRaces: Race[],
  championshipTitle: string,
  championshipYear: string
) => {
  const workbook = XLSX.utils.book_new();

  // Classement Général
  const generalData = generalStandings.map(standing => ({
    'Position': standing.position,
    'Pilote': standing.driver.name,
    'Équipe': standing.driver.team || '-',
    'Véhicule': standing.driver.carModel || '-',
    'Points Montagne': standing.montagnePoints,
    'Points Rallye': standing.rallyePoints,
    'Total Points': standing.totalPoints,
    'Évolution': standing.positionChange > 0 ? `+${standing.positionChange}` : 
                 standing.positionChange < 0 ? standing.positionChange : '-'
  }));
  const generalWorksheet = XLSX.utils.json_to_sheet(generalData);
  XLSX.utils.book_append_sheet(workbook, generalWorksheet, 'Classement Général');

  // Fonction helper pour ajouter un classement de catégorie
  const addCategorySheet = (
    standings: CategoryStanding[],
    races: Race[],
    sheetName: string
  ) => {
    if (standings.length === 0) return;

    const data = standings.map(standing => {
      const row: any = {
        'Position': standing.position,
        'Pilote': standing.driver.name,
        'Équipe': standing.driver.team || '-',
        'Véhicule': standing.driver.carModel || '-'
      };

      races.forEach((race, index) => {
        const result = race.results.find(r => r.driverId === standing.driver.id);
        const points = result?.points || 0;
        row[`Course ${index + 1}`] = points > 0 ? points : '-';
      });

      row['Total Points'] = standing.points;
      
      if (standing.positionChange !== undefined) {
        row['Évolution'] = standing.positionChange > 0 ? `+${standing.positionChange}` : 
                           standing.positionChange < 0 ? standing.positionChange : '-';
      }

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  };

  // Ajouter tous les classements de catégorie
  addCategorySheet(montagneStandings, montagneRaces, 'Montagne');
  addCategorySheet(rallyeStandings, rallyeRaces, 'Rallye');
  addCategorySheet(r2Standings, montagneRaces.concat(rallyeRaces), 'R2');
  addCategorySheet(kartingStandings, kartingRaces, 'Karting');
  addCategorySheet(accelerationStandings, accelerationRaces, 'Accélération');

  // Générer le fichier
  const filename = `tous-classements-${championshipYear.replace(/\s+/g, '-')}.xlsx`;
  XLSX.writeFile(workbook, filename);
};
