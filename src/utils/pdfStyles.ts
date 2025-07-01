
export const PDF_STYLES = {
  colors: {
    headerBlue: [41, 128, 185] as [number, number, number],
    lightGray: [245, 245, 245] as [number, number, number],
    green: [34, 139, 34] as [number, number, number],
    red: [220, 20, 60] as [number, number, number],
    orange: [255, 140, 0] as [number, number, number],
    gray: [128, 128, 128] as [number, number, number],
    gold: [255, 215, 0] as [number, number, number],
    silver: [192, 192, 192] as [number, number, number],
    bronze: [205, 127, 50] as [number, number, number],
    lightGreen: [144, 238, 144] as [number, number, number]
  },
  fonts: {
    titleSize: 18,
    subtitleSize: 14,
    normalSize: 10,
    smallSize: 8,
    legendSize: 8
  },
  positions: {
    logoLeft: { x: 15, y: 10, width: 35, height: 15 },
    logoRight: { x: 150, y: 10, width: 40, height: 15 },
    logoRightLandscape: { x: 240 },
    title: { y: 35 },
    subtitle: { y: 45 },
    tableStart: { y: 55 }
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
