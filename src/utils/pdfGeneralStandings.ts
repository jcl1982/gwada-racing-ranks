
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChampionshipStanding } from '@/types/championship';
import { addLogosToDoc, addDocumentTitle, getPositionColors } from './pdfUtils';

export const generateGeneralStandingsPdf = async (
  standings: ChampionshipStanding[],
  championshipTitle: string,
  championshipYear: string
) => {
  const doc = new jsPDF();
  
  // Ajouter les logos
  await addLogosToDoc(doc);
  
  // Ajouter le titre
  addDocumentTitle(doc, championshipTitle, `Classement Général ${championshipYear}`);
  
  // Tableau des classements avec évolution
  const tableData = standings.map(standing => {
    let evolution = '-';
    if (standing.positionChange > 0) {
      evolution = `↑${standing.positionChange}`;
    } else if (standing.positionChange < 0) {
      evolution = `↓${Math.abs(standing.positionChange)}`;
    } else if (standing.previousPosition) {
      evolution = '=';
    }
    
    return [
      standing.position.toString(),
      evolution,
      standing.driver.name,
      `${standing.montagnePoints} pts`,
      `${standing.rallyePoints} pts`,
      `${standing.totalPoints} pts`
    ];
  });
  
  autoTable(doc, {
    head: [['Position', 'Évolution', 'Pilote', 'Montagne', 'Rallye', 'Total']],
    body: tableData,
    startY: 55,
    styles: {
      fontSize: 10,
      cellPadding: 4,
      lineColor: [229, 231, 235] as [number, number, number],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [41, 128, 185] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: 'bold',
      fontSize: 11,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] as [number, number, number]
    },
    columnStyles: {
      '0': { 
        cellWidth: 20,
        halign: 'center',
        fontStyle: 'bold'
      },
      '1': { 
        cellWidth: 20,
        halign: 'center',
        textColor: [34, 197, 94] as [number, number, number] // Vert pour les flèches
      },
      '2': {
        cellWidth: 60,
        fontStyle: 'bold'
      },
      '3': {
        halign: 'center',
        fillColor: [240, 253, 244] as [number, number, number], // Vert clair pour montagne
        textColor: [21, 128, 61] as [number, number, number]
      },
      '4': {
        halign: 'center',
        fillColor: [239, 246, 255] as [number, number, number], // Bleu clair pour rallye
        textColor: [29, 78, 216] as [number, number, number]
      },
      '5': {
        halign: 'center',
        fillColor: [254, 240, 138] as [number, number, number], // Jaune pour total
        textColor: [180, 83, 9] as [number, number, number],
        fontStyle: 'bold'
      }
    },
    didParseCell: function(data) {
      // Personnaliser les couleurs de position
      if (data.column.index === 0 && data.section === 'body') {
        const position = parseInt(data.cell.text[0]);
        const colors = getPositionColors(position);
        data.cell.styles.fillColor = colors.bg;
        data.cell.styles.textColor = colors.text;
      }
    }
  });
  
  // Statistiques en bas
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // Leader du championnat
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text('🏆 Leader du Championnat', 20, finalY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`${standings[0]?.driver.name} - ${standings[0]?.totalPoints} points`, 20, finalY + 7);
  
  // Meilleur en montagne
  const bestMountain = standings.sort((a, b) => b.montagnePoints - a.montagnePoints)[0];
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94);
  doc.text('🏔️ Meilleur en Montagne', 20, finalY + 20);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`${bestMountain?.driver.name} - ${bestMountain?.montagnePoints} points`, 20, finalY + 27);
  
  // Meilleur en rallye
  const bestRally = standings.sort((a, b) => b.rallyePoints - a.rallyePoints)[0];
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 127);
  doc.text('🏎️ Meilleur en Rallye', 20, finalY + 40);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`${bestRally?.driver.name} - ${bestRally?.rallyePoints} points`, 20, finalY + 47);
  
  // Sauvegarde
  doc.save(`classement-general-${championshipYear}.pdf`);
};
