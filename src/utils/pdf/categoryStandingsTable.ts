
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Race, Driver } from '@/types/championship';
import { getPositionRowStyle, PDF_STYLES } from '../pdfStyles';

type PdfStanding = { driver: Driver; points: number; position: number };

export const buildCategoryTableRows = (standings: PdfStanding[], races: Race[]): string[][] =>
  standings.map((standing) => {
    const row = [standing.position.toString(), standing.driver.name, standing.driver.carModel || '-'];
    races.forEach(race => {
      const result = race.results.find(r => r.driverId === standing.driver.id);
      row.push(result ? `${result.points} pts (P${result.position})` : '-');
    });
    row.push(`${standing.points}`);
    const leaderPoints = standings[0]?.points || 0;
    const gap = leaderPoints - standing.points;
    row.push(gap === 0 ? '—' : `-${gap}`);
    return row;
  });

export const createCategoryStandingsTable = (
  doc: jsPDF,
  headers: string[],
  standings: PdfStanding[],
  races: Race[]
) => {
  const tableData = buildCategoryTableRows(standings, races);

  console.log('📄 Données du tableau PDF (catégorie):', tableData);
  
  // Mise à jour de l'en-tête pour remplacer "Position" par "Pos"
  const updatedHeaders = [...headers];
  updatedHeaders[0] = 'Pos';
  
  autoTable(doc, {
    head: [updatedHeaders],
    body: tableData,
    startY: PDF_STYLES.positions.tableStart.y,
    didParseCell: function(data) {
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
