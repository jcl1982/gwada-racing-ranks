
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import SeasonArchiveButton from '@/components/SeasonArchiveButton';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { StandingsTitles } from '@/hooks/useChampionshipConfig';

interface AdminHeaderProps {
  onReset: () => void;
  championshipId?: string;
  championshipTitle: string;
  championshipYear: string;
  drivers: Driver[];
  races: Race[];
  standings: Record<string, ChampionshipStanding[]>;
  standingsTitles?: StandingsTitles;
}

const AdminHeader = ({ onReset, championshipId, championshipTitle, championshipYear, drivers, races, standings, standingsTitles }: AdminHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold gradient-text">Administration</h1>
      <div className="flex items-center gap-2">
        {championshipId && (
          <SeasonArchiveButton
            championshipId={championshipId}
            championshipTitle={championshipTitle}
            championshipYear={championshipYear}
            drivers={drivers}
            races={races}
            standings={standings}
            standingsTitles={standingsTitles}
          />
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex items-center gap-2">
              <Trash2 size={18} />
              Réinitialiser
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la réinitialisation</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action supprimera tous les pilotes et courses. Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={onReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Réinitialiser
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminHeader;
