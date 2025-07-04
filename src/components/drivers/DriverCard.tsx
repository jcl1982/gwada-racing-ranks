
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';
import { Driver } from '@/types/championship';

interface DriverCardProps {
  driver: Driver;
  onEdit: (driver: Driver) => void;
  onDelete: (driverId: string) => void;
  isLoading: boolean;
}

const DriverCard = ({ driver, onEdit, onDelete, isLoading }: DriverCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{driver.name}</h3>
          <p className="text-sm text-gray-600">Numéro: {driver.number}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(driver)}
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
                <AlertDialogAction onClick={() => onDelete(driver.id)}>
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
};

export default DriverCard;
