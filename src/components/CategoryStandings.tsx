
import { Driver, Race } from '@/types/championship';
import { calculateDriverPoints } from '@/utils/championship';
import { usePdfExport } from '@/hooks/usePdfExport';
import CategoryHeader from '@/components/CategoryHeader';
import RaceCalendar from '@/components/RaceCalendar';
import CategoryStandingsTable from '@/components/CategoryStandingsTable';
import TopThreePodium from '@/components/TopThreePodium';

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
      positionChange: 0
    }));

  const handlePrintPdf = () => {
    exportCategoryStandings(title, races, drivers, championshipYear);
  };

  return (
    <div className="space-y-6">
      <CategoryHeader title={title} championshipYear={championshipYear} />
      
      <RaceCalendar races={races} />
      
      <CategoryStandingsTable
        title={title}
        races={races}
        standings={standings}
        type={type}
        onPrintPdf={handlePrintPdf}
      />
      
      <TopThreePodium standings={standings} />
    </div>
  );
};

export default CategoryStandings;
