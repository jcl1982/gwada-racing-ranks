
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { Driver } from '@/types/championship';

interface DriverCardProps {
  driver: Driver;
  onEdit: (driver: Driver) => void;
  onDelete: (driverId: string) => void;
  isLoading: boolean;
  isDeleting?: boolean;
}

const DriverCard = ({ driver, onEdit, onDelete, isLoading, isDeleting = false }: DriverCardProps) => {
  return (
    <Card className={`p-4 ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{driver.name}</h3>
            <Badge variant={driver.driverRole === 'copilote' ? 'secondary' : 'default'} className="text-xs">
              {driver.driverRole === 'copilote' ? 'Copilote' : 'Pilote'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Numéro: {driver.number || 'Non défini'}
          </p>
          <p className="text-xs text-gray-400">
            ID: {driver.id.slice(0, 8)}...
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(driver)}
            disabled={isLoading || isDeleting}
          >
            <Edit size={16} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm" 
                disabled={isLoading || isDeleting}
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer le pilote</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer <strong>{driver.name}</strong> ? 
                  <br />
                  <br />
                  Cette action supprimera également :
                  <ul className="list-disc list-inside mt-2 text-sm">
                    <li>Tous ses résultats de course</li>
                    <li>Ses classements précédents</li>
                  </ul>
                  <br />
                  Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(driver.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer définitivement
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
