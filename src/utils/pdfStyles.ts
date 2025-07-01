export const PDF_STYLES = {
  colors: {
    headerBlue: [52, 73, 94] as [number, number, number], // Bleu ardoise plus doux
    lightGray: [248, 249, 250] as [number, number, number], // Gris très clair
    green: [46, 204, 113] as [number, number, number], // Vert émeraude
    red: [231, 76, 60] as [number, number, number], // Rouge corail
    orange: [243, 156, 18] as [number, number, number], // Orange chaleureux
    gray: [149, 165, 166] as [number, number, number], // Gris neutre
    
    // Couleurs de podium plus élégantes
    gold: [241, 196, 15] as [number, number, number], // Or plus subtil
    silver: [189, 195, 199] as [number, number, number], // Argent moderne
    bronze: [185, 119, 14] as [number, number, number], // Bronze raffiné
    
    // Couleurs d'accentuation
    lightGreen: [232, 245, 233] as [number, number, number], // Vert très clair
    darkBlue: [44, 62, 80] as [number, number, number], // Bleu foncé moderne
    lightBlue: [214, 234, 248] as [number, number, number], // Bleu clair raffiné
    champagne: [253, 251, 248] as [number, number, number], // Champagne plus doux
    
    // Nouvelles couleurs pour un meilleur contraste
    primary: [41, 98, 255] as [number, number, number], // Bleu principal
    secondary: [108, 117, 125] as [number, number, number], // Gris secondaire
    success: [25, 135, 84] as [number, number, number], // Vert succès
    warning: [255, 193, 7] as [number, number, number], // Jaune attention
    danger: [220, 53, 69] as [number, number, number] // Rouge danger
  },
  fonts: {
    titleSize: 22,
    subtitleSize: 18,
    normalSize: 10,
    smallSize: 8,
    legendSize: 8
  },
  positions: {
    logoLeft: { x: 20, y: 15, width: 30, height: 30 },
    logoRight: { x: 155, y: 15, width: 30, height: 30 },
    logoRightLandscape: { x: 245 },
    title: { y: 40 },
    subtitle: { y: 52 },
    tableStart: { y: 70 }
  },
  spacing: {
    sectionGap: 20,
    rowHeight: 12,
    cellPadding: 6,
    marginHorizontal: 20,
    marginVertical: 15
  }
};

export const getPositionEvolutionIndicator = (positionChange: number, previousPosition?: number): string => {
  if (positionChange > 0) {
    return `+${positionChange}`;
  } else if (positionChange < 0) {
    return `${positionChange}`;
  } else if (previousPosition) {
    return '=';
  } else {
    return 'NEW';
  }
};

export const getStatusText = (index: number): string => {
  if (index === 0) return 'CHAMPION';
  else if (index === 1) return 'VICE-CHAMP';
  else if (index === 2) return 'PODIUM';
  else if (index < 5) return 'TOP 5';
  else return `${index + 1}eme`;
};

export const getPositionRowStyle = (position: number) => {
  if (position === 1) {
    return { fillColor: PDF_STYLES.colors.gold, textColor: [0, 0, 0] };
  } else if (position === 2) {
    return { fillColor: PDF_STYLES.colors.silver, textColor: [0, 0, 0] };
  } else if (position === 3) {
    return { fillColor: PDF_STYLES.colors.bronze, textColor: [255, 255, 255] };
  } else if (position <= 5) {
    return { fillColor: PDF_STYLES.colors.lightBlue, textColor: [0, 0, 0] };
  }
  return null;
};
