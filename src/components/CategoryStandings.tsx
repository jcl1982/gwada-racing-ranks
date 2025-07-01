
import { Mountain, Car } from 'lucide-react';
import { Driver, Race } from '@/types/championship';
import { calculateDriverPoints } from '@/utils/championship';
import { usePdfExport } from '@/hooks/usePdfExport';
import CategoryHeader from '@/components/CategoryHeader';
import RaceCalendar from '@/components/RaceCalendar';
import StandingsTable from '@/components/StandingsTable';
import PodiumSection from '@/components/PodiumSection';

interface CategoryStandingsProps {
  title: string;
  races: Race[];
  drivers: Driver[];
  type: 'montagne' | 'rallye';
  championshipYear: string;
}

const CategoryStandings = ({ title, races, drivers, type, championshipYear }: CategoryStandingsProps) => {
  const { exportCategoryStandings } = usePdfExport();

  const standings = drivers
    .map(driver => ({
      driver,
      points: calculateDriverPoints(driver.id, races)
    }))
    .sort((a, b) => b.points - a.points)
    .map((standing, index) => ({
      ...standing,
      position: index + 1,
      positionChange: 0,
      previousPosition: undefined
    }));

  // Remplacer les titres pour les deux catégories
  const displayTitle = type === 'montagne' ? 'Trophée de la Montagne' : 'Trophée des Rallyes';

  const handlePrintPdf = () => {
    // Passe les classements déjà calculés au PDF pour garantir la cohérence
    exportCategoryStandings(displayTitle, races, drivers, championshipYear, standings);
  };

  return (
    <div className="space-y-6">
      <CategoryHeader displayTitle={displayTitle} championshipYear={championshipYear} />
      <RaceCalendar races={races} />
      <StandingsTable 
        displayTitle={displayTitle}
        races={races}
        type={type}
        standings={standings}
        onPrintPdf={handlePrintPdf}
      />
      <PodiumSection standings={standings} />
    </div>
  );
};

export default CategoryStandings;
