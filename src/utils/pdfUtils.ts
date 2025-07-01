
import jsPDF from 'jspdf';

// Fonction pour convertir une image en base64
export const getImageAsBase64 = (imagePath: string): Promise<string> => {
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
};

// Fonction pour obtenir les couleurs de badge selon la position
export const getPositionColors = (position: number) => {
  if (position === 1) return { bg: [255, 215, 0] as [number, number, number], text: [0, 0, 0] as [number, number, number] }; // Or
  if (position === 2) return { bg: [192, 192, 192] as [number, number, number], text: [0, 0, 0] as [number, number, number] }; // Argent
  if (position === 3) return { bg: [205, 127, 50] as [number, number, number], text: [255, 255, 255] as [number, number, number] }; // Bronze
  if (position <= 10) return { bg: [34, 197, 94] as [number, number, number], text: [255, 255, 255] as [number, number, number] }; // Vert
  return { bg: [107, 114, 128] as [number, number, number], text: [255, 255, 255] as [number, number, number] }; // Gris
};

// Fonction pour ajouter les logos aux documents PDF
export const addLogosToDoc = async (doc: jsPDF) => {
  const [logoLigue, logoFFSA] = await Promise.all([
    getImageAsBase64('/lovable-uploads/62684b57-67a9-4b26-8c45-289e8ea186da.png'),
    getImageAsBase64('/lovable-uploads/174d8472-4f55-4be5-bd4c-6cad2885ed7d.png')
  ]);
  
  if (logoLigue) {
    doc.addImage(logoLigue, 'PNG', 10, 10, 30, 15);
  }
  if (logoFFSA) {
    const isLandscape = doc.internal.pageSize.getWidth() > doc.internal.pageSize.getHeight();
    const xPosition = isLandscape ? 257 : 170;
    doc.addImage(logoFFSA, 'PNG', xPosition, 10, 30, 15);
  }
};

// Fonction pour ajouter le titre du document
export const addDocumentTitle = (doc: jsPDF, title: string, subtitle: string) => {
  const isLandscape = doc.internal.pageSize.getWidth() > doc.internal.pageSize.getHeight();
  const centerX = isLandscape ? 148 : 105;
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text(title, centerX, 35, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(subtitle, centerX, 45, { align: 'center' });
  
  // Remettre la couleur du texte en noir
  doc.setTextColor(0, 0, 0);
};
