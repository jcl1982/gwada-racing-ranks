
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
        `${standing.montagnePoints}`,
        `${standing.rallyePoints}`,
        `${standing.totalPoints}`
      ];
    });

  console.log('📄 Données du tableau PDF:', tableData);
  
  autoTable(doc, {
    head: [['Pos', 'Évol.', 'Pilote', 'Montagne', 'Rallye', 'Total']],
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
        const standing = standings[data.row.index];
        const color = getEvolutionColor(standing.positionChange, standing.previousPosition);
        data.cell.styles.textColor = color;
        data.cell.styles.fontStyle = 'bold';
      }
      
      // Styliser la colonne points Montagne (index 3)
      if (data.column.index === 3 && data.section === 'body') {
        const standing = standings[data.row.index];
        if (standing.montagnePoints > 0) {
          data.cell.styles.fillColor = PDF_STYLES.colors.montagneLight;
          data.cell.styles.textColor = PDF_STYLES.colors.montagneDark;
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.halign = 'center';
        }
      }
      
      // Styliser la colonne points Rallye (index 4)
      if (data.column.index === 4 && data.section === 'body') {
        const standing = standings[data.row.index];
        if (standing.rallyePoints > 0) {
          data.cell.styles.fillColor = PDF_STYLES.colors.rallyeLight;
          data.cell.styles.textColor = PDF_STYLES.colors.rallyeDark;
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.halign = 'center';
        }
      }
      
      // Styliser la colonne total des points (index 5)
      if (data.column.index === 5 && data.section === 'body') {
        const standing = standings[data.row.index];
        
        // Couleurs graduées selon la position
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
