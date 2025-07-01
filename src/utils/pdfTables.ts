
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChampionshipStanding, Race, Driver } from '@/types/championship';
import { PDF_STYLES, getPositionEvolutionIndicator, getStatusText } from './pdfStyles';

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
    head: [['Position', 'Évolution', 'Pilote', 'Montagne', 'Rallye', 'Total']],
    body: tableData,
    startY: PDF_STYLES.positions.tableStart.y,
    styles: {
      fontSize: PDF_STYLES.fonts.normalSize,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: PDF_STYLES.colors.headerBlue,
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: PDF_STYLES.colors.lightGray
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 25, halign: 'center', fontSize: 9 },
      2: { cellWidth: 50 },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
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
    }
  });
};

export const createCategoryStandingsTable = (
  doc: jsPDF,
  headers: string[],
  standings: Array<{
    driver: Driver;
    points: number;
    position: number;
  }>,
  races: Race[]
) => {
  const tableData = standings.map((standing, index) => {
    const row = [standing.position.toString(), standing.driver.name];
    
    let previousTotal = 0;
    races.forEach(race => {
      const result = race.results.find(r => r.driverId === standing.driver.id);
      if (result) {
        const currentRacePoints = result.points;
        const newTotal = previousTotal + currentRacePoints;
        row.push(`${currentRacePoints} pts (P${result.position}) [${newTotal}]`);
        previousTotal = newTotal;
      } else {
        row.push(`- [${previousTotal}]`);
      }
    });
    
    row.push(`${standing.points} pts`);
    row.push(getStatusText(index));
    return row;
  });

  console.log('📄 Données du tableau PDF (catégorie):', tableData);
  
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: PDF_STYLES.positions.tableStart.y,
    styles: {
      fontSize: 7,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: PDF_STYLES.colors.headerBlue,
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: PDF_STYLES.colors.lightGray
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 35 },
      [headers.length - 2]: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
      [headers.length - 1]: { cellWidth: 30, halign: 'center', fontSize: 8 }
    },
    didParseCell: function(data) {
      if (data.column.index === headers.length - 1) {
        const cellText = data.cell.text[0];
        if (cellText && cellText === 'CHAMPION') {
          data.cell.styles.fillColor = PDF_STYLES.colors.gold;
          data.cell.styles.fontStyle = 'bold';
        } else if (cellText && cellText === 'VICE-CHAMP') {
          data.cell.styles.fillColor = PDF_STYLES.colors.silver;
          data.cell.styles.fontStyle = 'bold';
        } else if (cellText && cellText === 'PODIUM') {
          data.cell.styles.fillColor = PDF_STYLES.colors.bronze;
          data.cell.styles.fontStyle = 'bold';
        } else if (cellText && cellText === 'TOP 5') {
          data.cell.styles.fillColor = PDF_STYLES.colors.lightGreen;
        }
      }
    }
  });
};

export const addLegendToDoc = (doc: jsPDF) => {
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(PDF_STYLES.fonts.normalSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Légende:', 15, finalY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(PDF_STYLES.fonts.legendSize);
  doc.setTextColor(PDF_STYLES.colors.green[0], PDF_STYLES.colors.green[1], PDF_STYLES.colors.green[2]);
  doc.text('+X : Montée de X positions', 15, finalY + 8);
  doc.setTextColor(PDF_STYLES.colors.red[0], PDF_STYLES.colors.red[1], PDF_STYLES.colors.red[2]);
  doc.text('-X : Descente de X positions', 15, finalY + 15);
  doc.setTextColor(PDF_STYLES.colors.gray[0], PDF_STYLES.colors.gray[1], PDF_STYLES.colors.gray[2]);
  doc.text('= : Position stable', 15, finalY + 22);
  doc.setTextColor(PDF_STYLES.colors.orange[0], PDF_STYLES.colors.orange[1], PDF_STYLES.colors.orange[2]);
  doc.text('NEW : Nouveau pilote', 15, finalY + 29);
  
  // Reset couleur
  doc.setTextColor(0, 0, 0);
};
