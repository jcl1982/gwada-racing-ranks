
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Race, Driver } from '@/types/championship';
import { getPositionEvolutionIndicator, getEvolutionColor, getPositionRowStyle, PDF_STYLES } from '../pdfStyles';

export const createCategoryStandingsTable = (
  doc: jsPDF,
  headers: string[],
  standings: Array<{
    driver: Driver;
    points: number;
    position: number;
    positionChange?: number;
    previousPosition?: number;
  }>,
  races: Race[]
) => {
  // Calculer les évolutions entre les courses de la même catégorie
  const standingsWithEvolution = standings.map((standing) => {
    let evolutionBetweenRaces = 0;
    
    if (races.length >= 2) {
      // Calculer la position du pilote après la première course
      const firstRaceResults = races[0].results;
      const firstRaceResult = firstRaceResults.find(r => r.driverId === standing.driver.id);
      const firstRacePosition = firstRaceResult ? firstRaceResult.position : 999;
      
      // Calculer la position du pilote après la deuxième course
      const secondRaceResults = races[1].results;
      const secondRaceResult = secondRaceResults.find(r => r.driverId === standing.driver.id);
      const secondRacePosition = secondRaceResult ? secondRaceResult.position : 999;
      
      // Si le pilote a participé aux deux courses, calculer l'évolution
      if (firstRaceResult && secondRaceResult) {
        evolutionBetweenRaces = firstRacePosition - secondRacePosition;
      }
    }
    
    return {
      ...standing,
      evolutionBetweenRaces
    };
  });

  const tableData = standingsWithEvolution.map((standing) => {
    const evolutionIndicator = races.length >= 2 && standing.evolutionBetweenRaces !== 0 
      ? (standing.evolutionBetweenRaces > 0 ? `+${standing.evolutionBetweenRaces}` : `${standing.evolutionBetweenRaces}`)
      : '-';
    
    const row = [standing.position.toString(), evolutionIndicator, standing.driver.name];
    
    let previousTotal = 0;
    races.forEach(race => {
      const result = race.results.find(r => r.driverId === standing.driver.id);
      if (result) {
        const currentRacePoints = result.points;
        const newTotal = previousTotal + currentRacePoints;
        row.push(`${currentRacePoints} pts (P${result.position})`);
        previousTotal = newTotal;
      } else {
        row.push('-');
      }
    });
    
    row.push(`${standing.points} pts`);
    return row;
  });

  console.log('📄 Données du tableau PDF (catégorie):', tableData);
  
  // Mise à jour de l'en-tête pour remplacer "Position" par "Pos"
  const updatedHeaders = [...headers];
  updatedHeaders[0] = 'Pos';
  
  autoTable(doc, {
    head: [updatedHeaders],
    body: tableData,
    startY: PDF_STYLES.positions.tableStart.y,
    didParseCell: function(data) {
      // Colorer la colonne évolution (index 1)
      if (data.column.index === 1 && data.section === 'body') {
        const standing = standingsWithEvolution[data.row.index];
        if (races.length >= 2 && standing.evolutionBetweenRaces !== 0) {
          const color = standing.evolutionBetweenRaces > 0 
            ? PDF_STYLES.colors.success 
            : PDF_STYLES.colors.danger;
          data.cell.styles.textColor = color;
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = PDF_STYLES.colors.gray600;
        }
      }
      
      // Colorer les lignes selon la position
      if (data.section === 'body') {
        const standing = standings[data.row.index];
        const positionStyle = getPositionRowStyle(standing.position);
        
        if (positionStyle) {
          data.cell.styles.fillColor = positionStyle.fillColor;
          data.cell.styles.textColor = positionStyle.textColor;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
};
