
import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChampionshipStanding, Race, Driver } from '@/types/championship';
import { calculateDriverPoints } from '@/utils/championship';

export const usePdfExport = () => {
  // Fonction pour convertir une image en base64
  const getImageAsBase64 = useCallback((imagePath: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve('');
      img.src = imagePath;
    });
  }, []);

  // Fonction pour obtenir les couleurs de badge selon la position
  const getPositionColors = (position: number) => {
    if (position === 1) return { bg: [255, 215, 0], text: [0, 0, 0] }; // Or
    if (position === 2) return { bg: [192, 192, 192], text: [0, 0, 0] }; // Argent
    if (position === 3) return { bg: [205, 127, 50], text: [255, 255, 255] }; // Bronze
    if (position <= 10) return { bg: [34, 197, 94], text: [255, 255, 255] }; // Vert
    return { bg: [107, 114, 128], text: [255, 255, 255] }; // Gris
  };

  const exportGeneralStandings = useCallback(async (
    standings: ChampionshipStanding[],
    championshipTitle: string,
    championshipYear: string
  ) => {
    const doc = new jsPDF();
    
    // Charger les logos
    const [logoLigue, logoFFSA] = await Promise.all([
      getImageAsBase64('/lovable-uploads/62684b57-67a9-4b26-8c45-289e8ea186da.png'),
      getImageAsBase64('/lovable-uploads/174d8472-4f55-4be5-bd4c-6cad2885ed7d.png')
    ]);
    
    // Ajouter les logos
    if (logoLigue) {
      doc.addImage(logoLigue, 'PNG', 10, 10, 30, 15);
    }
    if (logoFFSA) {
      doc.addImage(logoFFSA, 'PNG', 170, 10, 30, 15);
    }
    
    // Titre avec gradient (simulé avec couleur)
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185); // Bleu pour simuler le gradient
    doc.text(championshipTitle, 105, 35, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128); // Gris
    doc.text(`Classement Général ${championshipYear}`, 105, 45, { align: 'center' });
    
    // Remettre la couleur du texte en noir
    doc.setTextColor(0, 0, 0);
    
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
        lineColor: [229, 231, 235],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { 
          cellWidth: 20,
          halign: 'center',
          fontStyle: 'bold'
        },
        1: { 
          cellWidth: 20,
          halign: 'center',
          textColor: [34, 197, 94] // Vert pour les flèches
        },
        2: {
          cellWidth: 60,
          fontStyle: 'bold'
        },
        3: {
          halign: 'center',
          fillColor: [240, 253, 244], // Vert clair pour montagne
          textColor: [21, 128, 61]
        },
        4: {
          halign: 'center',
          fillColor: [239, 246, 255], // Bleu clair pour rallye
          textColor: [29, 78, 216]
        },
        5: {
          halign: 'center',
          fillColor: [254, 240, 138], // Jaune pour total
          textColor: [180, 83, 9],
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
  }, [getImageAsBase64]);

  const exportCategoryStandings = useCallback(async (
    title: string,
    races: Race[],
    drivers: Driver[],
    championshipYear: string
  ) => {
    const doc = new jsPDF('landscape');
    
    // Charger les logos
    const [logoLigue, logoFFSA] = await Promise.all([
      getImageAsBase64('/lovable-uploads/62684b57-67a9-4b26-8c45-289e8ea186da.png'),
      getImageAsBase64('/lovable-uploads/174d8472-4f55-4be5-bd4c-6cad2885ed7d.png')
    ]);
    
    // Ajouter les logos
    if (logoLigue) {
      doc.addImage(logoLigue, 'PNG', 10, 10, 30, 15);
    }
    if (logoFFSA) {
      doc.addImage(logoFFSA, 'PNG', 257, 10, 30, 15);
    }
    
    // Titre avec couleur
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text(title, 148, 35, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(`Saison ${championshipYear}`, 148, 45, { align: 'center' });
    
    // Remettre la couleur du texte en noir
    doc.setTextColor(0, 0, 0);
    
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
    const headerColor = isRally ? [29, 78, 216] : [34, 197, 94]; // Bleu pour rallye, vert pour montagne
    const totalBgColor = isRally ? [239, 246, 255] : [240, 253, 244];
    const totalTextColor = isRally ? [29, 78, 216] : [21, 128, 61];
    
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 55,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [229, 231, 235],
        lineWidth: 0.1,
        valign: 'middle'
      },
      headStyles: {
        fillColor: headerColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { 
          cellWidth: 15,
          halign: 'center',
          fontStyle: 'bold'
        },
        1: { 
          cellWidth: 40,
          fontStyle: 'bold'
        },
        [headers.length - 2]: { // Colonne Total
          halign: 'center',
          fillColor: totalBgColor,
          textColor: totalTextColor,
          fontStyle: 'bold'
        },
        [headers.length - 1]: { // Colonne Écart
          halign: 'center',
          textColor: [107, 114, 128]
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
            data.cell.styles.fillColor = [249, 250, 251];
            data.cell.styles.textColor = [75, 85, 99];
            data.cell.styles.halign = 'center';
          }
        }
      }
    });
    
    // Podium en bas
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    if (standings.length >= 3) {
      const podiumPositions = ['🥇', '🥈', '🥉'];
      const podiumColors = [[255, 215, 0], [192, 192, 192], [205, 127, 50]];
      
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
  }, [getImageAsBase64]);

  return {
    exportGeneralStandings,
    exportCategoryStandings
  };
};
