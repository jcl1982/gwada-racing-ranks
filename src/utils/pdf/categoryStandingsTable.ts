
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Race, Driver } from '@/types/championship';
import { getPositionRowStyle, PDF_STYLES } from '../pdfStyles';

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
  const tableData = standings.map((standing) => {
    const row = [standing.position.toString(), standing.driver.name, standing.driver.carModel || '-'];
    
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
    
    // Ajouter les points totaux
    row.push(`${standing.points}`);
    
    // Ajouter l'écart de points
    const leaderPoints = standings[0]?.points || 0;
    const gap = leaderPoints - standing.points;
    const gapText = gap === 0 ? '—' : `-${gap}`;
    row.push(gapText);
    
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
