
import jsPDF from 'jspdf';
import { PDF_STYLES } from './pdfStyles';

export const addLogosToDoc = (doc: jsPDF, isLandscape: boolean = false) => {
  // Logo de la ligue (haut gauche)
  const ligueLogoUrl = '/lovable-uploads/9fcde9f0-2732-40e7-a37d-2bf3981cefaf.png';
  doc.addImage(ligueLogoUrl, 'PNG', PDF_STYLES.positions.logoLeft.x, PDF_STYLES.positions.logoLeft.y, PDF_STYLES.positions.logoLeft.width, PDF_STYLES.positions.logoLeft.height);
  
  // Logo de la fédération (haut droite)
  const federationLogoUrl = '/lovable-uploads/1bf8922d-c9c0-423c-93bd-29ddb120e512.png';
  const rightX = isLandscape ? PDF_STYLES.positions.logoRightLandscape.x : PDF_STYLES.positions.logoRight.x;
  doc.addImage(federationLogoUrl, 'PNG', rightX, PDF_STYLES.positions.logoRight.y, PDF_STYLES.positions.logoRight.width, PDF_STYLES.positions.logoRight.height);
};

export const addTitleToDoc = (doc: jsPDF, title: string, subtitle: string, centerX: number = 105) => {
  doc.setFontSize(PDF_STYLES.fonts.titleSize);
  doc.setFont('helvetica', 'bold');
  doc.text(title, centerX, PDF_STYLES.positions.title.y, { align: 'center' });
  
  doc.setFontSize(PDF_STYLES.fonts.subtitleSize);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, centerX, PDF_STYLES.positions.subtitle.y, { align: 'center' });
};
