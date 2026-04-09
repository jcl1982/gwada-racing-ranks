import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Race, RaceLevel } from '@/types/championship';
import { useState, useEffect } from 'react';

interface RaceEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingRace: Race | null;
  onUpdateRace: (updatedRace: Race) => void;
}

const RaceEditDialog = ({ isOpen, onOpenChange, editingRace, onUpdateRace }: RaceEditDialogProps) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [type, setType] = useState<'montagne' | 'rallye' | 'karting' | 'acceleration'>('montagne');
  const [raceLevel, setRaceLevel] = useState<RaceLevel>('regional');

  // Charger les données de la course quand le dialog s'ouvre
  useEffect(() => {
    if (editingRace && isOpen) {
      console.log('📝 Chargement de la course dans le formulaire:', editingRace);
      setName(editingRace.name);
      setDate(editingRace.date);
      setEndDate(editingRace.endDate || '');
      setOrganizer(editingRace.organizer || '');
      setType(editingRace.type);
      setRaceLevel(editingRace.raceLevel || 'regional');
    }
  }, [editingRace, isOpen]);

  const handleSubmit = () => {
    if (!editingRace) {
      console.error('❌ Pas de course en édition');
      return;
    }

    if (!name.trim() || !date) {
      console.error('❌ Champs requis manquants');
      return;
    }

    console.log('🚀 Soumission avec les valeurs:');
    console.log('  - name:', name);
    console.log('  - date:', date);
    console.log('  - endDate:', endDate);
    console.log('  - type:', type);

    const updatedRace: Race = {
      ...editingRace,
      name: name.trim(),
      date: date,
      endDate: endDate || undefined,
      organizer: organizer.trim() || undefined,
      type: type,
      raceLevel: raceLevel
    };

    console.log('📦 Race mise à jour:', updatedRace);

    onUpdateRace(updatedRace);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDate('');
    setEndDate('');
    setOrganizer('');
    setType('montagne');
    setRaceLevel('regional');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la course</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-race-name">Nom de la course</Label>
            <Input
              id="edit-race-name"
              value={name}
              onChange={(e) => {
                console.log('📝 Changement nom:', e.target.value);
                setName(e.target.value);
              }}
              placeholder="Nom de la course"
            />
          </div>
          <div>
            <Label htmlFor="edit-race-date">Date de début</Label>
            <DatePicker
              value={date}
              onChange={(newDate) => {
                console.log('📅 Changement date:', newDate);
                setDate(newDate || '');
              }}
              placeholder="Choisir la date de début"
            />
          </div>
          <div>
            <Label htmlFor="edit-race-end-date">Date de fin (optionnelle)</Label>
            <DatePicker
              value={endDate}
              onChange={(newDate) => {
                console.log('📅 Changement date fin:', newDate);
                setEndDate(newDate || '');
              }}
              placeholder="Choisir la date de fin (optionnelle)"
            />
          </div>
          <div>
            <Label htmlFor="edit-race-organizer">Organisateur</Label>
            <Select 
              value={organizer} 
              onValueChange={(value) => {
                console.log('👥 Changement organisateur:', value);
                setOrganizer(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un organisateur" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="ASA GUADELOUPE">ASA GUADELOUPE</SelectItem>
                <SelectItem value="ASA CARAIB">ASA CARAIB</SelectItem>
                <SelectItem value="ASA ARCHIPEL">ASA ARCHIPEL</SelectItem>
                <SelectItem value="ASK GUADELOUP'KART">ASK GUADELOUP'KART</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-race-type">Type de course</Label>
            <Select 
              value={type} 
              onValueChange={(value: 'montagne' | 'rallye' | 'karting' | 'acceleration') => {
                console.log('🏁 Changement type:', value);
                setType(value);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="montagne">Course de Côte</SelectItem>
                <SelectItem value="rallye">Rallye</SelectItem>
                <SelectItem value="karting">Karting</SelectItem>
                <SelectItem value="acceleration">Accélération</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1">
              Mettre à jour
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClose} 
              className="flex-1"
            >
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RaceEditDialog;
