
import { Mountain, Car } from 'lucide-react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
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
  type: 'montagne' | 'rallye' | 'c2r2' | 'acceleration' | 'karting';
  championshipYear: string;
  previousStandings?: ChampionshipStanding[];
}

const CategoryStandings = ({ title, races, drivers, type, championshipYear, previousStandings }: CategoryStandingsProps) => {
  const { exportCategoryStandings } = usePdfExport();

  console.log(`🔍 [${type}] Données pour le calcul d'évolution:`, {
    drivers: drivers.length,
    previousStandings: previousStandings?.length || 0,
    previousStandingsData: previousStandings?.slice(0, 3)
  });

  const standings = drivers
    .map(driver => {
      const points = calculateDriverPoints(driver.id, races);
      
      // Trouver la position précédente selon le type de classement
      const previousStanding = previousStandings?.find(s => s.driver.id === driver.id);
      const previousPosition = type === 'montagne' 
        ? previousStanding?.previousMontagnePosition 
        : previousStanding?.previousRallyePosition;
      
      return {
        driver,
        points,
        previousPosition
      };
    })
    .sort((a, b) => {
      // Tri stable: par points (décroissant), puis par nom (alphabétique)
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return a.driver.name.localeCompare(b.driver.name);
    })
    .map((standing, index) => {
      const currentPosition = index + 1;
      const positionChange = standing.previousPosition 
        ? standing.previousPosition - currentPosition 
        : 0;
      
      console.log(`🔍 [${type}] ${standing.driver.name}:`, {
        currentPosition,
        previousPosition: standing.previousPosition,
        positionChange,
        currentPoints: standing.points
      });
      
      return {
        ...standing,
        position: currentPosition,
        positionChange
      };
    });

  // Remplacer les titres pour les catégories
  const displayTitle = type === 'montagne' ? 'Trophée de la Montagne' : 
                      type === 'c2r2' ? 'Trophée C2 R2' : 
                      'Trophée des Rallyes';

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
