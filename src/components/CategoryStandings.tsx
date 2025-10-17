
import { useMemo } from 'react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { usePdfExport } from '@/hooks/usePdfExport';
import { useStandingsCalculation } from '@/hooks/useStandingsCalculation';
import { toSimplifiedStandings } from '@/utils/standingsConverter';
import CategoryHeader from '@/components/CategoryHeader';
import RaceCalendar from '@/components/RaceCalendar';
import StandingsTable from '@/components/StandingsTable';
import PodiumSection from '@/components/PodiumSection';

interface CategoryStandingsProps {
  title: string;
  races: Race[];
  drivers: Driver[];
  type: 'montagne' | 'rallye' | 'r2' | 'acceleration' | 'karting';
  championshipYear: string;
  championshipId: string;
  previousStandings?: ChampionshipStanding[];
}

const CategoryStandings = ({ 
  title, 
  races, 
  drivers, 
  type, 
  championshipYear, 
  championshipId,
  previousStandings 
}: CategoryStandingsProps) => {
  const { exportCategoryStandings } = usePdfExport();

  // Séparer les courses par type pour le calcul centralisé
  const montagneRaces = useMemo(() => 
    races.filter(r => r.type === 'montagne'),
    [races]
  );

  const rallyeRaces = useMemo(() => 
    races.filter(r => r.type === 'rallye'),
    [races]
  );

  // Utiliser le hook centralisé pour calculer les standings
  const { montagneStandings, rallyeStandings } = useStandingsCalculation({
    drivers,
    montagneRaces,
    rallyeRaces,
    previousStandings,
    championshipId
  });

  // Sélectionner et convertir les standings appropriés selon le type
  const standings = useMemo(() => {
    if (type === 'montagne') {
      console.log('⛰️ Standings montagne:', montagneStandings.slice(0, 3));
      return toSimplifiedStandings(montagneStandings, 'montagne');
    } else if (type === 'rallye') {
      console.log('🏁 Standings rallye:', rallyeStandings.slice(0, 3));
      return toSimplifiedStandings(rallyeStandings, 'rallye');
    }
    // Pour les autres types (acceleration, karting), retourner vide
    return [];
  }, [type, montagneStandings, rallyeStandings]);

  // Remplacer les titres pour les catégories
  const displayTitle = type === 'montagne' ? 'Trophée de la Montagne' : 
                      type === 'r2' ? 'Trophée R2' : 
                      'Trophée des Rallyes';

  const handlePrintPdf = () => {
    // Passe les classements déjà calculés au PDF pour garantir la cohérence
    exportCategoryStandings(displayTitle, races, drivers, championshipYear, standings);
  };

  return (
    <div className="space-y-6">
      <CategoryHeader displayTitle={displayTitle} championshipYear={championshipYear} />
      <RaceCalendar races={races} driverIds={drivers.map(d => d.id)} />
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
