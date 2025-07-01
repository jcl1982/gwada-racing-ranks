
import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChampionshipStanding, Race, Driver } from '@/types/championship';

export const usePdfExport = () => {
  const exportGeneralStandings = useCallback((
    standings: ChampionshipStanding[],
    championshipTitle: string,
    championshipYear: string
  ) => {
    console.log('🏆 Export PDF - Classement Général:', standings.map(s => ({
      position: s.position,
      name: s.driver.name,
      totalPoints: s.totalPoints
    })));

    const doc = new jsPDF();
    
    // Logos
    // Logo de la ligue (haut gauche)
    const ligueLogoUrl = '/lovable-uploads/9fcde9f0-2732-40e7-a37d-2bf3981cefaf.png';
    doc.addImage(ligueLogoUrl, 'PNG', 15, 10, 35, 15);
    
    // Logo de la fédération (haut droite) 
    const federationLogoUrl = '/lovable-uploads/1bf8922d-c9c0-423c-93bd-29ddb120e512.png';
    doc.addImage(federationLogoUrl, 'PNG', 150, 10, 40, 15);
    
    // Titre
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(championshipTitle, 105, 35, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Classement Général ${championshipYear}`, 105, 45, { align: 'center' });
    
    // Tableau des classements - avec évolution en texte simple
    const tableData = standings
      .sort((a, b) => a.position - b.position)
      .map(standing => {
        // Indicateur d'évolution avec du texte simple
        let evolutionIndicator = '';
        if (standing.positionChange > 0) {
          evolutionIndicator = `+${standing.positionChange}`;
        } else if (standing.positionChange < 0) {
          evolutionIndicator = `${standing.positionChange}`;
        } else if (standing.previousPosition) {
          evolutionIndicator = '=';
        } else {
          evolutionIndicator = 'NEW';
        }

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
      startY: 55,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
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
        // Colorer les indicateurs d'évolution
        if (data.column.index === 1) {
          const cellText = data.cell.text[0];
          if (cellText && cellText.startsWith('+')) {
            data.cell.styles.textColor = [34, 139, 34]; // Vert pour montée
            data.cell.styles.fontStyle = 'bold';
          } else if (cellText && cellText.startsWith('-')) {
            data.cell.styles.textColor = [220, 20, 60]; // Rouge pour descente
            data.cell.styles.fontStyle = 'bold';
          } else if (cellText && cellText === 'NEW') {
            data.cell.styles.textColor = [255, 140, 0]; // Orange pour nouveau
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [128, 128, 128]; // Gris pour stable
          }
        }
      }
    });
    
    // Légende des indicateurs mise à jour
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Légende:', 15, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(34, 139, 34);
    doc.text('+X : Montée de X positions', 15, finalY + 8);
    doc.setTextColor(220, 20, 60);
    doc.text('-X : Descente de X positions', 15, finalY + 15);
    doc.setTextColor(128, 128, 128);
    doc.text('= : Position stable', 15, finalY + 22);
    doc.setTextColor(255, 140, 0);
    doc.text('NEW : Nouveau pilote', 15, finalY + 29);
    
    // Reset couleur
    doc.setTextColor(0, 0, 0);
    
    // Sauvegarde
    doc.save(`classement-general-${championshipYear}.pdf`);
  }, []);

  const exportCategoryStandings = useCallback((
    title: string,
    races: Race[],
    drivers: Driver[],
    championshipYear: string,
    preCalculatedStandings?: Array<{
      driver: Driver;
      points: number;
      position: number;
    }>
  ) => {
    console.log('🏁 Export PDF - Classement Catégorie:', title, preCalculatedStandings?.map(s => ({
      position: s.position,
      name: s.driver.name,
      points: s.points
    })));

    const doc = new jsPDF('landscape');
    
    // Logos
    // Logo de la ligue (haut gauche)
    const ligueLogoUrl = '/lovable-uploads/9fcde9f0-2732-40e7-a37d-2bf3981cefaf.png';
    doc.addImage(ligueLogoUrl, 'PNG', 20, 10, 35, 15);
    
    // Logo de la fédération (haut droite)
    const federationLogoUrl = '/lovable-uploads/1bf8922d-c9c0-423c-93bd-29ddb120e512.png';
    doc.addImage(federationLogoUrl, 'PNG', 240, 10, 40, 15);
    
    // Titre
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 148, 35, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Saison ${championshipYear}`, 148, 45, { align: 'center' });
    
    // Utilise les classements pré-calculés s'ils sont fournis, sinon recalcule
    let standings;
    if (preCalculatedStandings) {
      standings = preCalculatedStandings.sort((a, b) => a.position - b.position);
    } else {
      // Fallback - calcul des classements si pas fournis
      standings = drivers
        .map(driver => {
          const points = races.reduce((total, race) => {
            const result = race.results.find(r => r.driverId === driver.id);
            return total + (result?.points || 0);
          }, 0);
          return { driver, points };
        })
        .sort((a, b) => b.points - a.points)
        .map((standing, index) => ({
          ...standing,
          position: index + 1
        }));
    }
    
    // Construction des en-têtes de colonnes
    const headers = ['Position', 'Pilote'];
    races.forEach(race => {
      headers.push(`${race.name} (${new Date(race.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })})`);
    });
    headers.push('Total');
    headers.push('Statut');
    
    // Construction des données avec statut textuel simple
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
      
      // Statut textuel simple
      let status = '';
      if (index === 0) status = 'CHAMPION';
      else if (index === 1) status = 'VICE-CHAMP';
      else if (index === 2) status = 'PODIUM';
      else if (index < 5) status = 'TOP 5';
      else status = `${index + 1}eme`;
      
      row.push(status);
      return row;
    });

    console.log('📄 Données du tableau PDF (catégorie):', tableData);
    
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 55,
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 35 },
        [headers.length - 2]: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
        [headers.length - 1]: { cellWidth: 30, halign: 'center', fontSize: 8 }
      },
      didParseCell: function(data) {
        // Colorer la colonne statut
        if (data.column.index === headers.length - 1) {
          const cellText = data.cell.text[0];
          if (cellText && cellText === 'CHAMPION') {
            data.cell.styles.fillColor = [255, 215, 0]; // Or pour le champion
            data.cell.styles.fontStyle = 'bold';
          } else if (cellText && cellText === 'VICE-CHAMP') {
            data.cell.styles.fillColor = [192, 192, 192]; // Argent
            data.cell.styles.fontStyle = 'bold';
          } else if (cellText && cellText === 'PODIUM') {
            data.cell.styles.fillColor = [205, 127, 50]; // Bronze
            data.cell.styles.fontStyle = 'bold';
          } else if (cellText && cellText === 'TOP 5') {
            data.cell.styles.fillColor = [144, 238, 144]; // Vert clair pour top 5
          }
        }
      }
    });
    
    // Sauvegarde
    const filename = title.toLowerCase().replace(/\s+/g, '-');
    doc.save(`${filename}-${championshipYear}.pdf`);
  }, []);

  return {
    exportGeneralStandings,
    exportCategoryStandings
  };
};
