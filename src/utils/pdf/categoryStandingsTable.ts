
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Race, Driver } from '@/types/championship';
import { PDF_STYLES } from '../pdfStyles';

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
    startY: PDF_STYLES.positions.tableStart.y,
    styles: {
      fontSize: PDF_STYLES.fonts.normalSize,
      cellPadding: PDF_STYLES.spacing.cellPadding,
      lineColor: PDF_STYLES.colors.gray200,
      lineWidth: 0.5,
      textColor: PDF_STYLES.colors.gray900,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: PDF_STYLES.colors.oceanBlue, // Style gradient-ocean
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: PDF_STYLES.fonts.normalSize + 1,
      halign: 'center',
      valign: 'middle',
      cellPadding: 8,
      minCellHeight: 16
    },
    alternateRowStyles: {
      fillColor: PDF_STYLES.colors.backgroundLight // Même alternance que le site
    },
    columnStyles: {
      0: { 
        cellWidth: 25, 
        halign: 'center', 
        fontStyle: 'bold',
        fontSize: PDF_STYLES.fonts.normalSize + 1
      },
      1: { 
        cellWidth: 45,
        fontSize: PDF_STYLES.fonts.normalSize + 1,
        cellPadding: 6,
        fontStyle: 'bold'
      },
      [headers.length - 1]: { 
        cellWidth: 32, 
        halign: 'center', 
        fontStyle: 'bold',
        fontSize: PDF_STYLES.fonts.normalSize + 2,
        textColor: PDF_STYLES.colors.primary
      }
    },
    didParseCell: function(data) {
      // Styling pour les positions (comme sur le site)
      if (data.section === 'body' && data.column.index === 0) {
        const position = parseInt(data.cell.text[0]);
        if (position === 1) {
          data.cell.styles.fillColor = PDF_STYLES.colors.gold;
          data.cell.styles.textColor = [255, 255, 255];
        } else if (position === 2) {
          data.cell.styles.fillColor = PDF_STYLES.colors.silver;
          data.cell.styles.textColor = [255, 255, 255];
        } else if (position === 3) {
          data.cell.styles.fillColor = PDF_STYLES.colors.bronze;
          data.cell.styles.textColor = [255, 255, 255];
        } else if (position <= 5) {
          data.cell.styles.fillColor = PDF_STYLES.colors.blueBadge;
          data.cell.styles.textColor = [0, 0, 0];
        }
      }
    },
    margin: { 
      top: PDF_STYLES.spacing.marginVertical, 
      left: PDF_STYLES.spacing.marginHorizontal, 
      right: PDF_STYLES.spacing.marginHorizontal 
    },
    theme: 'grid',
    tableLineColor: PDF_STYLES.colors.gray200,
    tableLineWidth: 0.5
  });
};
