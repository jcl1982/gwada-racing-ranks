import { useMemo } from 'react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { 
  calculateChampionshipStandings,
  calculateMontagneStandings,
  calculateRallyeStandings,
  calculateC2R2Standings
} from '@/utils/championship';

export type StandingsType = 'general' | 'montagne' | 'rallye' | 'c2r2';

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

  // Classement C2 R2
  const c2r2Standings = useMemo(() => {
    console.log(`🏎️ [useStandingsCalculation] Calcul C2 R2 pour championnat ${championshipId}:`, {
      drivers: championshipDrivers.length,
      montagneRaces: championshipMontagneRaces.length,
      rallyeRaces: championshipRallyeRaces.length
    });

    return calculateC2R2Standings(
      championshipDrivers,
      championshipMontagneRaces,
      championshipRallyeRaces,
      championshipPreviousStandings
    );
  }, [championshipDrivers, championshipMontagneRaces, championshipRallyeRaces, championshipPreviousStandings]);

  return {
    generalStandings,
    montagneStandings,
    rallyeStandings,
    c2r2Standings
  };
};
