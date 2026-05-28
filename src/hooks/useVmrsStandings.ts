
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type VmrsMoyenne = 'haute' | 'intermediaire' | 'basse';
export type VmrsRaceType = 'montagne' | 'rallye';

export interface VmrsStanding {
  driverId: string;
  driverName: string;
  driverRole: 'pilote' | 'copilote';
  moyenne: VmrsMoyenne;
  totalPoints: number;
  participationTotal: number;
  classificationTotal: number;
  bonusTotal: number;
  racesCount: number;
  position: number;
}

const EMPTY_BY_MOYENNE = {
  haute: [] as VmrsStanding[],
  intermediaire: [] as VmrsStanding[],
  basse: [] as VmrsStanding[],
};

export interface VmrsRaceInfo {
  id: string;
  name: string;
  date: string;
  endDate?: string;
  type: VmrsRaceType;
  organizer?: string;
  raceLevel?: 'national' | 'regional';
  results: any[];
}

export interface VmrsByTypeBucket {
  piloteByMoyenne: Record<VmrsMoyenne, VmrsStanding[]>;
  copiloteByMoyenne: Record<VmrsMoyenne, VmrsStanding[]>;
  raceIds: Set<string>;
  races: VmrsRaceInfo[];
}

const emptyBucket = (): VmrsByTypeBucket => ({
  piloteByMoyenne: { ...EMPTY_BY_MOYENNE },
  copiloteByMoyenne: { ...EMPTY_BY_MOYENNE },
  raceIds: new Set<string>(),
  races: [],
});

