
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VmrsStanding {
  driverId: string;
  driverName: string;
  driverRole: 'pilote' | 'copilote';
  totalPoints: number;
  participationTotal: number;
  classificationTotal: number;
  bonusTotal: number;
  racesCount: number;
  position: number;
}

export const useVmrsStandings = (championshipId?: string) => {
  const [standings, setStandings] = useState<VmrsStanding[]>([]);
  const [piloteStandings, setPiloteStandings] = useState<VmrsStanding[]>([]);
  const [copiloteStandings, setCopiloteStandings] = useState<VmrsStanding[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadStandings = useCallback(async () => {
    if (!championshipId) return;
    setIsLoading(true);

    try {
      // Load vmrs_results with driver info
      const { data: results, error } = await supabase
        .from('vmrs_results')
        .select('*')
        .eq('championship_id', championshipId);

      if (error) throw error;

      // Load drivers
      const { data: drivers } = await supabase
        .from('drivers')
        .select('id, name, driver_role')
        .eq('championship_id', championshipId);

      if (!results || !drivers) {
        setStandings([]);
        setPiloteStandings([]);
        setCopiloteStandings([]);
        return;
      }

      const driverMap = new Map(drivers.map((d: any) => [d.id, { name: d.name, role: d.driver_role }]));

      // Aggregate by driver
      const aggregated = new Map<string, {
        driverName: string;
        driverRole: 'pilote' | 'copilote';
        participationTotal: number;
        classificationTotal: number;
        bonusTotal: number;
        racesCount: number;
      }>();

      (results as any[]).forEach((r: any) => {
        const driver = driverMap.get(r.driver_id);
        if (!driver) return;

        const existing = aggregated.get(r.driver_id) || {
          driverName: driver.name,
          driverRole: driver.role as 'pilote' | 'copilote',
          participationTotal: 0,
          classificationTotal: 0,
          bonusTotal: 0,
          racesCount: 0,
        };

        existing.participationTotal += r.participation_points || 0;
        existing.classificationTotal += r.dnf ? 0 : (r.classification_points || 0);
        existing.bonusTotal += r.bonus_points || 0;
        existing.racesCount += 1;
        aggregated.set(r.driver_id, existing);
      });

      // Build standings
      const allStandings: VmrsStanding[] = Array.from(aggregated.entries())
        .map(([driverId, data]) => ({
          driverId,
          ...data,
          totalPoints: data.participationTotal + data.classificationTotal + data.bonusTotal,
          position: 0,
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((s, i) => ({ ...s, position: i + 1 }));

      setStandings(allStandings);

      const pilotes = allStandings.filter(s => s.driverRole === 'pilote')
        .map((s, i) => ({ ...s, position: i + 1 }));
      const copilotes = allStandings.filter(s => s.driverRole === 'copilote')
        .map((s, i) => ({ ...s, position: i + 1 }));

      setPiloteStandings(pilotes);
      setCopiloteStandings(copilotes);
    } catch (err) {
      console.error('Erreur chargement classement VMRS:', err);
    } finally {
      setIsLoading(false);
    }
  }, [championshipId]);

  useEffect(() => {
    loadStandings();
  }, [loadStandings]);

  return { standings, piloteStandings, copiloteStandings, isLoading, refreshStandings: loadStandings };
};
