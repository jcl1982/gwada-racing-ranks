
import { useState } from 'react';
import { Driver } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import AddDriverDialog from './drivers/AddDriverDialog';
import EditDriverDialog from './drivers/EditDriverDialog';
import DriversList from './drivers/DriversList';

interface DriversManagementProps {
  drivers: Driver[];
  onDriversChange: (drivers: Driver[]) => void;
  saveDriver: (driver: Omit<Driver, 'id'> | Driver) => Promise<void>;
  deleteDriver: (driverId: string) => Promise<void>;
  deleteAllDrivers: () => Promise<void>;
  championshipId?: string;
}

const DriversManagement = ({ drivers, onDriversChange, saveDriver, deleteDriver, deleteAllDrivers, championshipId }: DriversManagementProps) => {
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingDriverId, setDeletingDriverId] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
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
      
      // No need to call onDriversChange - deleteDriver already refreshes data
      console.log('✅ Driver deleted, data will refresh automatically');
      
    } catch (error) {
      console.error('❌ Error in handleDeleteDriver:', error);
      // Toast is already handled in the deleteDriver function
    } finally {
      setIsLoading(false);
      setDeletingDriverId(null);
    }
  };

  const handleDeleteAllDrivers = async () => {
    if (isDeletingAll) {
      console.log('⚠️ Bulk deletion already in progress');
      return;
    }

    setIsDeletingAll(true);
    setIsLoading(true);
    
    try {
      console.log('🗑️ Initiating bulk deletion of all drivers');
      
      await deleteAllDrivers();
      
      // No need to call onDriversChange - deleteAllDrivers already refreshes data
      console.log('✅ All drivers deleted, data will refresh automatically');
      
    } catch (error) {
      console.error('❌ Error in handleDeleteAllDrivers:', error);
      // Toast is already handled in the deleteAllDrivers function
    } finally {
      setIsLoading(false);
      setIsDeletingAll(false);
    }
  };

  const pilotes = drivers.filter(d => d.driverRole === 'pilote');
  const copilotes = drivers.filter(d => d.driverRole === 'copilote');

  return (
    <div className="space-y-8">
      {/* Section Pilotes */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Gestion des Pilotes ({pilotes.length})</h2>
          <div className="flex gap-2">
            <AddDriverDialog
              onDriverAdd={saveDriver}
              onDriversChange={onDriversChange}
              drivers={drivers}
              isLoading={isLoading}
              championshipId={championshipId}
            />
            
            {drivers.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={isLoading || isDeletingAll}
                    className="gap-2"
                  >
                    <Trash2 size={16} />
                    Supprimer tous
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer tous les pilotes et copilotes</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous absolument sûr de vouloir supprimer <strong>TOUS</strong> les pilotes et copilotes ? 
                      <br />
                      <br />
                      Cette action supprimera définitivement :
                      <ul className="list-disc list-inside mt-2 text-sm">
                        <li><strong>{pilotes.length} pilotes</strong></li>
                        <li><strong>{copilotes.length} copilotes</strong></li>
                        <li>Tous leurs résultats de course</li>
                        <li>Tous leurs classements précédents</li>
                      </ul>
                      <br />
                      <strong className="text-red-600">Cette action est irréversible et ne peut pas être annulée.</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAllDrivers}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Supprimer tous
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <DriversList
          drivers={pilotes}
          onEdit={handleEditDriver}
          onDelete={handleDeleteDriver}
          isLoading={isLoading}
          deletingDriverId={deletingDriverId}
        />
      </div>

      {/* Section Copilotes */}
      {copilotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestion des Copilotes ({copilotes.length})</h2>
          </div>

          <DriversList
            drivers={copilotes}
            onEdit={handleEditDriver}
            onDelete={handleDeleteDriver}
            isLoading={isLoading}
            deletingDriverId={deletingDriverId}
          />
        </div>
      )}

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
