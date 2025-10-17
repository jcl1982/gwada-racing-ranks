
import { useCallback } from 'react';
import html2canvas from 'html2canvas';

export const useImageExport = () => {
  const exportToImage = useCallback(async (
    elementId: string,
    filename: string,
    title?: string
  ) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        console.error('Element not found:', elementId);
        return;
      }

      // Configuration pour une meilleure qualité d'image
      const canvas = await html2canvas(element, {
        scale: 2, // Haute résolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: true,
        imageTimeout: 15000,
        height: element.scrollHeight,
        width: element.scrollWidth,
        ignoreElements: (element) => {
          // Ignorer les éléments avec la classe no-print ou no-export
          return element.classList?.contains('no-print') || 
                 element.classList?.contains('no-export') ||
                 element.hasAttribute('data-html2canvas-ignore');
        },
      });

      // Convertir en image et télécharger
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = image;
      link.click();
      
      console.log(`✅ Image exportée: ${filename}.png`);
    } catch (error) {
      console.error('Erreur lors de l\'export en image:', error);
    }
  }, []);

  return { exportToImage };
};
