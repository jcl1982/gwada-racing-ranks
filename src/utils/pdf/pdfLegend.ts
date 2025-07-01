
import jsPDF from 'jspdf';
import { PDF_STYLES } from '../pdfStyles';

export const addLegendToDoc = (doc: jsPDF) => {
  const finalY = (doc as any).lastAutoTable.finalY + PDF_STYLES.spacing.sectionGap;
  
  // Titre de la légende avec un design moderne
  doc.setFillColor(PDF_STYLES.colors.primary[0], PDF_STYLES.colors.primary[1], PDF_STYLES.colors.primary[2]);
  doc.roundedRect(PDF_STYLES.spacing.marginHorizontal, finalY - 3, 170, 14, 2, 2, 'F');
  
  doc.setFontSize(PDF_STYLES.fonts.normalSize + 2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Légende des indicateurs', PDF_STYLES.spacing.marginHorizontal + 5, finalY + 5);
  
  // Contenu de la légende avec meilleur espacement
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(PDF_STYLES.fonts.smallSize + 1);
  
  const legendStartY = finalY + 20;
  const lineHeight = 10;
  let currentY = legendStartY;
  
  // Indicateurs d'évolution avec couleurs améliorées
  doc.setTextColor(PDF_STYLES.colors.success[0], PDF_STYLES.colors.success[1], PDF_STYLES.colors.success[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('+X', PDF_STYLES.spacing.marginHorizontal + 5, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Montée de X positions', PDF_STYLES.spacing.marginHorizontal + 20, currentY);
  
  currentY += lineHeight;
  doc.setTextColor(PDF_STYLES.colors.danger[0], PDF_STYLES.colors.danger[1], PDF_STYLES.colors.danger[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('-X', PDF_STYLES.spacing.marginHorizontal + 5, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Descente de X positions', PDF_STYLES.spacing.marginHorizontal + 20, currentY);
  
  currentY += lineHeight;
  doc.setTextColor(PDF_STYLES.colors.secondary[0], PDF_STYLES.colors.secondary[1], PDF_STYLES.colors.secondary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('=', PDF_STYLES.spacing.marginHorizontal + 5, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Position stable', PDF_STYLES.spacing.marginHorizontal + 20, currentY);
  
  currentY += lineHeight;
  doc.setTextColor(PDF_STYLES.colors.warning[0], PDF_STYLES.colors.warning[1], PDF_STYLES.colors.warning[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('NEW', PDF_STYLES.spacing.marginHorizontal + 5, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Nouveau pilote', PDF_STYLES.spacing.marginHorizontal + 20, currentY);
  
  // Légende des couleurs avec design amélioré
  const colorsStartX = 120;
  currentY = legendStartY;
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Couleurs des positions:', colorsStartX, currentY);
  
  doc.setFont('helvetica', 'normal');
  currentY += lineHeight;
  
  // Champion (Or) avec rectangle arrondi
  doc.setFillColor(PDF_STYLES.colors.gold[0], PDF_STYLES.colors.gold[1], PDF_STYLES.colors.gold[2]);
  doc.roundedRect(colorsStartX, currentY - 4, 10, 6, 1, 1, 'F');
  doc.text('1ère place (Champion)', colorsStartX + 15, currentY);
  
  currentY += lineHeight;
  // Vice-champion (Argent)
  doc.setFillColor(PDF_STYLES.colors.silver[0], PDF_STYLES.colors.silver[1], PDF_STYLES.colors.silver[2]);
  doc.roundedRect(colorsStartX, currentY - 4, 10, 6, 1, 1, 'F');
  doc.text('2ème place', colorsStartX + 15, currentY);
  
  currentY += lineHeight;
  // Podium (Bronze)
  doc.setFillColor(PDF_STYLES.colors.bronze[0], PDF_STYLES.colors.bronze[1], PDF_STYLES.colors.bronze[2]);
  doc.roundedRect(colorsStartX, currentY - 4, 10, 6, 1, 1, 'F');
  doc.text('3ème place', colorsStartX + 15, currentY);
  
  currentY += lineHeight;
  // Top 5
  doc.setFillColor(PDF_STYLES.colors.lightBlue[0], PDF_STYLES.colors.lightBlue[1], PDF_STYLES.colors.lightBlue[2]);
  doc.roundedRect(colorsStartX, currentY - 4, 10, 6, 1, 1, 'F');
  doc.text('Top 5', colorsStartX + 15, currentY);
  
  // Reset couleur
  doc.setTextColor(0, 0, 0);
};
