
import { getBasePrintStyles, getUnicodePrintStyles } from './printStyles';
import { createPrintWindow, manageDocumentTitle } from './printWindow';

export const executeWebPrint = (
  elementId?: string,
  title?: string
): void => {
  try {
    const restoreTitle = manageDocumentTitle(title);

    if (elementId) {
      const element = document.getElementById(elementId);
      if (!element) {
        console.error('Element not found:', elementId);
        return;
      }

      const styles = getBasePrintStyles();
      createPrintWindow(element, title || document.title, styles, false);
    } else {
      // Imprimer la page entière
      window.print();
    }

    restoreTitle();
    console.log('✅ Impression web lancée avec police réduite de 3 points');
  } catch (error) {
    console.error('Erreur lors de l\'impression web:', error);
  }
};

export const executeUnicodePrint = (
  elementId?: string,
  title?: string,
  customStyles?: string
): void => {
  try {
    const restoreTitle = manageDocumentTitle(title);

    if (elementId) {
      const element = document.getElementById(elementId);
      if (!element) {
        console.error('Element not found:', elementId);
        return;
      }

      const styles = getUnicodePrintStyles(customStyles);
      createPrintWindow(element, title || document.title, styles, true);
    } else {
      window.print();
    }

    restoreTitle();
    console.log('✅ Impression Unicode optimisée lancée avec police réduite');
  } catch (error) {
    console.error('Erreur lors de l\'impression Unicode:', error);
  }
};
