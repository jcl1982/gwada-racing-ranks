
import jsPDF from 'jspdf';
import { PDF_STYLES } from '../pdfStyles';

export const addLegendToDoc = (doc: jsPDF) => {
  const finalY = (doc as any).lastAutoTable.finalY + PDF_STYLES.spacing.sectionGap;
  
  // Titre de la légende avec style du site (gradient-ocean)
  doc.setFillColor(PDF_STYLES.colors.oceanBlue[0], PDF_STYLES.colors.oceanBlue[1], PDF_STYLES.colors.oceanBlue[2]);
  doc.roundedRect(PDF_STYLES.spacing.marginHorizontal, finalY - 5, 170, 18, 3, 3, 'F');
  
  doc.setFontSize(PDF_STYLES.fonts.normalSize + 3);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Légende des indicateurs', PDF_STYLES.spacing.marginHorizontal + 8, finalY + 6);
  
  // Contenu de la légende avec style moderne
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(PDF_STYLES.fonts.normalSize);
  
  const legendStartY = finalY + 25;
  const lineHeight = 12;
  let currentY = legendStartY;
  
  // Indicateurs d'évolution avec les couleurs du site
  doc.setTextColor(PDF_STYLES.colors.success[0], PDF_STYLES.colors.success[1], PDF_STYLES.colors.success[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('+X', PDF_STYLES.spacing.marginHorizontal + 8, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(PDF_STYLES.colors.gray600[0], PDF_STYLES.colors.gray600[1], PDF_STYLES.colors.gray600[2]);
  doc.text('Montée de X positions', PDF_STYLES.spacing.marginHorizontal + 25, currentY);
  
  currentY += lineHeight;
  doc.setTextColor(PDF_STYLES.colors.danger[0], PDF_STYLES.colors.danger[1], PDF_STYLES.colors.danger[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('-X', PDF_STYLES.spacing.marginHorizontal + 8, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(PDF_STYLES.colors.gray600[0], PDF_STYLES.colors.gray600[1], PDF_STYLES.colors.gray600[2]);
  doc.text('Descente de X positions', PDF_STYLES.spacing.marginHorizontal + 25, currentY);
  
  currentY += lineHeight;
  doc.setTextColor(PDF_STYLES.colors.gray600[0], PDF_STYLES.colors.gray600[1], PDF_STYLES.colors.gray600[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('=', PDF_STYLES.spacing.marginHorizontal + 8, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text('Position stable', PDF_STYLES.spacing.marginHorizontal + 25, currentY);
  
  currentY += lineHeight;
  doc.setTextColor(PDF_STYLES.colors.warning[0], PDF_STYLES.colors.warning[1], PDF_STYLES.colors.warning[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('NEW', PDF_STYLES.spacing.marginHorizontal + 8, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(PDF_STYLES.colors.gray600[0], PDF_STYLES.colors.gray600[1], PDF_STYLES.colors.gray600[2]);
  doc.text('Nouveau pilote', PDF_STYLES.spacing.marginHorizontal + 25, currentY);
  
  // Légende des couleurs avec style du site
  const colorsStartX = 130;
  currentY = legendStartY;
  
  doc.setTextColor(PDF_STYLES.colors.gray900[0], PDF_STYLES.colors.gray900[1], PDF_STYLES.colors.gray900[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Couleurs des positions:', colorsStartX, currentY);
  
  doc.setFont('helvetica', 'normal');
  currentY += lineHeight;
  
  // Champion (Or) - style badge du site
  doc.setFillColor(PDF_STYLES.colors.gold[0], PDF_STYLES.colors.gold[1], PDF_STYLES.colors.gold[2]);
  doc.roundedRect(colorsStartX, currentY - 5, 12, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(PDF_STYLES.fonts.smallSize);
  doc.text('1', colorsStartX + 6, currentY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(PDF_STYLES.fonts.normalSize);
  doc.setTextColor(PDF_STYLES.colors.gray600[0], PDF_STYLES.colors.gray600[1], PDF_STYLES.colors.gray600[2]);
  doc.text('1ère place (Champion)', colorsStartX + 18, currentY);
  
  currentY += lineHeight;
  // Vice-champion (Argent)
  doc.setFillColor(PDF_STYLES.colors.silver[0], PDF_STYLES.colors.silver[1], PDF_STYLES.colors.silver[2]);
  doc.roundedRect(colorsStartX, currentY - 5, 12, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(PDF_STYLES.fonts.smallSize);
  doc.text('2', colorsStartX + 6, currentY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(PDF_STYLES.fonts.normalSize);
  doc.setTextColor(PDF_STYLES.colors.gray600[0], PDF_STYLES.colors.gray600[1], PDF_STYLES.colors.gray600[2]);
  doc.text('2ème place', colorsStartX + 18, currentY);
  
  currentY += lineHeight;
  // Podium (Bronze)
  doc.setFillColor(PDF_STYLES.colors.bronze[0], PDF_STYLES.colors.bronze[1], PDF_STYLES.colors.bronze[2]);
  doc.roundedRect(colorsStartX, currentY - 5, 12, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(PDF_STYLES.fonts.smallSize);
  doc.text('3', colorsStartX + 6, currentY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(PDF_STYLES.fonts.normalSize);
  doc.setTextColor(PDF_STYLES.colors.gray600[0], PDF_STYLES.colors.gray600[1], PDF_STYLES.colors.gray600[2]);
  doc.text('3ème place', colorsStartX + 18, currentY);
  
  currentY += lineHeight;
  // Top 5 - style badge bleu du site
  doc.setFillColor(PDF_STYLES.colors.blueBadge[0], PDF_STYLES.colors.blueBadge[1], PDF_STYLES.colors.blueBadge[2]);
  doc.roundedRect(colorsStartX, currentY - 5, 12, 8, 2, 2, 'F');
  doc.setTextColor(PDF_STYLES.colors.primary[0], PDF_STYLES.colors.primary[1], PDF_STYLES.colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(PDF_STYLES.fonts.smallSize);
  doc.text('5', colorsStartX + 6, currentY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(PDF_STYLES.fonts.normalSize);
  doc.setTextColor(PDF_STYLES.colors.gray600[0], PDF_STYLES.colors.gray600[1], PDF_STYLES.colors.gray600[2]);
  doc.text('Top 5', colorsStartX + 18, currentY);
  
  // Reset couleur
  doc.setTextColor(0, 0, 0);
};
