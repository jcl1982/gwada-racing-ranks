
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChampionshipStanding } from '@/types/championship';
import { PDF_STYLES, getPositionEvolutionIndicator } from '../pdfStyles';

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
        `${standing.montagnePoints} pts`,
        `${standing.rallyePoints} pts`,
        `${standing.totalPoints} pts`
      ];
    });

  console.log('📄 Données du tableau PDF:', tableData);
  
  autoTable(doc, {
    head: [['Position', 'Évolution', 'Pilote', '⛰️ Montagne', '🏎️ Rallye', 'Total']],
    body: tableData,
    startY: PDF_STYLES.positions.tableStart.y,
    styles: {
      fontSize: PDF_STYLES.fonts.normalSize,
      cellPadding: 12,
      lineColor: [240, 240, 240],
      lineWidth: 1,
      textColor: [51, 51, 51],
      overflow: 'linebreak',
      halign: 'left'
    },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [71, 85, 105],
      fontStyle: 'bold',
      fontSize: PDF_STYLES.fonts.normalSize,
      halign: 'left',
      valign: 'middle',
      cellPadding: 12,
      minCellHeight: 20
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255]
    },
    rowStyles: {
      fillColor: [249, 250, 251],
      minCellHeight: 18
    },
    columnStyles: {
      0: { 
        cellWidth: 20, 
        halign: 'center'
      },
      1: { 
        cellWidth: 25, 
        halign: 'center'
      },
      2: { 
        cellWidth: 60,
        fontStyle: 'bold',
        fontSize: PDF_STYLES.fonts.normalSize + 1
      },
      3: { 
        cellWidth: 30, 
        halign: 'center'
      },
      4: { 
        cellWidth: 30, 
        halign: 'center'
      },
      5: { 
        cellWidth: 25, 
        halign: 'center',
        fontStyle: 'bold'
      }
    },
    didParseCell: function(data) {
      const rowIndex = data.row.index;
      const colIndex = data.column.index;
      const position = parseInt(data.row.raw[0]);
      
      // Style pour la colonne position avec badges colorés
      if (colIndex === 0) {
        data.cell.styles.halign = 'center';
        data.cell.styles.valign = 'middle';
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = PDF_STYLES.fonts.normalSize;
        data.cell.styles.textColor = [255, 255, 255];
        
        if (position === 1) {
          data.cell.styles.fillColor = [245, 158, 11]; // Orange/Gold
        } else if (position === 2) {
          data.cell.styles.fillColor = [107, 114, 128]; // Gris
        } else if (position === 3) {
          data.cell.styles.fillColor = [180, 83, 9]; // Bronze
        } else if (position <= 5) {
          data.cell.styles.fillColor = [59, 130, 246]; // Bleu
        } else {
          data.cell.styles.fillColor = [107, 114, 128]; // Gris par défaut
        }
      }
      
      // Style pour la colonne évolution
      if (colIndex === 1) {
        const cellText = data.cell.text[0];
        data.cell.styles.halign = 'center';
        data.cell.styles.fontStyle = 'bold';
        
        if (cellText && cellText.startsWith('+')) {
          data.cell.styles.textColor = [34, 197, 94]; // Vert
        } else if (cellText && cellText.startsWith('-')) {
          data.cell.styles.textColor = [239, 68, 68]; // Rouge
        } else if (cellText === 'NEW') {
          data.cell.styles.textColor = [245, 158, 11]; // Orange
        } else {
          data.cell.styles.textColor = [107, 114, 128]; // Gris
        }
      }
      
      // Style pour les colonnes de points (Montagne et Rallye)
      if (colIndex === 3 || colIndex === 4) {
        data.cell.styles.halign = 'center';
        
        if (colIndex === 3) { // Montagne
          data.cell.styles.fillColor = [220, 252, 231]; // Vert clair
          data.cell.styles.textColor = [21, 128, 61]; // Vert foncé
        } else { // Rallye
          data.cell.styles.fillColor = [219, 234, 254]; // Bleu clair
          data.cell.styles.textColor = [30, 64, 175]; // Bleu foncé
        }
        
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = PDF_STYLES.fonts.normalSize;
      }
      
      // Style pour la colonne Total
      if (colIndex === 5) {
        data.cell.styles.halign = 'center';
        data.cell.styles.fillColor = [245, 158, 11]; // Orange
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = PDF_STYLES.fonts.normalSize + 1;
      }
      
      // Suppression des bordures pour un look plus propre
      data.cell.styles.lineWidth = 0.5;
      data.cell.styles.lineColor = [229, 231, 235];
    },
    margin: { 
      top: PDF_STYLES.spacing.marginVertical, 
      left: PDF_STYLES.spacing.marginHorizontal, 
      right: PDF_STYLES.spacing.marginHorizontal 
    },
    theme: 'grid',
    tableLineColor: [229, 231, 235],
    tableLineWidth: 0.5
  });
};
