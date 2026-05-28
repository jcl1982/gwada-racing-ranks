import { useMemo } from 'react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { 
  calculateChampionshipStandings,
  calculateMontagneStandings,
  calculateRallyeStandings,
  calculateR2Standings,
  calculateCopiloteStandings,
} from '@/utils/championship';
import { useVmrsStandings, VmrsStanding, VmrsDriverInfo } from '@/hooks/useVmrsStandings';

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
  drivers: Driver[],
  vmrsDrivers: VmrsDriverInfo[] = []
): ChampionshipStanding[] => {
  return vmrsStandings.map(vs => {
    const driver = drivers.find(d => d.id === vs.driverId);
    const vmrsDriver = vmrsDrivers.find(d => d.id === vs.driverId);
    const merged: Driver = driver
      ? { ...driver, carModel: driver.carModel || vmrsDriver?.carModel, number: driver.number ?? vmrsDriver?.number }
      : {
          id: vs.driverId,
          name: vmrsDriver?.name || vs.driverName,
          number: vmrsDriver?.number,
          carModel: vmrsDriver?.carModel,
          driverRole: vmrsDriver?.driverRole || vs.driverRole,
          championshipId: vmrsDriver?.championshipId,
        } as Driver;
    return {
      driver: merged,
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
  const {
    piloteStandings: vmrsPiloteData,
    copiloteStandings: vmrsCopiloteData,
    piloteByMoyenne,
    copiloteByMoyenne,
    byType: vmrsByTypeRaw,
    vmrsDrivers,
  } = useVmrsStandings(championshipId || undefined);

  const vmrsStandings = useMemo(() =>
    convertVmrsToChampionshipStandings(vmrsPiloteData, championshipDrivers, vmrsDrivers),
    [vmrsPiloteData, championshipDrivers, vmrsDrivers]
  );

  const vmrsCopiloteStandings = useMemo(() =>
    convertVmrsToChampionshipStandings(vmrsCopiloteData, championshipDrivers, vmrsDrivers),
    [vmrsCopiloteData, championshipDrivers, vmrsDrivers]
  );

  const vmrsPiloteHaute = useMemo(() => convertVmrsToChampionshipStandings(piloteByMoyenne.haute, championshipDrivers, vmrsDrivers), [piloteByMoyenne.haute, championshipDrivers, vmrsDrivers]);
  const vmrsPiloteIntermediaire = useMemo(() => convertVmrsToChampionshipStandings(piloteByMoyenne.intermediaire, championshipDrivers, vmrsDrivers), [piloteByMoyenne.intermediaire, championshipDrivers, vmrsDrivers]);
  const vmrsPiloteBasse = useMemo(() => convertVmrsToChampionshipStandings(piloteByMoyenne.basse, championshipDrivers, vmrsDrivers), [piloteByMoyenne.basse, championshipDrivers, vmrsDrivers]);
  const vmrsCopiloteHaute = useMemo(() => convertVmrsToChampionshipStandings(copiloteByMoyenne.haute, championshipDrivers, vmrsDrivers), [copiloteByMoyenne.haute, championshipDrivers, vmrsDrivers]);
  const vmrsCopiloteIntermediaire = useMemo(() => convertVmrsToChampionshipStandings(copiloteByMoyenne.intermediaire, championshipDrivers, vmrsDrivers), [copiloteByMoyenne.intermediaire, championshipDrivers, vmrsDrivers]);
  const vmrsCopiloteBasse = useMemo(() => convertVmrsToChampionshipStandings(copiloteByMoyenne.basse, championshipDrivers, vmrsDrivers), [copiloteByMoyenne.basse, championshipDrivers, vmrsDrivers]);

  // Per-race-type (montagne / rallye) converted standings
  const vmrsByType = useMemo(() => {
    const buildBucket = (bucket: typeof vmrsByTypeRaw.montagne) => ({
      piloteByMoyenne: {
        haute: convertVmrsToChampionshipStandings(bucket.piloteByMoyenne.haute, championshipDrivers, vmrsDrivers),
        intermediaire: convertVmrsToChampionshipStandings(bucket.piloteByMoyenne.intermediaire, championshipDrivers, vmrsDrivers),
        basse: convertVmrsToChampionshipStandings(bucket.piloteByMoyenne.basse, championshipDrivers, vmrsDrivers),
      },
      copiloteByMoyenne: {
        haute: convertVmrsToChampionshipStandings(bucket.copiloteByMoyenne.haute, championshipDrivers, vmrsDrivers),
        intermediaire: convertVmrsToChampionshipStandings(bucket.copiloteByMoyenne.intermediaire, championshipDrivers, vmrsDrivers),
        basse: convertVmrsToChampionshipStandings(bucket.copiloteByMoyenne.basse, championshipDrivers, vmrsDrivers),
      },
      raceIds: bucket.raceIds,
      races: bucket.races,
    });
    return {
      montagne: buildBucket(vmrsByTypeRaw.montagne),
      rallye: buildBucket(vmrsByTypeRaw.rallye),
    };
  }, [vmrsByTypeRaw, championshipDrivers, vmrsDrivers]);

  return {
    generalStandings,
    montagneStandings,
    rallyeStandings,
    r2Standings,
    copiloteStandings,
    vmrsStandings,
    vmrsCopiloteStandings,
    vmrsPiloteHaute,
    vmrsPiloteIntermediaire,
    vmrsPiloteBasse,
    vmrsCopiloteHaute,
    vmrsCopiloteIntermediaire,
    vmrsCopiloteBasse,
    vmrsByType,
  };
};
