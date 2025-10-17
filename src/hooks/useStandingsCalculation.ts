import { useMemo } from 'react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { 
  calculateChampionshipStandings,
  calculateMontagneStandings,
  calculateRallyeStandings,
  calculateR2Standings,
  calculateCopiloteStandings
} from '@/utils/championship';

export type StandingsType = 'general' | 'montagne' | 'rallye' | 'r2' | 'copilote';

interface UseStandingsCalculationParams {
  drivers: Driver[];
  montagneRaces?: Race[];
  rallyeRaces?: Race[];
  previousStandings?: ChampionshipStanding[];
  championshipId: string;
}

/**
 * Hook centralisé pour calculer tous les types de classements
 * Garantit la cohérence des calculs et la gestion individuelle des championnats
 */
export const useStandingsCalculation = ({
  drivers,
  montagneRaces = [],
  rallyeRaces = [],
  previousStandings,
  championshipId
}: UseStandingsCalculationParams) => {
  
  // Filtrer les pilotes et courses pour ce championnat spécifique
  const championshipDrivers = useMemo(() => 
    drivers.filter(d => d.championshipId === championshipId),
    [drivers, championshipId]
  );

  const championshipMontagneRaces = useMemo(() => 
    montagneRaces.filter(r => r.championshipId === championshipId),
    [montagneRaces, championshipId]
  );

  const championshipRallyeRaces = useMemo(() => 
    rallyeRaces.filter(r => r.championshipId === championshipId),
    [rallyeRaces, championshipId]
  );

  // Filtrer les previousStandings pour ce championnat
  const championshipPreviousStandings = useMemo(() => 
    previousStandings?.filter(s => s.driver.championshipId === championshipId),
    [previousStandings, championshipId]
  );

  // Classement général (Montagne + Rallye)
  const generalStandings = useMemo(() => {
    console.log(`🏆 [useStandingsCalculation] Calcul général pour championnat ${championshipId}:`, {
      drivers: championshipDrivers.length,
      montagneRaces: championshipMontagneRaces.length,
      rallyeRaces: championshipRallyeRaces.length,
      previousStandings: championshipPreviousStandings?.length || 0
    });

    return calculateChampionshipStandings(
      championshipDrivers,
      championshipMontagneRaces,
      championshipRallyeRaces,
      championshipPreviousStandings
    );
  }, [championshipDrivers, championshipMontagneRaces, championshipRallyeRaces, championshipPreviousStandings]);

  // Classement Montagne uniquement
  const montagneStandings = useMemo(() => {
    console.log(`⛰️ [useStandingsCalculation] Calcul Montagne pour championnat ${championshipId}:`, {
      drivers: championshipDrivers.length,
      races: championshipMontagneRaces.length
    });

    return calculateMontagneStandings(
      championshipDrivers,
      championshipMontagneRaces,
      championshipPreviousStandings
    );
  }, [championshipDrivers, championshipMontagneRaces, championshipPreviousStandings]);

  // Classement Rallye uniquement
  const rallyeStandings = useMemo(() => {
    console.log(`🏁 [useStandingsCalculation] Calcul Rallye pour championnat ${championshipId}:`, {
      drivers: championshipDrivers.length,
      races: championshipRallyeRaces.length
    });

    return calculateRallyeStandings(
      championshipDrivers,
      championshipRallyeRaces,
      championshipPreviousStandings
    );
  }, [championshipDrivers, championshipRallyeRaces, championshipPreviousStandings]);

  // Classement R2
  const r2Standings = useMemo(() => {
    console.log(`🏎️ [useStandingsCalculation] Calcul R2 pour championnat ${championshipId}:`, {
      drivers: championshipDrivers.length,
      montagneRaces: championshipMontagneRaces.length,
      rallyeRaces: championshipRallyeRaces.length
    });

    return calculateR2Standings(
      championshipDrivers,
      championshipMontagneRaces,
      championshipRallyeRaces,
      championshipPreviousStandings
    );
  }, [championshipDrivers, championshipMontagneRaces, championshipRallyeRaces, championshipPreviousStandings]);

  // Classement Copilote (Rallye uniquement)
  const copiloteStandings = useMemo(() => {
    console.log(`👥 [useStandingsCalculation] Calcul Copilote pour championnat ${championshipId}:`, {
      drivers: championshipDrivers.length,
      rallyeRaces: championshipRallyeRaces.length
    });

    return calculateCopiloteStandings(
      championshipDrivers,
      championshipRallyeRaces,
      championshipPreviousStandings
    );
  }, [championshipDrivers, championshipRallyeRaces, championshipPreviousStandings]);

  return {
    generalStandings,
    montagneStandings,
    rallyeStandings,
    r2Standings,
    copiloteStandings
  };
};
