
import { useCallback } from 'react';
import jsPDF from 'jspdf';
import { ChampionshipStanding, Race, Driver } from '@/types/championship';
import { addLogosToDoc, addTitleToDoc } from '@/utils/pdfLogos';
import { createGeneralStandingsTable } from '@/utils/pdf/generalStandingsTable';
import { createCategoryStandingsTable } from '@/utils/pdf/categoryStandingsTable';
import { addLegendToDoc } from '@/utils/pdf/pdfLegend';

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
    
    // Ajout des logos
    addLogosToDoc(doc);
    
    // Ajout du titre
    addTitleToDoc(doc, championshipTitle, `Classement Général ${championshipYear}`);
    
    // Création du tableau
    createGeneralStandingsTable(doc, standings);
    
    // Ajout de la légende
    addLegendToDoc(doc);
    
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
    
    // Ajout des logos
    addLogosToDoc(doc, true);
    
    // Ajout du titre
    addTitleToDoc(doc, title, `Saison ${championshipYear}`, 148);
    
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
    
    // Construction des en-têtes de colonnes (suppression de la colonne Statut)
    const headers = ['Position', 'Pilote'];
    races.forEach(race => {
      headers.push(`${race.name} (${new Date(race.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })})`);
    });
    headers.push('Total');
    // Suppression de headers.push('Statut');
    
    // Création du tableau
    createCategoryStandingsTable(doc, headers, standings, races);
    
    // Sauvegarde
    const filename = title.toLowerCase().replace(/\s+/g, '-');
    doc.save(`${filename}-${championshipYear}.pdf`);
  }, []);

  return {
    exportGeneralStandings,
    exportCategoryStandings
  };
};
