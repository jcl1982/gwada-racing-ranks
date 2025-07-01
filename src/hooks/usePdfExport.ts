
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
    
    // Titre
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(championshipTitle, 105, 35, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Classement Général ${championshipYear}`, 105, 45, { align: 'center' });
    
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
    
    // Titre
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 148, 35, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Saison ${championshipYear}`, 148, 45, { align: 'center' });
    
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
  }, [getImageAsBase64]);

  return {
    exportGeneralStandings,
    exportCategoryStandings
  };
};
