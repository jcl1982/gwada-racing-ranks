
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Race, Driver } from '@/types/championship';
import { calculateDriverPoints } from '@/utils/championship';
import { addLogosToDoc, addDocumentTitle, getPositionColors } from './pdfUtils';

export const generateCategoryStandingsPdf = async (
  title: string,
  races: Race[],
  drivers: Driver[],
  championshipYear: string
) => {
  const doc = new jsPDF('landscape');
  
  // Ajouter les logos
  await addLogosToDoc(doc);
  
  // Ajouter le titre
  addDocumentTitle(doc, title, `Saison ${championshipYear}`);
  
  // Calcul des classements
  const standings = drivers
    .map(driver => ({
      driver,
      points: calculateDriverPoints(driver.id, races)
    }))
    .sort((a, b) => b.points - a.points)
    .map((standing, index) => ({
      ...standing,
      position: index + 1
    }));
  
  // Construction des en-têtes de colonnes
  const headers = ['Pos.', 'Pilote'];
  races.forEach(race => {
    headers.push(`${race.name}\n${new Date(race.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`);
  });
  headers.push('Total', 'Écart');
  
  // Construction des données
  const tableData = standings.map(standing => {
    const row = [standing.position.toString(), standing.driver.name];
    
    races.forEach(race => {
      const result = race.results.find(r => r.driverId === standing.driver.id);
      if (result) {
        row.push(`${result.points} pts\n(P${result.position})`);
      } else {
        row.push('-');
      }
    });
    
    const gap = standings[0].points - standing.points;
    row.push(`${standing.points} pts`);
    row.push(gap === 0 ? 'Leader' : `-${gap} pts`);
    
    return row;
  });
  
  // Couleur selon le type de course
  const isRally = title.toLowerCase().includes('rallye');
  const headerColor: [number, number, number] = isRally ? [29, 78, 216] : [34, 197, 94]; // Bleu pour rallye, vert pour montagne
  const totalBgColor: [number, number, number] = isRally ? [239, 246, 255] : [240, 253, 244];
  const totalTextColor: [number, number, number] = isRally ? [29, 78, 216] : [21, 128, 61];
  
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 55,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [229, 231, 235] as [number, number, number],
      lineWidth: 0.1,
      valign: 'middle'
    },
    headStyles: {
      fillColor: headerColor,
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: 'bold',
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] as [number, number, number]
    },
    columnStyles: {
      '0': { 
        cellWidth: 15,
        halign: 'center',
        fontStyle: 'bold'
      },
      '1': { 
        cellWidth: 40,
        fontStyle: 'bold'
      },
      [`${headers.length - 2}`]: { // Colonne Total
        halign: 'center',
        fillColor: totalBgColor,
        textColor: totalTextColor,
        fontStyle: 'bold'
      },
      [`${headers.length - 1}`]: { // Colonne Écart
        halign: 'center',
        textColor: [107, 114, 128] as [number, number, number]
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
      
      // Colonnes des courses individuelles
      if (data.column.index >= 2 && data.column.index < headers.length - 2 && data.section === 'body') {
        if (data.cell.text[0] !== '-') {
          data.cell.styles.fillColor = [249, 250, 251] as [number, number, number];
          data.cell.styles.textColor = [75, 85, 99] as [number, number, number];
          data.cell.styles.halign = 'center';
        }
      }
    }
  });
  
  // Podium en bas
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  if (standings.length >= 3) {
    const podiumPositions = ['🥇', '🥈', '🥉'];
    const podiumColors: [number, number, number][] = [[255, 215, 0], [192, 192, 192], [205, 127, 50]];
    
    for (let i = 0; i < 3 && i < standings.length; i++) {
      const x = 50 + (i * 80);
      
      // Médaille
      doc.setFontSize(20);
      doc.text(podiumPositions[i], x, finalY);
      
      // Position
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(podiumColors[i][0], podiumColors[i][1], podiumColors[i][2]);
      doc.text(`${standings[i].position}ᵉ Place`, x, finalY + 10);
      
      // Nom du pilote
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(standings[i].driver.name, x, finalY + 20);
      
      // Points
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text(`${standings[i].points} points`, x, finalY + 27);
    }
  }
  
  // Sauvegarde
  const filename = title.toLowerCase().replace(/\s+/g, '-');
  doc.save(`${filename}-${championshipYear}.pdf`);
};
