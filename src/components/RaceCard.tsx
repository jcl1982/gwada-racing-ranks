
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Mountain, Car, Edit, Trash2, Calendar } from 'lucide-react';
import { Race } from '@/types/championship';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Parse une date YYYY-MM-DD en Date locale sans décalage de fuseau horaire
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

interface RaceCardProps {
  race: Race;
  onEdit: (race: Race) => void;
  onDelete: (raceId: string) => void;
}

const RaceCard = ({ race, onEdit, onDelete }: RaceCardProps) => {
  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = format(parseLocalDate(startDate), 'dd/MM/yyyy', { locale: fr });
    if (!endDate) return start;
    const end = format(parseLocalDate(endDate), 'dd/MM/yyyy', { locale: fr });
    return `${start} - ${end}`;
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {race.type === 'montagne' ? (
            <Mountain className="text-green-600" size={20} />
          ) : (
            <Car className="text-blue-600" size={20} />
          )}
          <div>
            <h3 className="font-medium">{race.name}</h3>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Calendar size={12} />
              {formatDateRange(race.date, race.endDate)} • {race.results.length} participants
              {race.organizer && ` • ${race.organizer}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(race)}
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
                <AlertDialogAction onClick={() => onDelete(race.id)}>
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

export default RaceCard;
