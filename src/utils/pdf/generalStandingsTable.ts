
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChampionshipStanding } from '@/types/championship';
import { getPositionEvolutionIndicator, getEvolutionColor, PDF_STYLES, getPositionRowStyle } from '../pdfStyles';

export const createGeneralStandingsTable = (
  doc: jsPDF, 
  standings: ChampionshipStanding[]
) => {
  const tableData = standings
    .sort((a, b) => a.position - b.position)
    .map(standing => {
      const evolutionIndicator = getPositionEvolutionIndicator(standing.positionChange, standing.previousPosition);
      return [
        standing.position.toString(),
        evolutionIndicator,
        standing.driver.name,
        standing.driver.carModel || '-',
        `${standing.montagnePoints}`,
        `${standing.rallyePoints}`,
        `${standing.totalPoints}`
      ];
    });

  console.log('📄 Données du tableau PDF:', tableData);
  
  autoTable(doc, {
    head: [['Pos', 'Évol.', 'Pilote', 'Véhicule', 'Montagne', 'Rallye', 'Total']],
    body: tableData,
    startY: PDF_STYLES.positions.tableStart.y,
    didParseCell: function(data) {
      // Colorer la colonne évolution (index 1)
      if (data.column.index === 1 && data.section === 'body') {
        const standing = standings[data.row.index];
        const color = getEvolutionColor(standing.positionChange, standing.previousPosition);
        data.cell.styles.textColor = color;
        data.cell.styles.fontStyle = 'bold';
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
