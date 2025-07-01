
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
        `${standing.montagnePoints}`,
        `${standing.rallyePoints}`,
        `${standing.totalPoints}`
      ];
    });

  console.log('📄 Données du tableau PDF:', tableData);
  
  autoTable(doc, {
    head: [['#', 'Évol.', 'Pilote', '⛰️ Montagne', '🏎️ Rallye', 'Total']],
    body: tableData,
    startY: PDF_STYLES.positions.tableStart.y,
    styles: {
      fontSize: 11,
      cellPadding: { top: 8, right: 6, bottom: 8, left: 6 },
      lineColor: [240, 240, 240],
      lineWidth: 0.3,
      textColor: [51, 51, 51],
      overflow: 'linebreak',
      halign: 'center',
      valign: 'middle',
      fillColor: [255, 255, 255],
      minCellHeight: 20
    },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      fontSize: 12,
      halign: 'center',
      valign: 'middle',
      cellPadding: { top: 12, right: 8, bottom: 12, left: 8 },
      minCellHeight: 24,
      lineColor: [226, 232, 240],
      lineWidth: 0.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { 
        cellWidth: 18,
        halign: 'center',
        fontStyle: 'bold'
      },
      1: { 
        cellWidth: 22,
        halign: 'center',
        fontSize: 10
      },
      2: { 
        cellWidth: 65,
        halign: 'left',
        fontStyle: 'bold',
        fontSize: 12,
        cellPadding: { top: 8, right: 12, bottom: 8, left: 12 }
      },
      3: { 
        cellWidth: 28,
        halign: 'center',
        fontStyle: 'bold'
      },
      4: { 
        cellWidth: 28,
        halign: 'center',
        fontStyle: 'bold'
      },
      5: { 
        cellWidth: 28,
        halign: 'center',
        fontStyle: 'bold',
        fontSize: 13
      }
    },
    didParseCell: function(data) {
      const rowIndex = data.row.index;
      const colIndex = data.column.index;
      const position = parseInt(data.row.raw[0]);
      
      // Style pour la colonne position avec badges modernes
      if (colIndex === 0) {
        data.cell.styles.halign = 'center';
        data.cell.styles.valign = 'middle';
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 12;
        data.cell.styles.textColor = [255, 255, 255];
        
        if (position === 1) {
          data.cell.styles.fillColor = [251, 191, 36]; // Gold plus vibrant
        } else if (position === 2) {
          data.cell.styles.fillColor = [148, 163, 184]; // Silver moderne
        } else if (position === 3) {
          data.cell.styles.fillColor = [194, 65, 12]; // Bronze plus riche
        } else if (position <= 5) {
          data.cell.styles.fillColor = [59, 130, 246]; // Bleu moderne
        } else {
          data.cell.styles.fillColor = [100, 116, 139]; // Gris moderne
          data.cell.styles.textColor = [255, 255, 255];
        }
      }
      
      // Style pour la colonne évolution avec icônes
      if (colIndex === 1) {
        const cellText = data.cell.text[0];
        data.cell.styles.halign = 'center';
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 10;
        
        if (cellText && cellText.includes('↑')) {
          data.cell.styles.textColor = [22, 163, 74]; // Vert plus saturé
          data.cell.styles.fillColor = [220, 252, 231]; // Fond vert très clair
        } else if (cellText && cellText.includes('↓')) {
          data.cell.styles.textColor = [220, 38, 38]; // Rouge plus saturé
          data.cell.styles.fillColor = [254, 226, 226]; // Fond rouge très clair
        } else if (cellText === 'NEW') {
          data.cell.styles.textColor = [245, 158, 11]; // Orange
          data.cell.styles.fillColor = [255, 237, 213]; // Fond orange très clair
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [107, 114, 128]; // Gris
          data.cell.styles.fillColor = [249, 250, 251]; // Fond gris très clair
        }
      }
      
      // Style pour la colonne nom du pilote
      if (colIndex === 2) {
        data.cell.styles.halign = 'left';
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 12;
        data.cell.styles.textColor = [30, 41, 59]; // Gris foncé moderne
        
        // Surbrillance subtile pour le podium
        if (position <= 3) {
          data.cell.styles.fillColor = [248, 250, 252]; // Fond très subtil
        }
      }
      
      // Style pour les colonnes de points spécialisées
      if (colIndex === 3) { // Montagne
        data.cell.styles.halign = 'center';
        data.cell.styles.fillColor = [220, 252, 231]; // Vert très clair
        data.cell.styles.textColor = [21, 128, 61]; // Vert foncé
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 11;
      }
      
      if (colIndex === 4) { // Rallye
        data.cell.styles.halign = 'center';
        data.cell.styles.fillColor = [219, 234, 254]; // Bleu très clair
        data.cell.styles.textColor = [30, 64, 175]; // Bleu foncé
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 11;
      }
      
      // Style pour la colonne Total - mise en valeur
      if (colIndex === 5) {
        data.cell.styles.halign = 'center';
        data.cell.styles.fillColor = [59, 130, 246]; // Bleu moderne
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 13;
      }
      
      // Bordures ultra-fines et modernes
      data.cell.styles.lineWidth = 0.3;
      data.cell.styles.lineColor = [226, 232, 240];
    },
    margin: { 
      top: 15, 
      left: 20, 
      right: 20 
    },
    theme: 'grid',
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.3
  });
};
