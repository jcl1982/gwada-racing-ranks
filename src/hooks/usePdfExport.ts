
import { useCallback } from 'react';
import jsPDF from 'jspdf';
import { ChampionshipStanding, Race, Driver } from '@/types/championship';
import { addLogosToDoc, addTitleToDoc } from '@/utils/pdfLogos';
import { createGeneralStandingsTable } from '@/utils/pdf/generalStandingsTable';
import { createCategoryStandingsTable } from '@/utils/pdf/categoryStandingsTable';

export const usePdfExport = () => {
  const exportGeneralStandings = useCallback((
    standings: ChampionshipStanding[],
    championshipTitle: string,
    customTitle?: string,
    championshipYear?: string
  ) => {
    try {
      // Utiliser le titre personnalisé s'il est fourni, sinon utiliser "Classement Général"
      const displayTitle = customTitle || 'Classement Général';
      const year = championshipYear || new Date().getFullYear().toString();
      
      console.log('🏆 Export PDF - Classement Général:', standings.map(s => ({
        position: s.position,
        name: s.driver.name,
        totalPoints: s.totalPoints
      })));

      // Validation des données
      if (!standings || standings.length === 0) {
        throw new Error('Aucune donnée de classement à exporter');
      }

      // Validation des pilotes
      for (const standing of standings) {
        if (!standing.driver || !standing.driver.name) {
          throw new Error('Données de pilote invalides dans le classement');
        }
      }

      const doc = new jsPDF();
      
      // Ajout des logos
      addLogosToDoc(doc);
      
      // Ajout du titre avec le titre personnalisé
      addTitleToDoc(doc, championshipTitle, `${displayTitle} ${year}`);
      
      // Création du tableau
      createGeneralStandingsTable(doc, standings);
      
      // Sauvegarde
      const filename = `classement-general-${year}.pdf`;
      doc.save(filename);
      
      console.log('✅ PDF généré avec succès:', filename);
    } catch (error) {
      console.error('❌ Erreur lors de l\'export PDF du classement général:', error);
      throw new Error(`Erreur lors de l'export PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
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
    try {
      console.log('🏁 Export PDF - Classement Catégorie:', title, preCalculatedStandings?.map(s => ({
        position: s.position,
        name: s.driver.name,
        points: s.points
      })));

      // Validation des données
      if (!title) {
        throw new Error('Titre de catégorie manquant');
      }

      if (!races || races.length === 0) {
        throw new Error('Aucune course à exporter pour cette catégorie');
      }

      if (!drivers || drivers.length === 0) {
        throw new Error('Aucun pilote trouvé pour cette catégorie');
      }

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
            return { 
              driver, 
              points, 
              positionChange: 0, 
              previousPosition: undefined 
            };
          })
          .sort((a, b) => b.points - a.points)
          .map((standing, index) => ({
            ...standing,
            position: index + 1
          }));
      }

      // Validation des classements
      if (!standings || standings.length === 0) {
        throw new Error('Aucun classement à exporter');
      }
      
      // Construction des en-têtes de colonnes
      const headers = ['Position', 'Pilote', 'Véhicule'];
      races.forEach(race => {
        headers.push(`${race.name} (${new Date(race.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })})`);
      });
      headers.push('Total');
      headers.push('Écart');
      
      // Création du tableau
      createCategoryStandingsTable(doc, headers, standings, races);
      
      // Sauvegarde
      const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${championshipYear}.pdf`;
      doc.save(filename);
      
      console.log('✅ PDF de catégorie généré avec succès:', filename);
    } catch (error) {
      console.error('❌ Erreur lors de l\'export PDF de catégorie:', error);
      throw new Error(`Erreur lors de l'export PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }, []);

  return {
    exportGeneralStandings,
    exportCategoryStandings
  };
};
