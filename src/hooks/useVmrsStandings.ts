
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type VmrsMoyenne = 'haute' | 'intermediaire' | 'basse';

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

export const useVmrsStandings = (championshipId?: string) => {
  const [standings, setStandings] = useState<VmrsStanding[]>([]);
  const [piloteStandings, setPiloteStandings] = useState<VmrsStanding[]>([]);
  const [copiloteStandings, setCopiloteStandings] = useState<VmrsStanding[]>([]);
  const [piloteByMoyenne, setPiloteByMoyenne] = useState<Record<VmrsMoyenne, VmrsStanding[]>>(EMPTY_BY_MOYENNE);
  const [copiloteByMoyenne, setCopiloteByMoyenne] = useState<Record<VmrsMoyenne, VmrsStanding[]>>(EMPTY_BY_MOYENNE);
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

      const { data: drivers } = await supabase
        .from('drivers')
        .select('id, name, driver_role')
        .eq('championship_id', championshipId)
        .eq('scope', 'vmrs');

      if (!results || !drivers) {
        setStandings([]);
        setPiloteStandings([]);
        setCopiloteStandings([]);
        setPiloteByMoyenne(EMPTY_BY_MOYENNE);
        setCopiloteByMoyenne(EMPTY_BY_MOYENNE);
        return;
      }

      const driverMap = new Map(drivers.map((d: any) => [d.id, { name: d.name, role: d.driver_role }]));

      // Aggregate by (driver_id, moyenne)
      const aggregated = new Map<string, {
        driverId: string;
        driverName: string;
        driverRole: 'pilote' | 'copilote';
        moyenne: VmrsMoyenne;
        participationTotal: number;
        classificationTotal: number;
        bonusTotal: number;
        racesCount: number;
      }>();

      (results as any[]).forEach((r: any) => {
        const driver = driverMap.get(r.driver_id);
        if (!driver) return;
        const moyenne = (r.moyenne as VmrsMoyenne) || 'haute';
        const key = `${r.driver_id}::${moyenne}`;

        const existing = aggregated.get(key) || {
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
        aggregated.set(key, existing);
      });

      const allStandings: VmrsStanding[] = Array.from(aggregated.values())
        .map(d => ({
          ...d,
          totalPoints: d.participationTotal + d.classificationTotal + d.bonusTotal,
          position: 0,
        }));

      // Helper to rank a list
      const rank = (list: VmrsStanding[]) =>
        [...list]
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((s, i) => ({ ...s, position: i + 1 }));

      const moyennes: VmrsMoyenne[] = ['haute', 'intermediaire', 'basse'];
      const pByM = { haute: [], intermediaire: [], basse: [] } as Record<VmrsMoyenne, VmrsStanding[]>;
      const cByM = { haute: [], intermediaire: [], basse: [] } as Record<VmrsMoyenne, VmrsStanding[]>;

      moyennes.forEach(m => {
        pByM[m] = rank(allStandings.filter(s => s.driverRole === 'pilote' && s.moyenne === m));
        cByM[m] = rank(allStandings.filter(s => s.driverRole === 'copilote' && s.moyenne === m));
      });

      setPiloteByMoyenne(pByM);
      setCopiloteByMoyenne(cByM);

      // Backward-compatible union (all moyennes combined, ranked globally)
      setStandings(rank(allStandings));
      setPiloteStandings(rank(allStandings.filter(s => s.driverRole === 'pilote')));
      setCopiloteStandings(rank(allStandings.filter(s => s.driverRole === 'copilote')));
    } catch (err) {
      console.error('Erreur chargement classement VMRS:', err);
    } finally {
      setIsLoading(false);
    }
  }, [championshipId]);

  useEffect(() => {
    loadStandings();
  }, [loadStandings]);

  return {
    standings,
    piloteStandings,
    copiloteStandings,
    piloteByMoyenne,
    copiloteByMoyenne,
    isLoading,
    refreshStandings: loadStandings,
  };
};
