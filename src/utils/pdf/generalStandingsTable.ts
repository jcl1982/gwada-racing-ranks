
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
      cellPadding: 4,
      lineColor: PDF_STYLES.colors.darkBlue,
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: PDF_STYLES.colors.headerBlue,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: PDF_STYLES.fonts.normalSize + 1,
      halign: 'center',
      valign: 'middle',
      cellPadding: 5
    },
    alternateRowStyles: {
      fillColor: PDF_STYLES.colors.champagne
    },
    columnStyles: {
      0: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 25, halign: 'center', fontSize: PDF_STYLES.fonts.smallSize },
      2: { cellWidth: 55, cellPadding: 5 },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 30, halign: 'center' },
      5: { cellWidth: 28, halign: 'center', fontStyle: 'bold', fontSize: PDF_STYLES.fonts.normalSize + 1 }
    },
    didParseCell: function(data) {
      // Styling pour la colonne évolution
      if (data.column.index === 1) {
        const cellText = data.cell.text[0];
        if (cellText && cellText.startsWith('+')) {
          data.cell.styles.textColor = PDF_STYLES.colors.green;
          data.cell.styles.fontStyle = 'bold';
        } else if (cellText && cellText.startsWith('-')) {
          data.cell.styles.textColor = PDF_STYLES.colors.red;
          data.cell.styles.fontStyle = 'bold';
        } else if (cellText && cellText === 'NEW') {
          data.cell.styles.textColor = PDF_STYLES.colors.orange;
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = PDF_STYLES.colors.gray;
        }
      }
      
      // Styling spécial pour les positions du podium et top 5
      if (data.section === 'body') {
        const position = parseInt(data.row.raw[0]);
        const positionStyle = getPositionRowStyle(position);
        
        if (positionStyle) {
          data.cell.styles.fillColor = [...positionStyle.fillColor] as [number, number, number];
          data.cell.styles.textColor = [...positionStyle.textColor] as [number, number, number];
          
          // Mettre en gras pour le podium
          if (position <= 3) {
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    },
    margin: { top: 60, left: 15, right: 15 },
    tableWidth: 'auto',
    theme: 'grid'
  });
};
