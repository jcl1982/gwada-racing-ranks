
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Driver } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';

interface DriversManagementProps {
  drivers: Driver[];
  onDriversChange: (drivers: Driver[]) => void;
  saveDriver: (driver: Omit<Driver, 'id'> | Driver) => Promise<void>;
  deleteDriver: (driverId: string) => Promise<void>;
}

const DriversManagement = ({ drivers, onDriversChange, saveDriver, deleteDriver }: DriversManagementProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({ name: '', number: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddDriver = async () => {
    if (!formData.name.trim() || !formData.number.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const newDriver = {
        name: formData.name.trim(),
        number: parseInt(formData.number)
      };
      
      console.log('Adding driver:', newDriver);
      await saveDriver(newDriver);
      
      setFormData({ name: '', number: '' });
      setIsAddDialogOpen(false);
      
      // Trigger refresh of drivers list
      onDriversChange([...drivers]);
      
      toast({
        title: "Succès",
        description: "Pilote ajouté avec succès.",
      });
    } catch (error) {
      console.error('Error adding driver:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le pilote.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({ name: driver.name, number: driver.number.toString() });
  };

  const handleUpdateDriver = async () => {
    if (!editingDriver || !formData.name.trim() || !formData.number.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const updatedDriver = {
        ...editingDriver,
        name: formData.name.trim(),
        number: parseInt(formData.number)
      };
      
      console.log('Updating driver:', updatedDriver);
      await saveDriver(updatedDriver);
      
      setEditingDriver(null);
      setFormData({ name: '', number: '' });
      
      // Trigger refresh of drivers list
      onDriversChange([...drivers]);
      
      toast({
        title: "Succès",
        description: "Pilote mis à jour avec succès.",
      });
    } catch (error) {
      console.error('Error updating driver:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le pilote.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    setIsLoading(true);
    try {
      console.log('Deleting driver:', driverId);
      await deleteDriver(driverId);
      
      // Trigger refresh of drivers list
      onDriversChange([...drivers]);
      
      toast({
        title: "Succès",
        description: "Pilote supprimé avec succès.",
      });
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le pilote.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestion des Pilotes</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" disabled={isLoading}>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              <Button onClick={handleAddDriver} className="w-full" disabled={isLoading}>
                {isLoading ? 'Ajout en cours...' : 'Ajouter'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {drivers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Aucun pilote disponible</p>
          </Card>
        ) : (
          drivers.map((driver) => (
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
                    disabled={isLoading}
                  >
                    <Edit size={16} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={isLoading}>
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
          ))
        )}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleUpdateDriver} className="w-full" disabled={isLoading}>
              {isLoading ? 'Mise à jour en cours...' : 'Mettre à jour'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriversManagement;
