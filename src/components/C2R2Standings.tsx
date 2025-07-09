import { useMemo } from 'react';
import { Driver, Race } from '@/types/championship';
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
  previousStandings?: Array<{
    driver: Driver;
    position: number;
    montagnePoints: number;
    rallyePoints: number;
    totalPoints: number;
  }>;
}

const C2R2Standings = ({ 
  drivers, 
  montagneRaces, 
  rallyeRaces, 
  championshipYear, 
  previousStandings 
}: C2R2StandingsProps) => {
  const { exportCategoryStandings } = usePdfExport();

  // Calculer le classement C2 R2
  const c2r2Standings = useMemo(() => {
    return calculateC2R2Standings(drivers, montagneRaces, rallyeRaces);
  }, [drivers, montagneRaces, rallyeRaces]);

  // Combiner toutes les courses pour l'affichage du calendrier
  const allRaces = useMemo(() => {
    return [...montagneRaces, ...rallyeRaces].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [montagneRaces, rallyeRaces]);

  const handlePrintPdf = () => {
    console.log('PDF export pour C2 R2 - à implémenter');
  };

  if (c2r2Standings.length === 0) {
    return (
      <div className="space-y-6">
        <CategoryHeader displayTitle="Trophée C2 R2" championshipYear={championshipYear} />
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Aucun pilote C2 R2 trouvé dans la base de données.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Assurez-vous que les pilotes ont leur modèle de voiture renseigné (ex: "Citroën C2 R2").
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CategoryHeader displayTitle="Trophée C2 R2" championshipYear={championshipYear} />
      <RaceCalendar races={allRaces} />
      <div className="bg-orange-50 p-4 rounded-lg">
        <h3 className="font-semibold text-orange-800 mb-2">Classement C2 R2</h3>
        <div className="space-y-2">
          {c2r2Standings.map((standing, index) => (
            <div key={standing.driver.id} className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg w-8">{standing.position}</span>
                <div>
                  <span className="font-medium">{standing.driver.name}</span>
                  <div className="text-sm text-gray-500">{standing.driver.carModel}</div>
                </div>
              </div>
              <span className="font-semibold text-orange-600">{standing.totalPoints} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default C2R2Standings;