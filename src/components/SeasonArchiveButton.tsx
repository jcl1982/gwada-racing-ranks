
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Archive, Loader2 } from 'lucide-react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { useSeasonArchives } from '@/hooks/useSeasonArchives';
import { StandingsTitles } from '@/hooks/useChampionshipConfig';

interface SeasonArchiveButtonProps {
  championshipId: string;
  championshipTitle: string;
  championshipYear: string;
  drivers: Driver[];
  races: Race[];
  standings: Record<string, ChampionshipStanding[]>;
  standingsTitles?: StandingsTitles;
}

const SeasonArchiveButton = ({
  championshipId,
  championshipTitle,
  championshipYear,
  drivers,
  races,
  standings,
  standingsTitles,
}: SeasonArchiveButtonProps) => {
  const { archiveSeason } = useSeasonArchives();
  const [archiving, setArchiving] = useState(false);

  const handleArchive = async () => {
    setArchiving(true);
    try {
      await archiveSeason(
        championshipId,
        championshipTitle,
        championshipYear,
        drivers,
        races,
        standings,
        { standingsTitles: standingsTitles || {} }
      );
    } finally {
      setArchiving(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2" disabled={archiving}>
          {archiving ? <Loader2 size={18} className="animate-spin" /> : <Archive size={18} />}
          Archiver la saison
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archiver la saison</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action va créer une copie complète des classements, pilotes et courses de la saison "{championshipTitle} {championshipYear}". 
            Les données actuelles ne seront pas modifiées. Vous pourrez consulter et exporter cette archive ultérieurement.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive}>
            Archiver
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SeasonArchiveButton;
