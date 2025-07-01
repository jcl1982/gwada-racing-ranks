
import jsPDF from 'jspdf';
import { PDF_STYLES } from '../pdfStyles';

export const addLegendToDoc = (doc: jsPDF) => {
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // Titre de la légende avec un fond coloré
  doc.setFillColor(PDF_STYLES.colors.lightBlue[0], PDF_STYLES.colors.lightBlue[1], PDF_STYLES.colors.lightBlue[2]);
  doc.rect(15, finalY - 5, 170, 12, 'F');
  
  doc.setFontSize(PDF_STYLES.fonts.normalSize + 1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PDF_STYLES.colors.darkBlue[0], PDF_STYLES.colors.darkBlue[1], PDF_STYLES.colors.darkBlue[2]);
  doc.text('Légende des indicateurs d\'évolution:', 20, finalY + 2);
  
  // Contenu de la légende
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(PDF_STYLES.fonts.smallSize);
  
  // Indicateurs d'évolution
  doc.setTextColor(PDF_STYLES.colors.green[0], PDF_STYLES.colors.green[1], PDF_STYLES.colors.green[2]);
  doc.text('+X : Montée de X positions', 20, finalY + 12);
  
  doc.setTextColor(PDF_STYLES.colors.red[0], PDF_STYLES.colors.red[1], PDF_STYLES.colors.red[2]);
  doc.text('-X : Descente de X positions', 20, finalY + 20);
  
  doc.setTextColor(PDF_STYLES.colors.gray[0], PDF_STYLES.colors.gray[1], PDF_STYLES.colors.gray[2]);
  doc.text('= : Position stable', 20, finalY + 28);
  
  doc.setTextColor(PDF_STYLES.colors.orange[0], PDF_STYLES.colors.orange[1], PDF_STYLES.colors.orange[2]);
  doc.text('NEW : Nouveau pilote', 20, finalY + 36);
  
  // Légende des couleurs avec des petits rectangles colorés
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Couleurs des positions:', 100, finalY + 12);
  
  doc.setFont('helvetica', 'normal');
  
  // Champion (Or)
  doc.setFillColor(PDF_STYLES.colors.gold[0], PDF_STYLES.colors.gold[1], PDF_STYLES.colors.gold[2]);
  doc.rect(100, finalY + 16, 8, 6, 'F');
  doc.text('1ère place (Champion)', 110, finalY + 20);
  
  // Vice-champion (Argent)
  doc.setFillColor(PDF_STYLES.colors.silver[0], PDF_STYLES.colors.silver[1], PDF_STYLES.colors.silver[2]);
  doc.rect(100, finalY + 24, 8, 6, 'F');
  doc.text('2ème place (Vice-champion)', 110, finalY + 28);
  
  // Podium (Bronze)
  doc.setFillColor(PDF_STYLES.colors.bronze[0], PDF_STYLES.colors.bronze[1], PDF_STYLES.colors.bronze[2]);
  doc.rect(100, finalY + 32, 8, 6, 'F');
  doc.text('3ème place (Podium)', 110, finalY + 36);
  
  // Top 5 (Bleu clair)
  doc.setFillColor(PDF_STYLES.colors.lightBlue[0], PDF_STYLES.colors.lightBlue[1], PDF_STYLES.colors.lightBlue[2]);
  doc.rect(100, finalY + 40, 8, 6, 'F');
  doc.text('Top 5', 110, finalY + 44);
  
  // Reset couleur
  doc.setTextColor(0, 0, 0);
};
