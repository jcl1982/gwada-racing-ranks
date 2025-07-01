
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Race, Driver } from '@/types/championship';
import { getPositionEvolutionIndicator, getEvolutionColor } from '../pdfStyles';

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
    const evolutionIndicator = getPositionEvolutionIndicator(
      standing.positionChange || 0, 
      standing.previousPosition
    );
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
  
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 75,
    didParseCell: function(data) {
      // Colorer la colonne évolution (index 1)
      if (data.column.index === 1 && data.section === 'body') {
        const standing = standings[data.row.index];
        const color = getEvolutionColor(standing.positionChange || 0, standing.previousPosition);
        data.cell.styles.textColor = color;
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });
};
