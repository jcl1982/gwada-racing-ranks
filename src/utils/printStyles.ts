
export const getPrintStyles = (customStyles?: string) => {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    @media print {
      body { 
        margin: 0; 
        padding: 20px; 
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
        font-variant-ligatures: common-ligatures;
        font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        unicode-bidi: embed;
        direction: ltr;
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
  `;
};

export const getBasicPrintStyles = () => {
  return `
    @media print {
      body { 
        margin: 0; 
        padding: 20px; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
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
  `;
};
