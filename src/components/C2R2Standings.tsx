import { useMemo } from 'react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { calculateC2R2Standings } from '@/utils/championship';
import { usePdfExport } from '@/hooks/usePdfExport';
import CategoryHeader from '@/components/CategoryHeader';
import RaceCalendar from '@/components/RaceCalendar';
import StandingsTable from '@/components/StandingsTable';
import PodiumSection from '@/components/PodiumSection';

interface C2R2StandingsProps {
  drivers: Driver[];
  montagneRaces: Race[];
  rallyeRaces: Race[];
  championshipYear: string;
  previousStandings?: ChampionshipStanding[];
}

const C2R2Standings = ({ 
  drivers, 
  montagneRaces, 
  rallyeRaces, 
  championshipYear, 
  previousStandings 
}: C2R2StandingsProps) => {
  const { exportCategoryStandings } = usePdfExport();

  // Calculer le classement C2 R2 avec les changements de position
  const c2r2Standings = useMemo(() => {
    return calculateC2R2Standings(drivers, montagneRaces, rallyeRaces, previousStandings);
  }, [drivers, montagneRaces, rallyeRaces, previousStandings]);

  // Combiner toutes les courses pour l'affichage du calendrier
  const allRaces = useMemo(() => {
    return [...montagneRaces, ...rallyeRaces].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [montagneRaces, rallyeRaces]);

  // Convertir ChampionshipStanding au format attendu par StandingsTable
  const formattedStandings = useMemo(() => {
    return c2r2Standings.map(standing => ({
      driver: standing.driver,
      points: standing.totalPoints,
      position: standing.position,
      positionChange: standing.positionChange,
      previousPosition: standing.previousPosition
    }));
  }, [c2r2Standings]);

  const handlePrintPdf = () => {
    exportCategoryStandings(
      'Trophée C2 R2',
      allRaces,
      drivers.filter(d => 
        d.carModel?.toLowerCase().includes('c2') && 
        d.carModel?.toLowerCase().includes('r2')
      ),
      championshipYear,
      formattedStandings
    );
  };

  if (c2r2Standings.length === 0) {
    return (
      <div className="space-y-6">
        <CategoryHeader displayTitle="Trophée C2 R2" championshipYear={championshipYear} />
        <RaceCalendar races={allRaces} />
        <div className="bg-card p-8 rounded-lg shadow-sm text-center">
          <p className="text-muted-foreground">Aucun pilote C2 R2 trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CategoryHeader displayTitle="Trophée C2 R2" championshipYear={championshipYear} />
      <RaceCalendar races={allRaces} />
      <StandingsTable 
        displayTitle="Trophée C2 R2"
        races={allRaces}
        type="c2r2"
        standings={formattedStandings}
        onPrintPdf={handlePrintPdf}
      />
      <PodiumSection standings={formattedStandings} />
    </div>
  );
};

export default C2R2Standings;