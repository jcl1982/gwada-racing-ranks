import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Race } from '@/types/championship';
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
  const [type, setType] = useState<'montagne' | 'rallye'>('montagne');

  // Charger les données de la course quand le dialog s'ouvre
  useEffect(() => {
    if (editingRace && isOpen) {
      console.log('📝 Chargement de la course dans le formulaire:', editingRace);
      setName(editingRace.name);
      setDate(editingRace.date);
      setEndDate(editingRace.endDate || '');
      setType(editingRace.type);
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
      type: type
    };

    console.log('📦 Race mise à jour:', updatedRace);

    onUpdateRace(updatedRace);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDate('');
    setEndDate('');
    setType('montagne');
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
            <Input
              id="edit-race-date"
              type="date"
              value={date}
              onChange={(e) => {
                console.log('📅 Changement date:', e.target.value);
                setDate(e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="edit-race-end-date">Date de fin (optionnelle)</Label>
            <Input
              id="edit-race-end-date"
              type="date"
              value={endDate}
              onChange={(e) => {
                console.log('📅 Changement date fin:', e.target.value);
                setEndDate(e.target.value);
              }}
            />
          </div>
          <div>
            <Label htmlFor="edit-race-type">Type de course</Label>
            <Select 
              value={type} 
              onValueChange={(value: 'montagne' | 'rallye') => {
                console.log('🏁 Changement type:', value);
                setType(value);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="montagne">Course de Côte</SelectItem>
                <SelectItem value="rallye">Rallye</SelectItem>
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
