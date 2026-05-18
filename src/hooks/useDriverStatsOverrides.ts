import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type StatsStandingType = 'montagne' | 'rallye';

export interface DriverStatsOverride {
  driver_id: string;
  victories: number | null;
  podiums: number | null;
}

export const useDriverStatsOverrides = (
  championshipId: string | undefined,
  standingType: StatsStandingType | undefined,
) => {
  const [overrides, setOverrides] = useState<Map<string, DriverStatsOverride>>(new Map());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!championshipId || !standingType) {
      setOverrides(new Map());
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('driver_stats_overrides')
      .select('driver_id, victories, podiums')
      .eq('championship_id', championshipId)
      .eq('standing_type', standingType);
    if (error) {
      console.error('useDriverStatsOverrides:', error);
      setLoading(false);
      return;
    }
    const m = new Map<string, DriverStatsOverride>();
    (data || []).forEach((r: any) => m.set(r.driver_id, r));
    setOverrides(m);
    setLoading(false);
  }, [championshipId, standingType]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upsertOverride = useCallback(
    async (driverId: string, victories: number | null, podiums: number | null) => {
      if (!championshipId || !standingType) return;
      // If both null/undefined => delete
      if ((victories === null || Number.isNaN(victories)) && (podiums === null || Number.isNaN(podiums))) {
        const { error } = await supabase
          .from('driver_stats_overrides')
          .delete()
          .eq('championship_id', championshipId)
          .eq('standing_type', standingType)
          .eq('driver_id', driverId);
        if (error) {
          toast.error('Erreur lors de la suppression');
          return;
        }
      } else {
        const { error } = await supabase
          .from('driver_stats_overrides')
          .upsert(
            {
              championship_id: championshipId,
              driver_id: driverId,
              standing_type: standingType,
              victories: Number.isFinite(victories as number) ? victories : null,
              podiums: Number.isFinite(podiums as number) ? podiums : null,
            },
            { onConflict: 'championship_id,driver_id,standing_type' },
          );
        if (error) {
          toast.error('Erreur lors de la sauvegarde');
          return;
        }
      }
      await refresh();
      toast.success('Statistiques mises à jour');
    },
    [championshipId, standingType, refresh],
  );

  return { overrides, loading, refresh, upsertOverride };
};
