
export const PDF_STYLES = {
  colors: {
    // Couleurs principales du site (converties en RGB)
    primary: [58, 131, 255] as [number, number, number], // hsl(220 91% 52%) -> bleu principal
    secondary: [255, 206, 84] as [number, number, number], // hsl(45 93% 47%) -> jaune secondaire
    accent: [239, 68, 68] as [number, number, number], // hsl(0 84% 60%) -> rouge accent
    
    // Dégradés Caribbean (bleu -> jaune -> rouge)
    gradientBlue: [59, 130, 246] as [number, number, number], // blue-500
    gradientYellow: [245, 158, 11] as [number, number, number], // yellow-500
    gradientRed: [239, 68, 68] as [number, number, number], // red-500
    
    // Dégradé Ocean (bleu -> cyan)
    oceanBlue: [37, 99, 235] as [number, number, number], // blue-600
    oceanCyan: [6, 182, 212] as [number, number, number], // cyan-500
    
    // Couleurs de fond du site
    backgroundLight: [239, 245, 255] as [number, number, number], // blue-50
    backgroundYellow: [254, 252, 232] as [number, number, number], // yellow-50
    backgroundRed: [254, 242, 242] as [number, number, number], // red-50
    
    // Couleurs card-glass
    cardGlass: [255, 255, 255] as [number, number, number], // bg-white/90
    cardBorder: [255, 255, 255] as [number, number, number], // border-white/20
    
    // Couleurs de podium avec style moderne
    gold: [245, 158, 11] as [number, number, number], // yellow-500 (style site)
    silver: [148, 163, 184] as [number, number, number], // slate-400
    bronze: [194, 120, 3] as [number, number, number], // yellow-700
    
    // Couleurs d'état modernes
    success: [34, 197, 94] as [number, number, number], // green-500
    warning: [245, 158, 11] as [number, number, number], // yellow-500
    danger: [239, 68, 68] as [number, number, number], // red-500
    
    // Couleurs neutres modernes
    gray50: [248, 250, 252] as [number, number, number],
    gray100: [241, 245, 249] as [number, number, number],
    gray200: [226, 232, 240] as [number, number, number],
    gray600: [71, 85, 105] as [number, number, number],
    gray900: [15, 23, 42] as [number, number, number],
    
    // Couleurs spécifiques aux badges du site
    greenBadge: [220, 252, 231] as [number, number, number], // green-50
    greenBorder: [187, 247, 208] as [number, number, number], // green-200
    blueBadge: [219, 234, 254] as [number, number, number], // blue-50
    blueBorder: [147, 197, 253] as [number, number, number] // blue-300
  },
  fonts: {
    titleSize: 24, // Plus grand comme sur le site
    subtitleSize: 20,
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
    rowHeight: 14,
    cellPadding: 8,
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
    return { fillColor: PDF_STYLES.colors.gold, textColor: [255, 255, 255] };
  } else if (position === 2) {
    return { fillColor: PDF_STYLES.colors.silver, textColor: [255, 255, 255] };
  } else if (position === 3) {
    return { fillColor: PDF_STYLES.colors.bronze, textColor: [255, 255, 255] };
  } else if (position <= 5) {
    return { fillColor: PDF_STYLES.colors.blueBadge, textColor: [0, 0, 0] };
  }
  return null;
};
