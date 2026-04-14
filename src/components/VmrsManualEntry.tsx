
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Save, Trash2, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { convertSupabaseDriver } from '@/hooks/supabase/converters';
import { Driver } from '@/types/championship';
import { generateValidUUID } from '@/utils/excel/uuidUtils';

interface VmrsResultRow {
  driverId: string;
  position: number;
  participationPoints: number;
  classificationPoints: number;
  bonusPoints: number;
  dnf: boolean;
}

const VmrsManualEntry = () => {
  const [championshipId, setChampionshipId] = useState<string>();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [races, setRaces] = useState<{ id: string; name: string; date: string }[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string>('');
  const [rows, setRows] = useState<VmrsResultRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [existingResults, setExistingResults] = useState<any[]>([]);
  const { toast } = useToast();

  // Load championship, drivers and races
  useEffect(() => {
    const load = async () => {
      const { data: config } = await supabase
        .from('championship_config')
        .select('id')
        .eq('type', 'rallye-montagne')
        .maybeSingle();

      if (!config) return;
      setChampionshipId(config.id);

      const [driversRes, racesRes] = await Promise.all([
        supabase.from('drivers').select('*').eq('championship_id', config.id).order('name'),
        supabase.from('races').select('id, name, date').eq('championship_id', config.id).order('date'),
      ]);

      setDrivers(driversRes.data?.map(convertSupabaseDriver) || []);
      setRaces(racesRes.data || []);
    };
    load();
  }, []);

  // Load existing results when race changes
  useEffect(() => {
    if (!selectedRaceId || !championshipId) {
      setRows([]);
      setExistingResults([]);
      return;
    }

    const loadExisting = async () => {
      const { data } = await supabase
        .from('vmrs_results')
        .select('*')
        .eq('race_id', selectedRaceId)
        .eq('championship_id', championshipId)
        .order('position');

      if (data && data.length > 0) {
        setExistingResults(data);
        setRows(data.map((r: any) => ({
          driverId: r.driver_id,
          position: r.position,
          participationPoints: r.participation_points,
          classificationPoints: r.classification_points,
          bonusPoints: r.bonus_points,
          dnf: r.dnf,
        })));
      } else {
        setExistingResults([]);
        setRows([]);
      }
    };
    loadExisting();
  }, [selectedRaceId, championshipId]);

  const addRow = () => {
    const nextPos = rows.length + 1;
    setRows([...rows, {
      driverId: '',
      position: nextPos,
      participationPoints: 0,
      classificationPoints: 0,
      bonusPoints: 0,
      dnf: false,
    }]);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof VmrsResultRow, value: any) => {
    const updated = [...rows];
    (updated[index] as any)[field] = value;
    setRows(updated);
  };

  const getTotal = (row: VmrsResultRow) => {
    if (row.dnf) return row.participationPoints + row.bonusPoints;
    return row.participationPoints + row.classificationPoints + row.bonusPoints;
  };

  const handleSave = async () => {
    if (!selectedRaceId || !championshipId) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Sélectionnez une course.' });
      return;
    }

    const invalidRows = rows.filter(r => !r.driverId);
    if (invalidRows.length > 0) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Tous les pilotes doivent être sélectionnés.' });
      return;
    }

    setIsLoading(true);
    try {
      // Delete existing results for this race
      await supabase
        .from('vmrs_results')
        .delete()
        .eq('race_id', selectedRaceId)
        .eq('championship_id', championshipId);

      // Insert new results
      const inserts = rows.map(r => ({
        race_id: selectedRaceId,
        driver_id: r.driverId,
        championship_id: championshipId,
        position: r.position,
        participation_points: r.participationPoints,
        classification_points: r.classificationPoints,
        bonus_points: r.bonusPoints,
        dnf: r.dnf,
      }));

      const { error } = await supabase
        .from('vmrs_results')
        .insert(inserts);

      if (error) throw error;

      toast({ title: 'Sauvegardé !', description: `${rows.length} résultat(s) VMRS enregistré(s).` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      toast({ variant: 'destructive', title: 'Erreur', description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const usedDriverIds = rows.map(r => r.driverId).filter(Boolean);

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-6 h-6" />
          Saisie manuelle des points VMRS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Course</label>
          <Select value={selectedRaceId} onValueChange={setSelectedRaceId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une course" />
            </SelectTrigger>
            <SelectContent>
              {races.map(race => (
                <SelectItem key={race.id} value={race.id}>
                  {race.name} ({race.date})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedRaceId && (
          <>
            {rows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 w-12">Pos</th>
                      <th className="text-left p-2">Pilote/Copilote</th>
                      <th className="text-right p-2 w-24">Particip.</th>
                      <th className="text-right p-2 w-24">Classmt.</th>
                      <th className="text-right p-2 w-20">Bonus</th>
                      <th className="text-center p-2 w-16">DNF</th>
                      <th className="text-right p-2 w-20">Total</th>
                      <th className="p-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="p-2">
                          <Input
                            type="number"
                            min={1}
                            value={row.position}
                            onChange={e => updateRow(index, 'position', parseInt(e.target.value) || 0)}
                            className="w-14 h-8 text-center"
                          />
                        </td>
                        <td className="p-2">
                          <Select value={row.driverId} onValueChange={v => updateRow(index, 'driverId', v)}>
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Choisir..." />
                            </SelectTrigger>
                            <SelectContent>
                              {drivers
                                .filter(d => d.id === row.driverId || !usedDriverIds.includes(d.id))
                                .map(d => (
                                  <SelectItem key={d.id} value={d.id}>
                                    {d.name} ({d.driverRole})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min={0}
                            value={row.participationPoints}
                            onChange={e => updateRow(index, 'participationPoints', parseInt(e.target.value) || 0)}
                            className="w-20 h-8 text-right"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min={0}
                            value={row.classificationPoints}
                            onChange={e => updateRow(index, 'classificationPoints', parseInt(e.target.value) || 0)}
                            className="w-20 h-8 text-right"
                            disabled={row.dnf}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min={0}
                            value={row.bonusPoints}
                            onChange={e => updateRow(index, 'bonusPoints', parseInt(e.target.value) || 0)}
                            className="w-20 h-8 text-right"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Checkbox
                            checked={row.dnf}
                            onCheckedChange={v => updateRow(index, 'dnf', !!v)}
                          />
                        </td>
                        <td className="p-2 text-right font-semibold">
                          {getTotal(row)}
                        </td>
                        <td className="p-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeRow(index)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={addRow}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Ajouter un pilote
              </Button>
              {rows.length > 0 && (
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Enregistrement...' : 'Enregistrer les résultats'}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VmrsManualEntry;
