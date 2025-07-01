
import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChampionshipStanding, Race, Driver } from '@/types/championship';
import { calculateDriverPoints } from '@/utils/championship';

export const usePdfExport = () => {
  const exportGeneralStandings = useCallback((
    standings: ChampionshipStanding[],
    championshipTitle: string,
    championshipYear: string
  ) => {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(championshipTitle, 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Classement Général ${championshipYear}`, 105, 30, { align: 'center' });
    
    // Tableau des classements
    const tableData = standings.map(standing => [
      standing.position.toString(),
      standing.driver.name,
      standing.montagnePoints.toString(),
      standing.rallyePoints.toString(),
      standing.totalPoints.toString()
    ]);
    
    autoTable(doc, {
      head: [['Position', 'Pilote', 'Montagne', 'Rallye', 'Total']],
      body: tableData,
      startY: 40,
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
    championshipYear: string
  ) => {
    const doc = new jsPDF('landscape');
    
    // Titre
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 148, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Saison ${championshipYear}`, 148, 30, { align: 'center' });
    
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
    
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 40,
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
