
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
      cellPadding: 10,
      lineColor: [229, 231, 235],
      lineWidth: 0.5,
      textColor: [51, 51, 51],
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [71, 85, 105],
      fontStyle: 'bold',
      fontSize: PDF_STYLES.fonts.normalSize,
      halign: 'left',
      valign: 'middle',
      cellPadding: 12,
      minCellHeight: 18
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255]
    },
    rowStyles: {
      fillColor: [249, 250, 251],
      minCellHeight: 16
    },
    columnStyles: {
      0: { 
        cellWidth: 20, 
        halign: 'center'
      },
      1: { 
        cellWidth: 45,
        fontSize: PDF_STYLES.fonts.normalSize + 1,
        fontStyle: 'bold'
      },
      [headers.length - 1]: { 
        cellWidth: 25, 
        halign: 'center', 
        fontStyle: 'bold'
      }
    },
    didParseCell: function(data) {
      const position = parseInt(data.row.raw[0]);
      
      // Style pour la colonne position avec badges colorés
      if (data.column.index === 0) {
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
      
      // Style pour la colonne Total
      if (data.column.index === headers.length - 1) {
        data.cell.styles.halign = 'center';
        data.cell.styles.fillColor = [245, 158, 11]; // Orange
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = PDF_STYLES.fonts.normalSize + 1;
      }
      
      // Bordures plus fines
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
