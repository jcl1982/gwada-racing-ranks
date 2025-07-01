
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
      const firstRaceResults = races[0].results;
      const firstRaceResult = firstRaceResults.find(r => r.driverId === standing.driver.id);
      const firstRacePosition = firstRaceResult ? firstRaceResult.position : 999;
      
      const secondRaceResults = races[1].results;
      const secondRaceResult = secondRaceResults.find(r => r.driverId === standing.driver.id);
      const secondRacePosition = secondRaceResult ? secondRaceResult.position : 999;
      
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
  
  const updatedHeaders = [...headers];
  updatedHeaders[0] = 'Pos';
  
  autoTable(doc, {
    head: [updatedHeaders],
    body: tableData,
    startY: PDF_STYLES.positions.tableStart.y,
    didParseCell: function(data) {
      // Styliser la colonne position (index 0) avec couleurs et formes
      if (data.column.index === 0 && data.section === 'body') {
        const standing = standings[data.row.index];
        const positionStyle = getPositionRowStyle(standing.position);
        
        if (positionStyle) {
          data.cell.styles.fillColor = positionStyle.fillColor;
          data.cell.styles.textColor = positionStyle.textColor;
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.halign = 'center';
          data.cell.styles.valign = 'middle';
        } else {
          // Style par défaut pour les autres positions
          data.cell.styles.fillColor = PDF_STYLES.colors.gray100;
          data.cell.styles.textColor = PDF_STYLES.colors.gray800;
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.halign = 'center';
        }
      }
      
      // Styliser la colonne évolution (index 1)
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
      
      // Styliser les colonnes de points des courses (indices variables selon le nombre de courses)
      if (data.section === 'body' && data.column.index >= 3 && data.column.index < updatedHeaders.length - 1) {
        const cellText = data.cell.text[0];
        if (cellText && cellText !== '-' && cellText.includes('pts')) {
          // Extraire les points et la position
          const pointsMatch = cellText.match(/(\d+) pts/);
          const positionMatch = cellText.match(/P(\d+)/);
          
          if (pointsMatch && positionMatch) {
            const points = parseInt(pointsMatch[1]);
            const position = parseInt(positionMatch[1]);
            
            // Couleurs selon les points obtenus
            if (points >= 25) {
              data.cell.styles.fillColor = PDF_STYLES.colors.gold;
              data.cell.styles.textColor = [255, 255, 255];
            } else if (points >= 18) {
              data.cell.styles.fillColor = PDF_STYLES.colors.silver;
              data.cell.styles.textColor = [255, 255, 255];
            } else if (points >= 12) {
              data.cell.styles.fillColor = PDF_STYLES.colors.bronze;
              data.cell.styles.textColor = [255, 255, 255];
            } else if (points > 0) {
              data.cell.styles.fillColor = PDF_STYLES.colors.blueBadge;
              data.cell.styles.textColor = PDF_STYLES.colors.blue;
            }
            
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.halign = 'center';
          }
        }
      }
      
      // Styliser la colonne total des points (dernière colonne)
      if (data.column.index === updatedHeaders.length - 1 && data.section === 'body') {
        const standing = standings[data.row.index];
        
        // Couleurs graduées selon le total de points
        if (standing.position === 1) {
          data.cell.styles.fillColor = PDF_STYLES.colors.gold;
          data.cell.styles.textColor = [255, 255, 255];
        } else if (standing.position === 2) {
          data.cell.styles.fillColor = PDF_STYLES.colors.silver;
          data.cell.styles.textColor = [255, 255, 255];
        } else if (standing.position === 3) {
          data.cell.styles.fillColor = PDF_STYLES.colors.bronze;
          data.cell.styles.textColor = [255, 255, 255];
        } else if (standing.position <= 5) {
          data.cell.styles.fillColor = PDF_STYLES.colors.blue;
          data.cell.styles.textColor = [255, 255, 255];
        } else {
          data.cell.styles.fillColor = PDF_STYLES.colors.gray200;
          data.cell.styles.textColor = PDF_STYLES.colors.gray800;
        }
        
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.halign = 'center';
        data.cell.styles.valign = 'middle';
      }
    }
  });
};
