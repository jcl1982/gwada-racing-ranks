
import { Mountain, Car } from 'lucide-react';
import { useMemo } from 'react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { calculateMontagneStandings, calculateRallyeStandings } from '@/utils/championship';
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

  // Calculer les standings avec les fonctions dédiées qui gèrent les évolutions
  const standings = useMemo(() => {
    if (type === 'montagne') {
      const montagneStandings = calculateMontagneStandings(drivers, races, previousStandings);
      console.log('⛰️ Standings montagne calculés:', montagneStandings.slice(0, 3).map(s => ({
        position: s.position,
        name: s.driver.name,
        points: s.montagnePoints,
        previousPosition: s.previousMontagnePosition,
        positionChange: s.positionChange
      })));
      // Mapper vers le format attendu par StandingsTable et PodiumSection
      return montagneStandings.map(s => ({
        driver: s.driver,
        points: s.montagnePoints,
        position: s.position,
        positionChange: s.positionChange,
        previousPosition: s.previousMontagnePosition
      }));
    } else if (type === 'rallye') {
      const rallyeStandings = calculateRallyeStandings(drivers, races, previousStandings);
      console.log('🏁 Standings rallye calculés:', rallyeStandings.slice(0, 3).map(s => ({
        position: s.position,
        name: s.driver.name,
        points: s.rallyePoints,
        previousPosition: s.previousRallyePosition,
        positionChange: s.positionChange
      })));
      // Mapper vers le format attendu par StandingsTable et PodiumSection
      return rallyeStandings.map(s => ({
        driver: s.driver,
        points: s.rallyePoints,
        position: s.position,
        positionChange: s.positionChange,
        previousPosition: s.previousRallyePosition
      }));
    }
    // Pour les autres types (acceleration, karting), utiliser un calcul simple
    return [];
  }, [drivers, races, type, previousStandings]);

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
