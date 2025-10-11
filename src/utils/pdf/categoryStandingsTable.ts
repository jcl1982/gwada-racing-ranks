
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Race, Driver } from '@/types/championship';
import { getPositionEvolutionIndicator, getEvolutionColor, getPositionRowStyle, PDF_STYLES } from '../pdfStyles';

export const createCategoryStandingsTable = (
  doc: jsPDF,
  headers: string[],
  standings: Array<{
    driver: Driver;
    points: number;
    position: number;
    positionChange?: number;
    previousPosition?: number;
  }>,
  races: Race[]
) => {
  const tableData = standings.map((standing) => {
    // Utiliser l'évolution basée sur la sauvegarde précédente
    const evolutionIndicator = getPositionEvolutionIndicator(
      standing.positionChange || 0, 
      standing.previousPosition
    );
    
    const row = [standing.position.toString(), evolutionIndicator, standing.driver.name, standing.driver.carModel || '-'];
    
    let previousTotal = 0;
    races.forEach(race => {
      const result = race.results.find(r => r.driverId === standing.driver.id);
      if (result) {
        const currentRacePoints = result.points;
        const newTotal = previousTotal + currentRacePoints;
        row.push(`${currentRacePoints} pts (P${result.position})`);
        previousTotal = newTotal;
      } else {
        row.push('-');
      }
    });
    
    // Ajouter les points totaux
    row.push(`${standing.points}`);
    
    return row;
  });

  console.log('📄 Données du tableau PDF (catégorie):', tableData);
  
  // Mise à jour de l'en-tête pour remplacer "Position" par "Pos"
  const updatedHeaders = [...headers];
  updatedHeaders[0] = 'Pos';
  
  autoTable(doc, {
    head: [updatedHeaders],
    body: tableData,
    startY: PDF_STYLES.positions.tableStart.y,
    didParseCell: function(data) {
      // Colorer la colonne évolution (index 1)
      if (data.column.index === 1 && data.section === 'body') {
        const standing = standings[data.row.index];
        const color = getEvolutionColor(standing.positionChange || 0, standing.previousPosition);
        data.cell.styles.textColor = color;
        data.cell.styles.fontStyle = 'bold';
      }
      
      // Colorer les lignes selon la position
      if (data.section === 'body') {
        const standing = standings[data.row.index];
        const positionStyle = getPositionRowStyle(standing.position);
        
        if (positionStyle) {
          data.cell.styles.fillColor = positionStyle.fillColor;
          data.cell.styles.textColor = positionStyle.textColor;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
};
