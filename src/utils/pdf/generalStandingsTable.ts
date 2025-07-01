
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChampionshipStanding } from '@/types/championship';
import { PDF_STYLES, getPositionEvolutionIndicator, getPositionRowStyle } from '../pdfStyles';

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
        standing.montagnePoints.toString(),
        standing.rallyePoints.toString(),
        standing.totalPoints.toString()
      ];
    });

  console.log('📄 Données du tableau PDF:', tableData);
  
  autoTable(doc, {
    head: [['Position', 'Évolution', 'Pilote', 'Trophée Montagne', 'Trophée Rallyes', 'Total']],
    body: tableData,
    startY: PDF_STYLES.positions.tableStart.y,
    styles: {
      fontSize: PDF_STYLES.fonts.normalSize,
      cellPadding: PDF_STYLES.spacing.cellPadding,
      lineColor: [220, 220, 220],
      lineWidth: 0.3,
      textColor: [44, 62, 80],
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: PDF_STYLES.colors.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: PDF_STYLES.fonts.normalSize + 2,
      halign: 'center',
      valign: 'middle',
      cellPadding: 8,
      minCellHeight: 15
    },
    alternateRowStyles: {
      fillColor: PDF_STYLES.colors.champagne
    },
    columnStyles: {
      0: { 
        cellWidth: 24, 
        halign: 'center', 
        fontStyle: 'bold',
        fontSize: PDF_STYLES.fonts.normalSize + 1
      },
      1: { 
        cellWidth: 28, 
        halign: 'center', 
        fontSize: PDF_STYLES.fonts.smallSize + 1,
        fontStyle: 'bold'
      },
      2: { 
        cellWidth: 60, 
        cellPadding: 8,
        fontSize: PDF_STYLES.fonts.normalSize + 1
      },
      3: { 
        cellWidth: 32, 
        halign: 'center',
        fontSize: PDF_STYLES.fonts.normalSize
      },
      4: { 
        cellWidth: 32, 
        halign: 'center',
        fontSize: PDF_STYLES.fonts.normalSize
      },
      5: { 
        cellWidth: 30, 
        halign: 'center', 
        fontStyle: 'bold', 
        fontSize: PDF_STYLES.fonts.normalSize + 2,
        textColor: PDF_STYLES.colors.primary
      }
    },
    didParseCell: function(data) {
      // Styling pour la colonne évolution avec de meilleures couleurs
      if (data.column.index === 1) {
        const cellText = data.cell.text[0];
        if (cellText && cellText.startsWith('+')) {
          data.cell.styles.textColor = PDF_STYLES.colors.success;
          data.cell.styles.fontStyle = 'bold';
        } else if (cellText && cellText.startsWith('-')) {
          data.cell.styles.textColor = PDF_STYLES.colors.danger;
          data.cell.styles.fontStyle = 'bold';
        } else if (cellText && cellText === 'NEW') {
          data.cell.styles.textColor = PDF_STYLES.colors.warning;
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = PDF_STYLES.colors.secondary;
        }
      }
      
      // Styling amélioré pour les positions du podium et top 5
      if (data.section === 'body') {
        const position = parseInt(data.row.raw[0]);
        const positionStyle = getPositionRowStyle(position);
        
        if (positionStyle) {
          data.cell.styles.fillColor = [...positionStyle.fillColor] as [number, number, number];
          data.cell.styles.textColor = [...positionStyle.textColor] as [number, number, number];
          
          // Mise en forme spéciale pour le podium
          if (position <= 3) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fontSize = PDF_STYLES.fonts.normalSize + 1;
          }
        }
      }
    },
    margin: { 
      top: PDF_STYLES.spacing.marginVertical, 
      left: PDF_STYLES.spacing.marginHorizontal, 
      right: PDF_STYLES.spacing.marginHorizontal 
    },
    tableWidth: 'auto',
    theme: 'grid',
    tableLineColor: [220, 220, 220],
    tableLineWidth: 0.3
  });
};
