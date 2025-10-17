import { useMemo } from 'react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { useStandingsCalculation } from '@/hooks/useStandingsCalculation';
import { toSimplifiedStandings } from '@/utils/standingsConverter';

// Parse une date YYYY-MM-DD en Date locale sans décalage de fuseau horaire
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}
import { usePdfExport } from '@/hooks/usePdfExport';
import CategoryHeader from '@/components/CategoryHeader';
import RaceCalendar from '@/components/RaceCalendar';
import StandingsTable from '@/components/StandingsTable';
import PodiumSection from '@/components/PodiumSection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface R2StandingsProps {
  drivers: Driver[];
  montagneRaces: Race[];
  rallyeRaces: Race[];
  championshipYear: string;
  championshipId: string;
  previousStandings?: ChampionshipStanding[];
}

const R2Standings = ({ 
  drivers, 
  montagneRaces, 
  rallyeRaces, 
  championshipYear,
  championshipId,
  previousStandings 
}: R2StandingsProps) => {
  const { exportCategoryStandings } = usePdfExport();

  // Utiliser le hook centralisé pour calculer les standings R2
  const { r2Standings } = useStandingsCalculation({
    drivers,
    montagneRaces,
    rallyeRaces,
    previousStandings,
    championshipId
  });

  // Combiner toutes les courses pour l'affichage du calendrier
  const allRaces = useMemo(() => {
    return [...montagneRaces, ...rallyeRaces].sort((a, b) => 
      parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime()
    );
  }, [montagneRaces, rallyeRaces]);

  // Convertir ChampionshipStanding au format simplifié
  const formattedStandings = useMemo(() => {
    return toSimplifiedStandings(r2Standings, 'r2');
  }, [r2Standings]);
  
  // Extraire les IDs des pilotes R2
  const r2DriverIds = useMemo(() => 
    r2Standings.map(s => s.driver.id),
    [r2Standings]
  );

  const handlePrintPdf = () => {
    // Filtrer les pilotes qui ont au moins couru avec une C2 R2
    const r2Drivers = drivers.filter(driver => {
      const hasR2Profile = driver.carModel?.toLowerCase().includes('c2') && 
                             driver.carModel?.toLowerCase().includes('r2');
      const hasR2Results = allRaces.some(race => 
        race.results.some(result => 
          result.driverId === driver.id && 
          result.carModel?.toLowerCase().includes('c2') && 
          result.carModel?.toLowerCase().includes('r2')
        )
      );
      return hasR2Profile || hasR2Results;
    });
    
    exportCategoryStandings(
      'Trophée R2',
      allRaces,
      r2Drivers,
      championshipYear,
      formattedStandings
    );
  };

  if (r2Standings.length === 0) {
    return (
      <div className="space-y-6">
        <CategoryHeader displayTitle="Trophée R2" championshipYear={championshipYear} />
      <RaceCalendar races={allRaces} driverIds={r2DriverIds} />
        <div className="bg-card p-8 rounded-lg shadow-sm text-center">
          <p className="text-muted-foreground">Aucun pilote R2 trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CategoryHeader displayTitle="Trophée R2" championshipYear={championshipYear} />
      <RaceCalendar races={allRaces} driverIds={r2DriverIds} />
      <Alert className="bg-primary/10 border-primary/30 text-primary">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          <strong>Règlement du Trophée R2 :</strong> Seules les courses disputées avec une Citroën C2 R2 sont prises en compte pour ce classement. 
          Les points marqués avec d'autres véhicules n'entrent pas dans le calcul du trophée.
        </AlertDescription>
      </Alert>
      <StandingsTable 
        displayTitle="Trophée R2"
        races={allRaces}
        type="r2"
        standings={formattedStandings}
        onPrintPdf={handlePrintPdf}
      />
      <PodiumSection standings={formattedStandings} />
    </div>
  );
};

export default R2Standings;
