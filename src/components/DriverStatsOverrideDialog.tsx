import { useState, useMemo, useEffect } from 'react';
import { Driver } from '@/types/championship';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Save } from 'lucide-react';
import { useDriverStatsOverrides, StatsStandingType } from '@/hooks/useDriverStatsOverrides';

interface Props {
  championshipId: string;
  standingType: StatsStandingType;
  drivers: Driver[];
  computed: Map<string, { victories: number; podiums: number }>;
}

const DriverStatsOverrideDialog = ({ championshipId, standingType, drivers, computed }: Props) => {
  const [open, setOpen] = useState(false);
  const { overrides, upsertOverride } = useDriverStatsOverrides(championshipId, standingType);
  const [edits, setEdits] = useState<Record<string, { v: string; p: string }>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    const init: Record<string, { v: string; p: string }> = {};
    drivers.forEach((d) => {
      const o = overrides.get(d.id);
      const c = computed.get(d.id);
      init[d.id] = {
        v: o?.victories != null ? String(o.victories) : c ? String(c.victories) : '',
        p: o?.podiums != null ? String(o.podiums) : c ? String(c.podiums) : '',
      };
    });
    setEdits(init);
  }, [open, drivers, overrides, computed]);

  const filtered = useMemo(
    () => drivers.filter((d) => d.name.toLowerCase().includes(search.toLowerCase())),
    [drivers, search],
  );

  const handleSave = async (driverId: string) => {
    const e = edits[driverId];
    const v = e?.v === '' ? null : parseInt(e?.v ?? '', 10);
    const p = e?.p === '' ? null : parseInt(e?.p ?? '', 10);
    await upsertOverride(driverId, v, p);
  };

  const handleReset = async (driverId: string) => {
    await upsertOverride(driverId, null, null);
    setEdits((prev) => {
      const c = computed.get(driverId);
      return {
        ...prev,
        [driverId]: { v: c ? String(c.victories) : '', p: c ? String(c.podiums) : '' },
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="no-export no-print">
          <Pencil size={14} className="mr-1" />
          Corriger V/P
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Corriger les victoires et podiums</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Rechercher un pilote..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium px-2">
            <div className="col-span-5">Pilote</div>
            <div className="col-span-2 text-center">Victoires</div>
            <div className="col-span-2 text-center">Podiums</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>
          {filtered.map((d) => {
            const o = overrides.get(d.id);
            const isOverridden = !!o && (o.victories != null || o.podiums != null);
            return (
              <div
                key={d.id}
                className={`grid grid-cols-12 gap-2 items-center p-2 rounded border ${
                  isOverridden ? 'border-primary/40 bg-primary/5' : 'border-border'
                }`}
              >
                <div className="col-span-5 text-sm text-foreground truncate">{d.name}</div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min={0}
                    value={edits[d.id]?.v ?? ''}
                    onChange={(e) =>
                      setEdits((prev) => ({ ...prev, [d.id]: { ...prev[d.id], v: e.target.value } }))
                    }
                    className="h-8 text-center"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min={0}
                    value={edits[d.id]?.p ?? ''}
                    onChange={(e) =>
                      setEdits((prev) => ({ ...prev, [d.id]: { ...prev[d.id], p: e.target.value } }))
                    }
                    className="h-8 text-center"
                  />
                </div>
                <div className="col-span-3 flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleSave(d.id)}>
                    <Save size={14} />
                  </Button>
                  {isOverridden && (
                    <Button size="sm" variant="ghost" onClick={() => handleReset(d.id)}>
                      Auto
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Les valeurs saisies remplacent le calcul automatique. Cliquez sur « Auto » pour revenir au calcul automatique.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default DriverStatsOverrideDialog;
