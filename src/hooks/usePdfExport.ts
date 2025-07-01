
import { useCallback } from 'react';
import { ChampionshipStanding, Race, Driver } from '@/types/championship';
import { generateGeneralStandingsPdf } from '@/utils/pdfGeneralStandings';
import { generateCategoryStandingsPdf } from '@/utils/pdfCategoryStandings';

export const usePdfExport = () => {
  const exportGeneralStandings = useCallback(async (
    standings: ChampionshipStanding[],
    championshipTitle: string,
    championshipYear: string
  ) => {
    await generateGeneralStandingsPdf(standings, championshipTitle, championshipYear);
  }, []);

  const exportCategoryStandings = useCallback(async (
    title: string,
    races: Race[],
    drivers: Driver[],
    championshipYear: string
  ) => {
    await generateCategoryStandingsPdf(title, races, drivers, championshipYear);
  }, []);

  return {
    exportGeneralStandings,
    exportCategoryStandings
  };
};
