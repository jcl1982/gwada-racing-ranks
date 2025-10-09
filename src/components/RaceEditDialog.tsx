
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Race } from '@/types/championship';
import { useRaceForm } from '@/hooks/useRaceForm';
import { useEffect } from 'react';

interface RaceEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingRace: Race | null;
  onUpdateRace: (updatedRace: Race) => void;
}

const RaceEditDialog = ({ isOpen, onOpenChange, editingRace, onUpdateRace }: RaceEditDialogProps) => {
  const { formData, updateFormData, resetForm, loadRaceData, isFormValid } = useRaceForm();

  useEffect(() => {
    if (editingRace) {
      loadRaceData(editingRace);
    }
  }, [editingRace, loadRaceData]);

  const handleSubmit = () => {
    if (!editingRace || !isFormValid()) return;

    console.log('📝 Soumission du formulaire d\'édition');
    console.log('Course originale:', editingRace);
    console.log('Données du formulaire:', formData);

    const updatedRace: Race = {
      ...editingRace,
      name: formData.name.trim(),
      date: formData.date,
      endDate: formData.endDate || undefined,
      type: formData.type
    };

    console.log('Course mise à jour:', updatedRace);

    onUpdateRace(updatedRace);
    onOpenChange(false);
    resetForm();
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la course</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-race-name">Nom de la course</Label>
            <Input
              id="edit-race-name"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              placeholder="Nom de la course"
            />
          </div>
          <div>
            <Label htmlFor="edit-race-date">Date de début</Label>
            <Input
              id="edit-race-date"
              type="date"
              value={formData.date}
              onChange={(e) => updateFormData({ date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-race-end-date">Date de fin (optionnelle)</Label>
            <Input
              id="edit-race-end-date"
              type="date"
              value={formData.endDate}
              onChange={(e) => updateFormData({ endDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-race-type">Type de course</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'montagne' | 'rallye') => updateFormData({ type: value })}
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
              onClick={() => handleOpenChange(false)} 
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
