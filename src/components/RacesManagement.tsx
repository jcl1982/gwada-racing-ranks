
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Mountain, Car, Edit } from 'lucide-react';
import { Driver, Race } from '@/types/championship';

interface RacesManagementProps {
  drivers: Driver[];
  montagneRaces: Race[];
  rallyeRaces: Race[];
  onRacesChange: (montagneRaces: Race[], rallyeRaces: Race[]) => void;
}

const RacesManagement = ({ drivers, montagneRaces, rallyeRaces, onRacesChange }: RacesManagementProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRace, setEditingRace] = useState<Race | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'montagne' as 'montagne' | 'rallye'
  });

  const allRaces = [...montagneRaces, ...rallyeRaces];

  const handleAddRace = () => {
    if (!formData.name.trim() || !formData.date.trim()) return;
    
    const newRace: Race = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      date: formData.date,
      type: formData.type,
      results: []
    };
    
    if (formData.type === 'montagne') {
      onRacesChange([...montagneRaces, newRace], rallyeRaces);
    } else {
      onRacesChange(montagneRaces, [...rallyeRaces, newRace]);
    }
    
    setFormData({ name: '', date: '', type: 'montagne' });
    setIsAddDialogOpen(false);
  };

  const handleEditRace = (race: Race) => {
    setEditingRace(race);
    setFormData({
      name: race.name,
      date: race.date,
      type: race.type
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateRace = () => {
    if (!editingRace || !formData.name.trim() || !formData.date.trim()) return;

    const updatedRace: Race = {
      ...editingRace,
      name: formData.name.trim(),
      date: formData.date,
      type: formData.type
    };

    // Si le type de la course a changé, on doit la déplacer vers la bonne liste
    const updatedMontagneRaces = montagneRaces.filter(race => race.id !== editingRace.id);
    const updatedRallyeRaces = rallyeRaces.filter(race => race.id !== editingRace.id);

    if (formData.type === 'montagne') {
      updatedMontagneRaces.push(updatedRace);
    } else {
      updatedRallyeRaces.push(updatedRace);
    }

    // Si le type n'a pas changé, on met à jour la course dans sa liste actuelle
    if (editingRace.type === formData.type) {
      if (formData.type === 'montagne') {
        const raceIndex = montagneRaces.findIndex(race => race.id === editingRace.id);
        if (raceIndex !== -1) {
          updatedMontagneRaces[raceIndex] = updatedRace;
        }
      } else {
        const raceIndex = rallyeRaces.findIndex(race => race.id === editingRace.id);
        if (raceIndex !== -1) {
          updatedRallyeRaces[raceIndex] = updatedRace;
        }
      }
    }

    onRacesChange(updatedMontagneRaces, updatedRallyeRaces);
    setIsEditDialogOpen(false);
    setEditingRace(null);
    setFormData({ name: '', date: '', type: 'montagne' });
  };

  const handleDeleteRace = (raceId: string) => {
    const updatedMontagneRaces = montagneRaces.filter(race => race.id !== raceId);
    const updatedRallyeRaces = rallyeRaces.filter(race => race.id !== raceId);
    onRacesChange(updatedMontagneRaces, updatedRallyeRaces);
  };

  const resetForm = () => {
    setFormData({ name: '', date: '', type: 'montagne' });
    setEditingRace(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestion des Courses</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom de la course"
                />
              </div>
              <div>
                <Label htmlFor="race-date">Date</Label>
                <Input
                  id="race-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="race-type">Type de course</Label>
                <Select value={formData.type} onValueChange={(value: 'montagne' | 'rallye') => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="montagne">Course de Côte</SelectItem>
                    <SelectItem value="rallye">Rallye</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddRace} className="w-full">
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom de la course"
              />
            </div>
            <div>
              <Label htmlFor="edit-race-date">Date</Label>
              <Input
                id="edit-race-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-race-type">Type de course</Label>
              <Select value={formData.type} onValueChange={(value: 'montagne' | 'rallye') => setFormData({ ...formData, type: value })}>
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
              <Button onClick={handleUpdateRace} className="flex-1">
                Mettre à jour
              </Button>
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }} className="flex-1">
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {allRaces.map((race) => (
          <Card key={race.id} className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {race.type === 'montagne' ? (
                  <Mountain className="text-green-600" size={20} />
                ) : (
                  <Car className="text-blue-600" size={20} />
                )}
                <div>
                  <h3 className="font-medium">{race.name}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(race.date).toLocaleDateString('fr-FR')} • {race.results.length} participants
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditRace(race)}
                  className="flex items-center gap-1"
                >
                  <Edit size={16} />
                  Modifier
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 size={16} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer la course</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer "{race.name}" ? Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteRace(race.id)}>
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RacesManagement;
