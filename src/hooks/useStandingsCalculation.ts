import { useMemo } from 'react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { 
  calculateChampionshipStandings,
  calculateMontagneStandings,
  calculateRallyeStandings,
  calculateR2Standings,
  calculateCopiloteStandings,
  calculateVmrsStandings,
  calculateVmrsCopiloteStandings
} from '@/utils/championship';

export type StandingsType = 'general' | 'montagne' | 'rallye' | 'r2' | 'copilote' | 'vmrs' | 'vmrs_copilote';

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

  const championshipPreviousStandings = useMemo(() => 
    previousStandings?.filter(s => s.driver.championshipId === championshipId),
    [previousStandings, championshipId]
  );

  const generalStandings = useMemo(() => {
    return calculateChampionshipStandings(
      championshipDrivers,
      championshipMontagneRaces,
      championshipRallyeRaces,
      championshipPreviousStandings
    );
  }, [championshipDrivers, championshipMontagneRaces, championshipRallyeRaces, championshipPreviousStandings]);

  const montagneStandings = useMemo(() => {
    return calculateMontagneStandings(
      championshipDrivers,
      championshipMontagneRaces,
      championshipPreviousStandings
    );
  }, [championshipDrivers, championshipMontagneRaces, championshipPreviousStandings]);

  const rallyeStandings = useMemo(() => {
    return calculateRallyeStandings(
      championshipDrivers,
      championshipRallyeRaces,
      championshipPreviousStandings
    );
  }, [championshipDrivers, championshipRallyeRaces, championshipPreviousStandings]);

  const r2Standings = useMemo(() => {
    return calculateR2Standings(
      championshipDrivers,
      championshipMontagneRaces,
      championshipRallyeRaces,
      championshipPreviousStandings
    );
  }, [championshipDrivers, championshipMontagneRaces, championshipRallyeRaces, championshipPreviousStandings]);

  const copiloteStandings = useMemo(() => {
    return calculateCopiloteStandings(
      championshipDrivers,
      championshipRallyeRaces,
      championshipPreviousStandings
    );
  }, [championshipDrivers, championshipRallyeRaces, championshipPreviousStandings]);

  // Classement VMRS Pilotes
  const vmrsStandings = useMemo(() => {
    return calculateVmrsStandings(
      championshipDrivers,
      championshipRallyeRaces,
      championshipPreviousStandings
    );
  }, [championshipDrivers, championshipRallyeRaces, championshipPreviousStandings]);

  // Classement VMRS Copilotes
  const vmrsCopiloteStandings = useMemo(() => {
    return calculateVmrsCopiloteStandings(
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
    copiloteStandings,
    vmrsStandings,
    vmrsCopiloteStandings
  };
};
