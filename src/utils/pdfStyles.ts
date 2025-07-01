
export const PDF_STYLES = {
  colors: {
    // Couleurs modernes et élégantes
    primary: [59, 130, 246] as [number, number, number], // Bleu moderne
    secondary: [245, 158, 11] as [number, number, number], // Orange/Gold
    accent: [239, 68, 68] as [number, number, number], // Rouge
    
    // Couleurs de badges position premium
    gold: [251, 191, 36] as [number, number, number], // Or plus vibrant
    silver: [148, 163, 184] as [number, number, number], // Argent moderne
    bronze: [194, 65, 12] as [number, number, number], // Bronze riche
    blue: [59, 130, 246] as [number, number, number], // Bleu moderne
    blueBadge: [219, 234, 254] as [number, number, number], // Bleu clair
    
    // Couleurs de fond élégantes
    backgroundLight: [249, 250, 251] as [number, number, number],
    backgroundWhite: [255, 255, 255] as [number, number, number],
    headerBg: [248, 250, 252] as [number, number, number],
    
    // Couleurs pour les badges points
    montagneLight: [220, 252, 231] as [number, number, number], // Vert clair
    montagneDark: [21, 128, 61] as [number, number, number], // Vert foncé
    rallyeLight: [219, 234, 254] as [number, number, number], // Bleu clair
    rallyeDark: [30, 64, 175] as [number, number, number], // Bleu foncé
    
    // Couleurs d'évolution modernes
    success: [22, 163, 74] as [number, number, number], // Vert plus saturé
    successLight: [220, 252, 231] as [number, number, number], // Fond vert clair
    danger: [220, 38, 38] as [number, number, number], // Rouge plus saturé
    dangerLight: [254, 226, 226] as [number, number, number], // Fond rouge clair
    warning: [245, 158, 11] as [number, number, number], // Orange
    warningLight: [255, 237, 213] as [number, number, number], // Fond orange clair
    
    // Couleurs neutres premium
    gray50: [248, 250, 252] as [number, number, number],
    gray100: [241, 245, 249] as [number, number, number],
    gray200: [226, 232, 240] as [number, number, number],
    gray400: [148, 163, 184] as [number, number, number],
    gray600: [71, 85, 105] as [number, number, number],
    gray700: [51, 65, 85] as [number, number, number],
    gray800: [30, 41, 59] as [number, number, number],
    gray900: [15, 23, 42] as [number, number, number],
    
    // Dégradés pour les en-têtes
    oceanBlue: [59, 130, 246] as [number, number, number],
    oceanCyan: [6, 182, 212] as [number, number, number]
  },
  fonts: {
    titleSize: 24,
    subtitleSize: 18,
    normalSize: 11,
    smallSize: 9,
    legendSize: 9
  },
  positions: {
    logoLeft: { x: 20, y: 15, width: 30, height: 30 },
    logoRight: { x: 155, y: 15, width: 30, height: 30 },
    logoRightLandscape: { x: 245 },
    title: { y: 42 },
    subtitle: { y: 55 },
    tableStart: { y: 75 }
  },
  spacing: {
    sectionGap: 25,
    rowHeight: 20,
    cellPadding: 12,
    marginHorizontal: 20,
    marginVertical: 15
  }
};

export const getPositionEvolutionIndicator = (positionChange: number, previousPosition?: number): string => {
  if (positionChange > 0) {
    return `^ +${positionChange}`;
  } else if (positionChange < 0) {
    return `v ${positionChange}`;
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
    return { fillColor: PDF_STYLES.colors.gold, textColor: [255, 255, 255] };
  } else if (position === 2) {
    return { fillColor: PDF_STYLES.colors.silver, textColor: [255, 255, 255] };
  } else if (position === 3) {
    return { fillColor: PDF_STYLES.colors.bronze, textColor: [255, 255, 255] };
  } else if (position <= 5) {
    return { fillColor: PDF_STYLES.colors.blue, textColor: [255, 255, 255] };
  }
  return null;
};
