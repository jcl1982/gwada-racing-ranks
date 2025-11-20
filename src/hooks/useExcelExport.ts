import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  exportGeneralStandingsToExcel, 
  exportCategoryStandingsToExcel,
  exportAllStandingsToExcel 
} from '@/utils/excel/excelExport';
import { ChampionshipStanding, Race, Driver } from '@/types/championship';

interface CategoryStanding {
  driver: Driver;
  points: number;
  position: number;
  positionChange?: number;
  previousPosition?: number;
}

export const useExcelExport = () => {
  const { toast } = useToast();

  const exportGeneralToExcel = useCallback((
    standings: ChampionshipStanding[],
    championshipTitle: string,
    championshipYear: string
  ) => {
    try {
      exportGeneralStandingsToExcel(standings, championshipTitle, championshipYear);
      toast({
        title: "Export réussi",
        description: "Le classement général a été exporté en Excel.",
      });
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter le classement en Excel.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const exportCategoryToExcel = useCallback((
    standings: CategoryStanding[],
    races: Race[],
    displayTitle: string,
    type: 'montagne' | 'rallye' | 'r2' | 'acceleration' | 'karting'
  ) => {
    try {
      exportCategoryStandingsToExcel(standings, races, displayTitle, type);
      toast({
        title: "Export réussi",
        description: `Le classement ${displayTitle} a été exporté en Excel.`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter le classement en Excel.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const exportAllToExcel = useCallback((
    generalStandings: ChampionshipStanding[],
    montagneStandings: CategoryStanding[],
    rallyeStandings: CategoryStanding[],
    r2Standings: CategoryStanding[],
    kartingStandings: CategoryStanding[],
    accelerationStandings: CategoryStanding[],
    montagneRaces: Race[],
    rallyeRaces: Race[],
    kartingRaces: Race[],
    accelerationRaces: Race[],
    championshipTitle: string,
    championshipYear: string
  ) => {
    try {
      exportAllStandingsToExcel(
        generalStandings,
        montagneStandings,
        rallyeStandings,
        r2Standings,
        kartingStandings,
        accelerationStandings,
        montagneRaces,
        rallyeRaces,
        kartingRaces,
        accelerationRaces,
        championshipTitle,
        championshipYear
      );
      toast({
        title: "Export réussi",
        description: "Tous les classements ont été exportés en Excel.",
      });
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les classements en Excel.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    exportGeneralToExcel,
    exportCategoryToExcel,
    exportAllToExcel
  };
};