export const useVmrsStandings = (championshipId?: string) => {
  const [standings, setStandings] = useState<VmrsStanding[]>([]);
  const [piloteStandings, setPiloteStandings] = useState<VmrsStanding[]>([]);
  const [copiloteStandings, setCopiloteStandings] = useState<VmrsStanding[]>([]);
  const [piloteByMoyenne, setPiloteByMoyenne] = useState<Record<VmrsMoyenne, VmrsStanding[]>>(EMPTY_BY_MOYENNE);
  const [copiloteByMoyenne, setCopiloteByMoyenne] = useState<Record<VmrsMoyenne, VmrsStanding[]>>(EMPTY_BY_MOYENNE);
  const [byType, setByType] = useState<Record<VmrsRaceType, VmrsByTypeBucket>>({
    montagne: emptyBucket(),
    rallye: emptyBucket(),
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadStandings = useCallback(async () => {
    if (!championshipId) return;
    setIsLoading(true);

    try {
      const { data: results, error } = await supabase
        .from('vmrs_results')
        .select('*')
        .eq('championship_id', championshipId);

      if (error) throw error;

      // Collect race IDs referenced by results so we can fetch race details
      // regardless of which championship the race was originally created in.
      const resultRaceIds = Array.from(new Set((results || []).map((r: any) => r.race_id).filter(Boolean)));

      const [{ data: drivers }, { data: races }] = await Promise.all([
        supabase
          .from('drivers')
          .select('id, name, driver_role')
          .eq('championship_id', championshipId)
          .eq('scope', 'vmrs'),
        resultRaceIds.length > 0
          ? supabase
              .from('races')
              .select('id, name, date, end_date, type, organizer, race_level')
              .in('id', resultRaceIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      if (!results || !drivers) {
        setStandings([]);
        setPiloteStandings([]);
        setCopiloteStandings([]);
        setPiloteByMoyenne(EMPTY_BY_MOYENNE);
        setCopiloteByMoyenne(EMPTY_BY_MOYENNE);
        setByType({ montagne: emptyBucket(), rallye: emptyBucket() });
        return;
      }

      const driverMap = new Map(drivers.map((d: any) => [d.id, { name: d.name, role: d.driver_role }]));
      const raceTypeMap = new Map<string, VmrsRaceType>(
        (races || [])
          .filter((r: any) => r.type === 'montagne' || r.type === 'rallye')
          .map((r: any) => [r.id, r.type as VmrsRaceType])
      );
      const raceInfoMap = new Map<string, VmrsRaceInfo>(
        (races || [])
          .filter((r: any) => r.type === 'montagne' || r.type === 'rallye')
          .map((r: any) => [r.id, {
            id: r.id,
            name: r.name,
            date: r.date,
            endDate: r.end_date || undefined,
            type: r.type as VmrsRaceType,
            organizer: r.organizer || undefined,
            raceLevel: r.race_level || undefined,
            results: [],
          }])
      );

      // Helper: aggregate a set of results by (driver_id, moyenne)
      const aggregate = (rows: any[]) => {
        const map = new Map<string, {
          driverId: string;
          driverName: string;
          driverRole: 'pilote' | 'copilote';
          moyenne: VmrsMoyenne;
          participationTotal: number;
          classificationTotal: number;
          bonusTotal: number;
          racesCount: number;
        }>();
        rows.forEach((r: any) => {
          const driver = driverMap.get(r.driver_id);
          if (!driver) return;
          const moyenne = (r.moyenne as VmrsMoyenne) || 'haute';
          const key = `${r.driver_id}::${moyenne}`;
          const existing = map.get(key) || {
            driverId: r.driver_id,
            driverName: driver.name,
            driverRole: driver.role as 'pilote' | 'copilote',
            moyenne,
            participationTotal: 0,
            classificationTotal: 0,
            bonusTotal: 0,
            racesCount: 0,
          };
          existing.participationTotal += r.participation_points || 0;
          existing.classificationTotal += r.dnf ? 0 : (r.classification_points || 0);
          existing.bonusTotal += r.bonus_points || 0;
          existing.racesCount += 1;
          map.set(key, existing);
        });
        return Array.from(map.values()).map(d => ({
          ...d,
          totalPoints: d.participationTotal + d.classificationTotal + d.bonusTotal,
          position: 0,
        })) as VmrsStanding[];
      };

      const rank = (list: VmrsStanding[]) =>
        [...list]
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((s, i) => ({ ...s, position: i + 1 }));

      const moyennes: VmrsMoyenne[] = ['haute', 'intermediaire', 'basse'];

      // Global (all race types) standings — backward compatibility
      const allAgg = aggregate(results as any[]);
      const pByM = { haute: [], intermediaire: [], basse: [] } as Record<VmrsMoyenne, VmrsStanding[]>;
      const cByM = { haute: [], intermediaire: [], basse: [] } as Record<VmrsMoyenne, VmrsStanding[]>;
      moyennes.forEach(m => {
        pByM[m] = rank(allAgg.filter(s => s.driverRole === 'pilote' && s.moyenne === m));
        cByM[m] = rank(allAgg.filter(s => s.driverRole === 'copilote' && s.moyenne === m));
      });
      setPiloteByMoyenne(pByM);
      setCopiloteByMoyenne(cByM);
      setStandings(rank(allAgg));
      setPiloteStandings(rank(allAgg.filter(s => s.driverRole === 'pilote')));
      setCopiloteStandings(rank(allAgg.filter(s => s.driverRole === 'copilote')));

      // Per-race-type standings
      const newByType: Record<VmrsRaceType, VmrsByTypeBucket> = {
        montagne: emptyBucket(),
        rallye: emptyBucket(),
      };
      (['montagne', 'rallye'] as VmrsRaceType[]).forEach(type => {
        const typeResults = (results as any[]).filter(r => raceTypeMap.get(r.race_id) === type);
        typeResults.forEach(r => newByType[type].raceIds.add(r.race_id));
        newByType[type].races = Array.from(newByType[type].raceIds)
          .map(id => raceInfoMap.get(id))
          .filter((r): r is VmrsRaceInfo => !!r)
          .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        const agg = aggregate(typeResults);
        moyennes.forEach(m => {
          newByType[type].piloteByMoyenne[m] = rank(agg.filter(s => s.driverRole === 'pilote' && s.moyenne === m));
          newByType[type].copiloteByMoyenne[m] = rank(agg.filter(s => s.driverRole === 'copilote' && s.moyenne === m));
        });
      });
      setByType(newByType);
    } catch (err) {
      console.error('Erreur chargement classement VMRS:', err);
    } finally {
      setIsLoading(false);
    }
  }, [championshipId]);

  useEffect(() => {
    loadStandings();
    if (!championshipId) return;
    const channel = supabase
      .channel(`vmrs_results_${championshipId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vmrs_results', filter: `championship_id=eq.${championshipId}` },
        () => loadStandings()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'races', filter: `championship_id=eq.${championshipId}` },
        () => loadStandings()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadStandings, championshipId]);

  return {
    standings,
    piloteStandings,
    copiloteStandings,
    piloteByMoyenne,
    copiloteByMoyenne,
    byType,
    isLoading,
    refreshStandings: loadStandings,
  };
};
