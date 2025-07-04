
import { useState } from 'react';
import { Driver } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import AddDriverDialog from './drivers/AddDriverDialog';
import EditDriverDialog from './drivers/EditDriverDialog';
import DriversList from './drivers/DriversList';

interface DriversManagementProps {
  drivers: Driver[];
  onDriversChange: (drivers: Driver[]) => void;
  saveDriver: (driver: Omit<Driver, 'id'> | Driver) => Promise<void>;
  deleteDriver: (driverId: string) => Promise<void>;
}

const DriversManagement = ({ drivers, onDriversChange, saveDriver, deleteDriver }: DriversManagementProps) => {
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
  };

  const handleCloseEdit = () => {
    setEditingDriver(null);
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
        <AddDriverDialog
          onDriverAdd={saveDriver}
          onDriversChange={onDriversChange}
          drivers={drivers}
          isLoading={isLoading}
        />
      </div>

      <DriversList
        drivers={drivers}
        onEdit={handleEditDriver}
        onDelete={handleDeleteDriver}
        isLoading={isLoading}
      />

      <EditDriverDialog
        editingDriver={editingDriver}
        onDriverUpdate={saveDriver}
        onDriversChange={onDriversChange}
        drivers={drivers}
        onClose={handleCloseEdit}
      />
    </div>
  );
};

export default DriversManagement;
