
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

        // Créer le contenu HTML pour l'impression
        const printContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title || document.title}</title>
              ${styles}
              <style>
                @media print {
                  body { margin: 0; padding: 20px; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body>
              ${element.outerHTML}
            </body>
          </html>
        `;

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
      
      console.log('✅ Impression web lancée');
    } catch (error) {
      console.error('Erreur lors de l\'impression web:', error);
    }
  }, []);

  return { printWebPage };
};
