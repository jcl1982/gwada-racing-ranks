
export const createPrintWindow = (
  element: HTMLElement,
  title: string,
  styles: string,
  isUnicode = false
): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Unable to open print window');
    return;
  }

  // Copier les styles de la page principale
  const pageStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
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
        <title>${title}</title>
        ${pageStyles}
        <style>
          ${styles}
        </style>
      </head>
      <body${isUnicode ? ' class="unicode-text"' : ''}>
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
};

export const manageDocumentTitle = (newTitle?: string) => {
  const originalTitle = document.title;
  
  if (newTitle) {
    document.title = newTitle;
  }
  
  return () => {
    document.title = originalTitle;
  };
};
