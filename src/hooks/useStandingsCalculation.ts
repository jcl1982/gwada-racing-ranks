import { useMemo } from 'react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { 
  calculateChampionshipStandings,
  calculateMontagneStandings,
  calculateRallyeStandings,
  calculateR2Standings,
  calculateCopiloteStandings,
} from '@/utils/championship';
import { useVmrsStandings, VmrsStanding } from '@/hooks/useVmrsStandings';

export type StandingsType = 'general' | 'montagne' | 'rallye' | 'r2' | 'copilote' | 'vmrs' | 'vmrs_copilote';

interface UseStandingsCalculationParams {
  drivers: Driver[];
  montagneRaces?: Race[];
  rallyeRaces?: Race[];
  previousStandings?: ChampionshipStanding[];
  championshipId: string;
}

const convertVmrsToChampionshipStandings = (
  vmrsStandings: VmrsStanding[],
  drivers: Driver[]
): ChampionshipStanding[] => {
  return vmrsStandings.map(vs => {
    const driver = drivers.find(d => d.id === vs.driverId);
    return {
      driver: driver || { id: vs.driverId, name: vs.driverName },
      montagnePoints: 0,
      rallyePoints: vs.totalPoints,
      totalPoints: vs.totalPoints,
      position: vs.position,
      positionChange: 0,
    };
  });
};

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

  // VMRS standings from dedicated vmrs_results table
  const { piloteStandings: vmrsPiloteData, copiloteStandings: vmrsCopiloteData } = useVmrsStandings(championshipId || undefined);

  const vmrsStandings = useMemo(() => 
    convertVmrsToChampionshipStandings(vmrsPiloteData, championshipDrivers),
    [vmrsPiloteData, championshipDrivers]
  );

  const vmrsCopiloteStandings = useMemo(() => 
    convertVmrsToChampionshipStandings(vmrsCopiloteData, championshipDrivers),
    [vmrsCopiloteData, championshipDrivers]
  );

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
