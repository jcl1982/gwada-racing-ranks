
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Race } from '@/types/championship';
import { useRaceForm } from '@/hooks/useRaceForm';

interface RaceFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRace: (race: Omit<Race, 'id' | 'results'>) => void;
}

const RaceFormDialog = ({ isOpen, onOpenChange, onAddRace }: RaceFormDialogProps) => {
  const { formData, updateFormData, resetForm, isFormValid } = useRaceForm();

  const handleSubmit = () => {
    if (!isFormValid()) return;
    
    onAddRace({
      name: formData.name.trim(),
      date: formData.date,
      endDate: formData.endDate || undefined,
      type: formData.type
    });
    
    resetForm();
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Ajouter une course
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle course</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="race-name">Nom de la course</Label>
            <Input
              id="race-name"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              placeholder="Nom de la course"
            />
          </div>
          <div>
            <Label htmlFor="race-date">Date de début</Label>
            <Input
              id="race-date"
              type="date"
              value={formData.date}
              onChange={(e) => updateFormData({ date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="race-end-date">Date de fin (optionnelle)</Label>
            <Input
              id="race-end-date"
              type="date"
              value={formData.endDate}
              onChange={(e) => updateFormData({ endDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="race-type">Type de course</Label>
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
          <Button onClick={handleSubmit} className="w-full">
            Ajouter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RaceFormDialog;
