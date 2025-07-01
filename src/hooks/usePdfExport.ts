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
    
    // Tableau des classements - IMPORTANT: on respecte l'ordre exact des standings passés
    const tableData = standings
      .sort((a, b) => a.position - b.position) // Tri par position croissante pour garantir l'ordre
      .map(standing => [
        standing.position.toString(),
        standing.driver.name,
        standing.montagnePoints.toString(),
        standing.rallyePoints.toString(),
        standing.totalPoints.toString()
      ]);

    console.log('📄 Données du tableau PDF:', tableData);
    
    autoTable(doc, {
      head: [['Position', 'Pilote', 'Montagne', 'Rallye', 'Total']],
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
      }
    });
    
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
      standings = preCalculatedStandings.sort((a, b) => a.position - b.position); // Tri par position
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
    
    // Construction des données
    const tableData = standings.map(standing => {
      const row = [standing.position.toString(), standing.driver.name];
      
      races.forEach(race => {
        const result = race.results.find(r => r.driverId === standing.driver.id);
        if (result) {
          row.push(`${result.points} pts (P${result.position})`);
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
      startY: 55,
      styles: {
        fontSize: 8,
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
        0: { cellWidth: 20 },
        1: { cellWidth: 40 }
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
