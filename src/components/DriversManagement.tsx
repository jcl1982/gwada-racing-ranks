
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Driver } from '@/types/championship';

interface DriversManagementProps {
  drivers: Driver[];
  onDriversChange: (drivers: Driver[]) => void;
}

const DriversManagement = ({ drivers, onDriversChange }: DriversManagementProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({ name: '', number: '' });

  const handleAddDriver = () => {
    if (!formData.name.trim() || !formData.number.trim()) return;
    
    const newDriver: Driver = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      number: parseInt(formData.number)
    };
    
    onDriversChange([...drivers, newDriver]);
    setFormData({ name: '', number: '' });
    setIsAddDialogOpen(false);
  };

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({ name: driver.name, number: driver.number.toString() });
  };

  const handleUpdateDriver = () => {
    if (!editingDriver || !formData.name.trim() || !formData.number.trim()) return;
    
    const updatedDrivers = drivers.map(driver =>
      driver.id === editingDriver.id
        ? { ...driver, name: formData.name.trim(), number: parseInt(formData.number) }
        : driver
    );
    
    onDriversChange(updatedDrivers);
    setEditingDriver(null);
    setFormData({ name: '', number: '' });
  };

  const handleDeleteDriver = (driverId: string) => {
    const updatedDrivers = drivers.filter(driver => driver.id !== driverId);
    onDriversChange(updatedDrivers);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestion des Pilotes</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Ajouter un pilote
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau pilote</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du pilote</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom complet"
                />
              </div>
              <div>
                <Label htmlFor="number">Numéro</Label>
                <Input
                  id="number"
                  type="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Numéro du pilote"
                />
              </div>
              <Button onClick={handleAddDriver} className="w-full">
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {drivers.map((driver) => (
          <Card key={driver.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{driver.name}</h3>
                <p className="text-sm text-gray-600">Numéro: {driver.number}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditDriver(driver)}
                >
                  <Edit size={16} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 size={16} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer le pilote</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer {driver.name} ? Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteDriver(driver.id)}>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingDriver} onOpenChange={() => setEditingDriver(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le pilote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nom du pilote</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom complet"
              />
            </div>
            <div>
              <Label htmlFor="edit-number">Numéro</Label>
              <Input
                id="edit-number"
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="Numéro du pilote"
              />
            </div>
            <Button onClick={handleUpdateDriver} className="w-full">
              Mettre à jour
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriversManagement;
