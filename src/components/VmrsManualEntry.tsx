
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { PlusCircle, Save, Trash2, UserPlus, Eraser } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { convertSupabaseDriver } from '@/hooks/supabase/converters';
import { Driver } from '@/types/championship';
import { generateValidUUID } from '@/utils/excel/uuidUtils';

type VmrsMoyenne = 'haute' | 'intermediaire' | 'basse';

interface VmrsResultRow {
  localId: string;
  driverId: string;
  originalDriverId?: string;
  position: number;
  moyenne: VmrsMoyenne;
  participationPoints: number;
  classificationPoints: number;
  bonusPoints: number;
  dnf: boolean;
  dirty?: boolean;
}

const VmrsManualEntry = () => {
  const [championshipId, setChampionshipId] = useState<string>();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [races, setRaces] = useState<{ id: string; name: string; date: string }[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string>('');
  const [rows, setRows] = useState<VmrsResultRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [existingResults, setExistingResults] = useState<any[]>([]);
  const [deletedDriverIds, setDeletedDriverIds] = useState<string[]>([]);
  const { toast } = useToast();

  const mapDbResultToRow = (r: any): VmrsResultRow => ({
    localId: r.id || generateValidUUID(),
    driverId: r.driver_id,
    originalDriverId: r.driver_id,
    position: r.position,
    moyenne: (r.moyenne as VmrsMoyenne) || 'haute',
    participationPoints: r.participation_points,
    classificationPoints: r.classification_points,
    bonusPoints: r.bonus_points,
    dnf: r.dnf,
  });

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
        supabase.from('drivers').select('*').eq('championship_id', config.id).eq('scope', 'vmrs').order('name'),
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
      setDeletedDriverIds([]);
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
        setRows(data.map(mapDbResultToRow));
      } else {
        setExistingResults([]);
        setRows([]);
      }
      setDeletedDriverIds([]);
    };
    loadExisting();
  }, [selectedRaceId, championshipId]);

  const addRow = () => {
    const nextPos = rows.length + 1;
    setRows([...rows, {
      localId: generateValidUUID(),
      driverId: '',
      position: nextPos,
      moyenne: 'haute',
      participationPoints: 0,
      classificationPoints: 0,
      bonusPoints: 0,
      dnf: false,
    }]);
  };

  const removeRow = (index: number) => {
    const row = rows[index];
    if (row?.originalDriverId) {
      setDeletedDriverIds(prev => prev.includes(row.originalDriverId!) ? prev : [...prev, row.originalDriverId!]);
    }
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof VmrsResultRow, value: any) => {
    const updated = [...rows];
    (updated[index] as any)[field] = value;
    updated[index].dirty = true;
    setRows(updated);
  };

  const getTotal = (row: VmrsResultRow) => {
    if (row.dnf) return row.participationPoints + row.bonusPoints;
    return row.participationPoints + row.classificationPoints + row.bonusPoints;
  };

  // Sauvegarde ATOMIQUE d'une seule ligne : ne touche QUE le couple (race_id, driver_id) ciblé.
  // Refuse toute écriture multiple ou implicite sur d'autres pilotes.
  const saveSingleRow = async (row: VmrsResultRow): Promise<boolean> => {
    if (!selectedRaceId || !championshipId) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Sélectionnez une course.' });
      return false;
    }
    if (!row.driverId) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Pilote manquant.' });
      return false;
    }
    // Vérifie qu'aucun autre row affiché n'utilise déjà ce driver_id (anti-doublon local).
    const dupLocal = rows.some(r => r.localId !== row.localId && r.driverId === row.driverId);
    if (dupLocal) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Ce pilote est déjà saisi sur cette course.' });
      return false;
    }

    const payload = {
      race_id: selectedRaceId,
      driver_id: row.driverId,
      championship_id: championshipId,
      position: row.position,
      moyenne: row.moyenne,
      participation_points: row.participationPoints,
      classification_points: row.classificationPoints,
      bonus_points: row.bonusPoints,
      dnf: row.dnf,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('vmrs_results')
      .upsert(payload, { onConflict: 'race_id,driver_id' });
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
      return false;
    }
    return true;
  };

  const handleSaveRow = async (index: number) => {
    const row = rows[index];
    setIsLoading(true);
    try {
      const ok = await saveSingleRow(row);
      if (!ok) return;
      const updated = [...rows];
      updated[index] = { ...row, dirty: false, originalDriverId: row.driverId };
      setRows(updated);
      toast({ title: 'Sauvegardé', description: `Résultat enregistré pour ce pilote.` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedRaceId || !championshipId) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Sélectionnez une course.' });
      return;
    }

    const dirtyRows = rows.filter(r => r.dirty || !r.originalDriverId);
    if (dirtyRows.length === 0 && deletedDriverIds.length === 0) {
      toast({ title: 'Aucun changement', description: 'Rien à sauvegarder.' });
      return;
    }

    if (dirtyRows.some(r => !r.driverId)) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Tous les pilotes doivent être sélectionnés.' });
      return;
    }

    const allIds = rows.map(r => r.driverId).filter(Boolean);
    if (new Set(allIds).size !== allIds.length) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Un même pilote ne peut pas être saisi deux fois sur la même course.' });
      return;
    }

    setIsLoading(true);
    try {
      // Sauvegarde ligne par ligne : chaque appel ne cible QUE son (race_id, driver_id).
      let savedCount = 0;
      for (const r of dirtyRows) {
        const ok = await saveSingleRow(r);
        if (!ok) throw new Error('Échec sur une ligne, arrêt.');
        savedCount++;
      }

      // Suppression UNIQUEMENT des pilotes explicitement retirés via la corbeille.
      const currentDriverIds = new Set(rows.map(r => r.driverId));
      const removedDriverIds = deletedDriverIds.filter(id => !currentDriverIds.has(id));
      if (removedDriverIds.length > 0) {
        const { error: delError } = await supabase
          .from('vmrs_results')
          .delete()
          .eq('race_id', selectedRaceId)
          .eq('championship_id', championshipId)
          .in('driver_id', removedDriverIds);
        if (delError) throw delError;
      }

      // Recharge l'état depuis la base.
      const { data: refreshed } = await supabase
        .from('vmrs_results')
        .select('*')
        .eq('race_id', selectedRaceId)
        .eq('championship_id', championshipId)
        .order('position');
      setExistingResults(refreshed || []);
      if (refreshed) setRows(refreshed.map(mapDbResultToRow));
      setDeletedDriverIds([]);

      toast({ title: 'Sauvegardé !', description: `${savedCount} ligne(s) mises à jour.` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      toast({ variant: 'destructive', title: 'Erreur', description: msg });
    } finally {
      setIsLoading(false);
    }
  };


  const usedDriverIds = rows.map(r => r.driverId).filter(Boolean);

  const handleDeleteRaceResults = async () => {
    if (!selectedRaceId || !championshipId) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('vmrs_results')
        .delete()
        .eq('race_id', selectedRaceId)
        .eq('championship_id', championshipId);
      if (error) throw error;
      setRows([]);
      setExistingResults([]);
      setDeletedDriverIds([]);
      toast({ title: 'Supprimé', description: 'Résultats VMRS de cette course supprimés.' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      toast({ variant: 'destructive', title: 'Erreur', description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllResults = async () => {
    if (!championshipId) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('vmrs_results')
        .delete()
        .eq('championship_id', championshipId);
      if (error) throw error;
      setRows([]);
      setExistingResults([]);
      setDeletedDriverIds([]);
      toast({ title: 'Supprimé', description: 'Tous les résultats VMRS ont été supprimés.' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      toast({ variant: 'destructive', title: 'Erreur', description: msg });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-6 h-6" />
          Saisie manuelle des points VMRS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isLoading}>
                <Eraser className="w-4 h-4 mr-2" />
                Supprimer tous les résultats VMRS
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer tous les résultats VMRS ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action supprime définitivement tous les résultats VMRS de toutes les courses. Action irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllResults}>Supprimer tout</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

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
                      <th className="text-left p-2 w-36">Moyenne</th>
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
                      <tr key={row.localId} className="border-b last:border-0">
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
                          <Select value={row.driverId} onValueChange={v => updateRow(index, 'driverId', v)} disabled={!!row.originalDriverId}>
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
                          <Select value={row.moyenne} onValueChange={v => updateRow(index, 'moyenne', v as VmrsMoyenne)}>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="haute">Haute</SelectItem>
                              <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                              <SelectItem value="basse">Basse</SelectItem>
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
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleSaveRow(index)}
                              disabled={isLoading || !row.driverId || (!row.dirty && !!row.originalDriverId)}
                              title="Enregistrer cette ligne uniquement"
                            >
                              <Save className={`w-4 h-4 ${row.dirty || !row.originalDriverId ? 'text-primary' : 'text-muted-foreground'}`} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeRow(index)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
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
              {existingResults.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isLoading}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer les résultats de cette course
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer les résultats de cette course ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tous les résultats VMRS enregistrés pour cette course seront supprimés. Action irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteRaceResults}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VmrsManualEntry;
