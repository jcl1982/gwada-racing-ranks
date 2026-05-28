import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Driver, DriverRole } from '@/types/championship';
import { convertSupabaseDriver } from '@/hooks/supabase/converters';

interface FormState {
  name: string;
  number: string;
  carModel: string;
  driverRole: DriverRole;
}

const emptyForm: FormState = { name: '', number: '', carModel: '', driverRole: 'pilote' };

const VmrsDriversManagement = () => {
  const [championshipId, setChampionshipId] = useState<string>();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const { toast } = useToast();

  const load = async (cid?: string) => {
    const id = cid || championshipId;
    if (!id) return;
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('championship_id', id)
      .eq('scope', 'vmrs')
      .order('name');
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
      return;
    }
    setDrivers((data || []).map(convertSupabaseDriver));
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase
        .from('championship_config')
        .select('id')
        .eq('type', 'rallye-montagne')
        .maybeSingle();
      if (data) {
        setChampionshipId(data.id);
        await load(data.id);
      }
    };
    init();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (d: Driver) => {
    setEditing(d);
    setForm({
      name: d.name,
      number: d.number?.toString() || '',
      carModel: d.carModel || '',
      driverRole: d.driverRole || 'pilote',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!championshipId) return;
    if (!form.name.trim() || !form.number.trim()) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Nom et numéro requis.' });
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        number: parseInt(form.number),
        car_model: form.carModel.trim() || null,
        driver_role: form.driverRole,
        championship_id: championshipId,
        scope: 'vmrs',
      };

      if (editing) {
        const { error } = await supabase.from('drivers').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast({ title: 'Pilote mis à jour' });
      } else {
        const { error } = await supabase.from('drivers').insert(payload);
        if (error) throw error;
        toast({ title: 'Pilote ajouté' });
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditing(null);
      await load();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      // Delete VMRS results first
      await supabase.from('vmrs_results').delete().eq('driver_id', id);
      const { error } = await supabase.from('drivers').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Pilote supprimé' });
      await load();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const pilotes = drivers.filter(d => d.driverRole === 'pilote');
  const copilotes = drivers.filter(d => d.driverRole === 'copilote');

  const renderList = (list: Driver[], title: string) => (
    <div className="space-y-3">
      <h3 className="font-semibold">{title} ({list.length})</h3>
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun pilote</p>
      ) : (
        <div className="space-y-2">
          {list.map(d => (
            <div key={d.id} className="flex items-center justify-between gap-3 p-3 border rounded-md bg-card">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-sm font-semibold w-10 text-center">#{d.number}</span>
                <div className="min-w-0">
                  <div className="font-medium truncate">{d.name}</div>
                  {d.carModel && <div className="text-xs text-muted-foreground truncate">{d.carModel}</div>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(d)} disabled={isLoading}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isLoading}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer ce pilote VMRS ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action supprimera également tous ses résultats VMRS. Action irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDelete(d.id)}
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card className="card-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            Pilotes VMRS
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} disabled={isLoading || !championshipId}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un pilote VMRS
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Modifier le pilote VMRS' : 'Ajouter un pilote VMRS'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nom</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>Numéro</Label>
                  <Input type="number" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />
                </div>
                <div>
                  <Label>Véhicule</Label>
                  <Input value={form.carModel} onChange={e => setForm({ ...form, carModel: e.target.value })} placeholder="Ex: Peugeot 208" />
                </div>
                <div>
                  <Label>Rôle</Label>
                  <Select value={form.driverRole} onValueChange={(v: DriverRole) => setForm({ ...form, driverRole: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pilote">Pilote</SelectItem>
                      <SelectItem value="copilote">Copilote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1" disabled={isLoading}>
                    {editing ? 'Mettre à jour' : 'Ajouter'}
                  </Button>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Annuler</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderList(pilotes, 'Pilotes')}
        {renderList(copilotes, 'Copilotes')}
      </CardContent>
    </Card>
  );
};

export default VmrsDriversManagement;
