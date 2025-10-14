
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
      const evolutionIndicator = getPositionEvolutionIndicator(
        standing.positionChange,
        standing.previousPosition
      );
      
      const leaderPoints = standings[0]?.totalPoints || 0;
      const gap = leaderPoints - standing.totalPoints;
      const gapText = gap === 0 ? '—' : `+${gap}`;
      
      return [
        standing.position.toString(),
        standing.driver.name,
        `${standing.montagnePoints}`,
        `${standing.rallyePoints}`,
        `${standing.totalPoints}`,
        gapText,
        evolutionIndicator
      ];
    });

  console.log('📄 Données du tableau PDF:', tableData);
  
  autoTable(doc, {
    head: [['Pos', 'Pilote', 'Montagne', 'Rallye', 'Total', 'Écart', 'Évol.']],
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
        
        // Colorer la colonne évolution (colonne 6)
        if (data.column.index === 6) {
          const evolutionColor = getEvolutionColor(
            standing.positionChange,
            standing.previousPosition
          );
          data.cell.styles.textColor = evolutionColor;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
};
