
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
  type: 'montagne' | 'rallye' | 'c2r2';
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

  console.log(`🔍 [${type}] Données pour le calcul d'évolution:`, {
    drivers: drivers.length,
    previousStandings: previousStandings?.length || 0,
    previousStandingsData: previousStandings?.slice(0, 3)
  });

  const standings = drivers
    .map(driver => {
      const points = calculateDriverPoints(driver.id, races);
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
      let previousPosition: number | undefined;
      
      if (previousStandings && previousStandings.length > 0) {
        // Calculer les positions précédentes dans cette catégorie
        const previousCategoryStandings = previousStandings
          .map(s => ({
            driver: s.driver,
            points: type === 'montagne' ? s.montagnePoints : s.rallyePoints
          }))
          .filter(s => s.points > 0) // Exclure les pilotes sans points dans cette catégorie
          .sort((a, b) => b.points - a.points);
        
        console.log(`🔍 [${type}] Classements précédents calculés:`, previousCategoryStandings.slice(0, 5));
        
        const prevIndex = previousCategoryStandings.findIndex(s => s.driver.id === standing.driver.id);
        if (prevIndex !== -1) {
          previousPosition = prevIndex + 1;
          positionChange = previousPosition - currentPosition;
          
          console.log(`🔍 [${type}] ${standing.driver.name}:`, {
            currentPosition,
            previousPosition,
            positionChange,
            currentPoints: standing.points,
            previousPoints: previousCategoryStandings[prevIndex]?.points
          });
        } else {
          console.log(`🔍 [${type}] ${standing.driver.name}: Nouveau pilote (pas de position précédente)`);
        }
      }
      
      return {
        ...standing,
        position: currentPosition,
        positionChange,
        previousPosition
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
