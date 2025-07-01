
import { useCallback } from 'react';
import { getPrintStyles, getBasicPrintStyles } from '@/utils/printStyles';
import { createPrintWindow, executePrint } from '@/utils/printWindow';

export const useWebPrint = () => {
  const printWebPage = useCallback((
    elementId?: string,
    title?: string
  ) => {
    try {
      // Sauvegarder le titre original
      const originalTitle = document.title;
      
      // Changer le titre pour l'impression si fourni
      if (title) {
        document.title = title;
      }

      // Si un élément spécifique est fourni, créer une version d'impression
      if (elementId) {
        const element = document.getElementById(elementId);
        if (!element) {
          console.error('Element not found:', elementId);
          return;
        }

        const printWindow = createPrintWindow(
          element,
          title || document.title,
          getBasicPrintStyles()
        );

        if (printWindow) {
          executePrint(printWindow);
        }
      } else {
        // Imprimer la page entière
        window.print();
      }

      // Restaurer le titre original
      document.title = originalTitle;
      
      console.log('✅ Impression web lancée avec support Unicode');
    } catch (error) {
      console.error('Erreur lors de l\'impression web:', error);
    }
  }, []);

  // Nouvelle fonction spécialement optimisée pour les caractères Unicode
  const printWithUnicodeSupport = useCallback((
    elementId?: string,
    title?: string,
    customStyles?: string
  ) => {
    try {
      const originalTitle = document.title;
      
      if (title) {
        document.title = title;
      }

      if (elementId) {
        const element = document.getElementById(elementId);
        if (!element) {
          console.error('Element not found:', elementId);
          return;
        }

        const printWindow = createPrintWindow(
          element,
          title || document.title,
          getPrintStyles(customStyles),
          true
        );

        if (printWindow) {
          executePrint(printWindow);
        }
      } else {
        window.print();
      }

      document.title = originalTitle;
      console.log('✅ Impression Unicode optimisée lancée');
    } catch (error) {
      console.error('Erreur lors de l\'impression Unicode:', error);
    }
  }, []);

  return { printWebPage, printWithUnicodeSupport };
};
