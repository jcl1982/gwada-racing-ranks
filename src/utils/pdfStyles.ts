
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
    lightGreen: [144, 238, 144] as [number, number, number],
    darkBlue: [25, 25, 112] as [number, number, number],
    lightBlue: [173, 216, 230] as [number, number, number],
    champagne: [247, 231, 206] as [number, number, number]
  },
  fonts: {
    titleSize: 20,
    subtitleSize: 16,
    normalSize: 11,
    smallSize: 9,
    legendSize: 9
  },
  positions: {
    logoLeft: { x: 15, y: 10, width: 25, height: 25 },
    logoRight: { x: 160, y: 10, width: 25, height: 25 },
    logoRightLandscape: { x: 250 },
    title: { y: 35 },
    subtitle: { y: 45 },
    tableStart: { y: 60 }
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
