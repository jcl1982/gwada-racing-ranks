
import { ChampionshipStanding } from '@/types/championship';
import { usePdfExport } from '@/hooks/usePdfExport';
import GeneralStandingsHeader from '@/components/GeneralStandingsHeader';
import GeneralStandingsTable from '@/components/GeneralStandingsTable';
import GeneralStandingsStats from '@/components/GeneralStandingsStats';

interface GeneralStandingsProps {
  standings: ChampionshipStanding[];
  championshipTitle: string;
  championshipYear: string;
}

const GeneralStandings = ({ standings, championshipTitle, championshipYear }: GeneralStandingsProps) => {
  const { exportGeneralStandings } = usePdfExport();

  console.log('🔍 [GeneralStandings] Données reçues:', {
    standings: standings.length,
    standingsData: standings.slice(0, 3).map(s => ({
      position: s.position,
      name: s.driver.name,
      totalPoints: s.totalPoints,
      positionChange: s.positionChange,
      previousPosition: s.previousPosition
    }))
  });

  // S'assurer que les standings sont triés par position pour l'affichage
  const sortedStandings = [...standings].sort((a, b) => a.position - b.position);

  const handlePrintPdf = () => {
    console.log('🖨️ Impression PDF demandée - Classement site web:', sortedStandings.map(s => ({
      position: s.position,
      name: s.driver.name,
      totalPoints: s.totalPoints
    })));
    
    // Utiliser le titre complet pour l'export PDF
    exportGeneralStandings(sortedStandings, championshipTitle, "Classement Général Provisoire de la LSAG", championshipYear);
  };

  return (
    <div className="space-y-6">
      <GeneralStandingsHeader 
        championshipTitle={championshipTitle}
        championshipYear={championshipYear}
      />

      <GeneralStandingsTable
        standings={sortedStandings}
        championshipTitle={championshipTitle}
        championshipYear={championshipYear}
        onPrintPdf={handlePrintPdf}
      />

      <GeneralStandingsStats standings={sortedStandings} />
    </div>
  );
};

export default GeneralStandings;
