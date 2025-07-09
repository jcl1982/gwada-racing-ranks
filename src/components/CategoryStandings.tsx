
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
  previousStandings?: Array<{
    driver: Driver;
    position: number;
    montagnePoints: number;
    rallyePoints: number;
    totalPoints: number;
  }>;
}

const CategoryStandings = ({ title, races, drivers, type, championshipYear, previousStandings }: CategoryStandingsProps) => {
  const { exportCategoryStandings } = usePdfExport();

  const standings = drivers
    .map(driver => {
      const points = calculateDriverPoints(driver.id, races);
      
      // Trouver la position précédente du pilote dans cette catégorie
      let previousPosition: number | undefined;
      if (previousStandings) {
        const previousStanding = previousStandings.find(s => s.driver.id === driver.id);
        if (previousStanding) {
          // Pour les catégories, utiliser les points de la catégorie correspondante
          const previousCategoryPoints = type === 'montagne' 
            ? previousStanding.montagnePoints 
            : previousStanding.rallyePoints;
          
          // Calculer la position précédente basée sur les points de la catégorie
          const previousCategoryStandings = previousStandings
            .map(s => ({
              driver: s.driver,
              points: type === 'montagne' ? s.montagnePoints : s.rallyePoints
            }))
            .sort((a, b) => b.points - a.points);
          
          const prevIndex = previousCategoryStandings.findIndex(s => s.driver.id === driver.id);
          previousPosition = prevIndex !== -1 ? prevIndex + 1 : undefined;
        }
      }
      
      return {
        driver,
        points
      };
    })
    .sort((a, b) => b.points - a.points)
    .map((standing, index) => {
      const currentPosition = index + 1;
      
      // Calculer le changement de position
      let positionChange = 0;
      if (previousStandings) {
        const previousStanding = previousStandings.find(s => s.driver.id === standing.driver.id);
        if (previousStanding) {
          // Calculer la position précédente dans cette catégorie
          const previousCategoryStandings = previousStandings
            .map(s => ({
              driver: s.driver,
              points: type === 'montagne' ? s.montagnePoints : s.rallyePoints
            }))
            .sort((a, b) => b.points - a.points);
          
          const prevIndex = previousCategoryStandings.findIndex(s => s.driver.id === standing.driver.id);
          const previousPosition = prevIndex !== -1 ? prevIndex + 1 : undefined;
          
          if (previousPosition) {
            positionChange = previousPosition - currentPosition;
          }
        }
      }
      
      return {
        ...standing,
        position: currentPosition,
        positionChange,
        previousPosition: undefined // On garde undefined car on calcule directement le change
      };
    });

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
