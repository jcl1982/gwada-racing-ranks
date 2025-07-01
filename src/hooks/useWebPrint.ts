
import { useCallback } from 'react';

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

        // Créer une nouvelle fenêtre pour l'impression
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          console.error('Unable to open print window');
          return;
        }

        // Copier les styles de la page principale
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
          .map(style => style.outerHTML)
          .join('');

        // Créer le contenu HTML pour l'impression avec support Unicode complet
        const printContent = `
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
              <title>${title || document.title}</title>
              ${styles}
              <style>
                @media print {
                  body { 
                    margin: 0; 
                    padding: 20px; 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    font-size: calc(1rem - 3pt);
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                  }
                  * {
                    font-size: calc(1em - 3pt) !important;
                  }
                  .no-print { display: none !important; }
                  * {
                    color-adjust: exact !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                }
                @page {
                  margin: 1cm;
                  size: A4;
                }
              </style>
            </head>
            <body>
              ${element.outerHTML}
            </body>
          </html>
        `;

        // Écrire le contenu avec encodage UTF-8
        printWindow.document.open('text/html', 'replace');
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Attendre que le contenu soit chargé puis imprimer
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      } else {
        // Imprimer la page entière
        window.print();
      }

      // Restaurer le titre original
      document.title = originalTitle;
      
      console.log('✅ Impression web lancée avec police réduite de 3 points');
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

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          console.error('Unable to open print window');
          return;
        }

        // Styles optimisés pour Unicode
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
          .map(style => style.outerHTML)
          .join('');

        const unicodeOptimizedContent = `
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${title || document.title}</title>
              ${styles}
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                @media print {
                  body { 
                    margin: 0; 
                    padding: 20px; 
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
                    font-size: calc(1rem - 3pt);
                    font-variant-ligatures: common-ligatures;
                    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
                    text-rendering: optimizeLegibility;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    unicode-bidi: embed;
                    direction: ltr;
                  }
                  * {
                    font-size: calc(1em - 3pt) !important;
                  }
                  .no-print { display: none !important; }
                  * {
                    color-adjust: exact !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  /* Support pour les caractères spéciaux */
                  .unicode-text {
                    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1;
                    text-rendering: optimizeLegibility;
                  }
                }
                @page {
                  margin: 1cm;
                  size: A4;
                }
                ${customStyles || ''}
              </style>
            </head>
            <body class="unicode-text">
              ${element.outerHTML}
            </body>
          </html>
        `;

        printWindow.document.open('text/html', 'replace');
        printWindow.document.write(unicodeOptimizedContent);
        printWindow.document.close();
        
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      } else {
        window.print();
      }

      document.title = originalTitle;
      console.log('✅ Impression Unicode optimisée lancée avec police réduite');
    } catch (error) {
      console.error('Erreur lors de l\'impression Unicode:', error);
    }
  }, []);

  return { printWebPage, printWithUnicodeSupport };
};
