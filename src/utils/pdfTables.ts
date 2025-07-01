
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChampionshipStanding, Race, Driver } from '@/types/championship';
import { PDF_STYLES, getPositionEvolutionIndicator, getPositionRowStyle } from './pdfStyles';

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
      [headers.length - 1]: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
    }
  });
};

export const addLegendToDoc = (doc: jsPDF) => {
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // Titre de la légende avec un fond coloré
  doc.setFillColor(PDF_STYLES.colors.lightBlue[0], PDF_STYLES.colors.lightBlue[1], PDF_STYLES.colors.lightBlue[2]);
  doc.rect(15, finalY - 5, 170, 12, 'F');
  
  doc.setFontSize(PDF_STYLES.fonts.normalSize + 1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PDF_STYLES.colors.darkBlue[0], PDF_STYLES.colors.darkBlue[1], PDF_STYLES.colors.darkBlue[2]);
  doc.text('Légende des indicateurs d\'évolution:', 20, finalY + 2);
  
  // Contenu de la légende
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(PDF_STYLES.fonts.smallSize);
  
  // Indicateurs d'évolution
  doc.setTextColor(PDF_STYLES.colors.green[0], PDF_STYLES.colors.green[1], PDF_STYLES.colors.green[2]);
  doc.text('+X : Montée de X positions', 20, finalY + 12);
  
  doc.setTextColor(PDF_STYLES.colors.red[0], PDF_STYLES.colors.red[1], PDF_STYLES.colors.red[2]);
  doc.text('-X : Descente de X positions', 20, finalY + 20);
  
  doc.setTextColor(PDF_STYLES.colors.gray[0], PDF_STYLES.colors.gray[1], PDF_STYLES.colors.gray[2]);
  doc.text('= : Position stable', 20, finalY + 28);
  
  doc.setTextColor(PDF_STYLES.colors.orange[0], PDF_STYLES.colors.orange[1], PDF_STYLES.colors.orange[2]);
  doc.text('NEW : Nouveau pilote', 20, finalY + 36);
  
  // Légende des couleurs avec des petits rectangles colorés
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Couleurs des positions:', 100, finalY + 12);
  
  doc.setFont('helvetica', 'normal');
  
  // Champion (Or)
  doc.setFillColor(PDF_STYLES.colors.gold[0], PDF_STYLES.colors.gold[1], PDF_STYLES.colors.gold[2]);
  doc.rect(100, finalY + 16, 8, 6, 'F');
  doc.text('1ère place (Champion)', 110, finalY + 20);
  
  // Vice-champion (Argent)
  doc.setFillColor(PDF_STYLES.colors.silver[0], PDF_STYLES.colors.silver[1], PDF_STYLES.colors.silver[2]);
  doc.rect(100, finalY + 24, 8, 6, 'F');
  doc.text('2ème place (Vice-champion)', 110, finalY + 28);
  
  // Podium (Bronze)
  doc.setFillColor(PDF_STYLES.colors.bronze[0], PDF_STYLES.colors.bronze[1], PDF_STYLES.colors.bronze[2]);
  doc.rect(100, finalY + 32, 8, 6, 'F');
  doc.text('3ème place (Podium)', 110, finalY + 36);
  
  // Top 5 (Bleu clair)
  doc.setFillColor(PDF_STYLES.colors.lightBlue[0], PDF_STYLES.colors.lightBlue[1], PDF_STYLES.colors.lightBlue[2]);
  doc.rect(100, finalY + 40, 8, 6, 'F');
  doc.text('Top 5', 110, finalY + 44);
  
  // Reset couleur
  doc.setTextColor(0, 0, 0);
};
