
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
  const [deletingDriverId, setDeletingDriverId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
  };

  const handleCloseEdit = () => {
    setEditingDriver(null);
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (deletingDriverId === driverId) {
      console.log('⚠️ Deletion already in progress for driver:', driverId);
      return;
    }

    setDeletingDriverId(driverId);
    setIsLoading(true);
    
    try {
      console.log('🗑️ Initiating driver deletion:', driverId);
      
      // Find driver info for logging
      const driverToDelete = drivers.find(d => d.id === driverId);
      console.log('Driver to delete:', driverToDelete);
      
      await deleteDriver(driverId);
      
      // Trigger refresh of drivers list
      console.log('🔄 Triggering drivers list refresh...');
      onDriversChange([...drivers.filter(d => d.id !== driverId)]);
      
    } catch (error) {
      console.error('❌ Error in handleDeleteDriver:', error);
      // Toast is already handled in the deleteDriver function
    } finally {
      setIsLoading(false);
      setDeletingDriverId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestion des Pilotes ({drivers.length})</h2>
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
        deletingDriverId={deletingDriverId}
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
