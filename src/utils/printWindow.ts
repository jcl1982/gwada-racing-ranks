
export const createPrintWindow = (
  element: HTMLElement,
  title: string,
  styles: string,
  isUnicodeOptimized = false
): Window | null => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Unable to open print window');
    return null;
  }

  // Copier les styles de la page principale
  const pageStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(style => style.outerHTML)
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        ${pageStyles}
        <style>${styles}</style>
      </head>
      <body${isUnicodeOptimized ? ' class="unicode-text"' : ''}>
        ${element.outerHTML}
      </body>
    </html>
  `;

  // Écrire le contenu avec encodage UTF-8
  printWindow.document.open('text/html', 'replace');
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  return printWindow;
};

export const executePrint = (printWindow: Window) => {
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};
