import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ChampionshipOption {
  id: string;
  title: string;
}

interface AddCalendarRaceDialogProps {
  championships: ChampionshipOption[];
  onCreated?: () => void;
}

const typeOptionsFor = (title: string) => {
  if (title.toLowerCase().includes('karting')) return ['karting'];
  if (title.toLowerCase().includes('accél') || title.toLowerCase().includes('accel')) return ['acceleration'];
  return ['rallye', 'montagne'];
};

const AddCalendarRaceDialog = ({ championships, onCreated }: AddCalendarRaceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [championshipId, setChampionshipId] = useState(championships[0]?.id ?? '');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [type, setType] = useState('rallye');
  const [raceLevel, setRaceLevel] = useState('regional');

  const selected = championships.find(c => c.id === championshipId);
  const types = typeOptionsFor(selected?.title ?? '');

  const handleChampionshipChange = (id: string) => {
    setChampionshipId(id);
    const next = typeOptionsFor(championships.find(c => c.id === id)?.title ?? '');
    setType(next[0]);
  };

  const reset = () => {
    setName('');
    setDate('');
    setEndDate('');
    setOrganizer('');
  };

  const handleSubmit = async () => {
    if (!championshipId || !name.trim() || !date) {
      toast({ title: 'Champs manquants', description: 'Championnat, nom et date sont obligatoires.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('races').insert({
      championship_id: championshipId,
      name: name.trim(),
      date,
      end_date: endDate || null,
      organizer: organizer.trim() || null,
      type,
      race_level: raceLevel,
    });
    setSaving(false);

    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Course ajoutée', description: `${name} a été ajoutée au calendrier.` });
    reset();
    setOpen(false);
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="no-export no-print">
          <Plus size={16} className="mr-2" />
          Ajouter une course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une course au calendrier</DialogTitle>
          <DialogDescription>La course apparaîtra dans le calendrier du championnat choisi.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Championnat</Label>
            <Select value={championshipId} onValueChange={handleChampionshipChange}>
              <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {championships.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="race-name">Nom de la course</Label>
            <Input id="race-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Rallye de Basse-Terre" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="race-date">Date de début</Label>
              <Input id="race-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="race-end">Date de fin</Label>
              <Input id="race-end" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {types.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Niveau</Label>
              <Select value={raceLevel} onValueChange={setRaceLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="regional">Régional</SelectItem>
                  <SelectItem value="national">National</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="race-org">Organisateur</Label>
            <Input id="race-org" value={organizer} onChange={e => setOrganizer(e.target.value)} placeholder="Ex: ASA Guadeloupe" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Ajout...' : 'Ajouter'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCalendarRaceDialog;
