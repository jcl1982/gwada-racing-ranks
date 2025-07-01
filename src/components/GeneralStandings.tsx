
import { ChampionshipStanding } from '@/types/championship';
import { usePdfExport } from '@/hooks/usePdfExport';
import { useImageExport } from '@/hooks/useImageExport';
import { useWebPrint } from '@/hooks/useWebPrint';
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
  const { exportToImage } = useImageExport();
  const { printWebPage, printWithUnicodeSupport } = useWebPrint();

  // S'assurer que les standings sont triés par position pour l'affichage
  const sortedStandings = [...standings].sort((a, b) => a.position - b.position);

  const handlePrintPdf = () => {
    console.log('🖨️ Impression PDF demandée - Classement site web:', sortedStandings.map(s => ({
      position: s.position,
      name: s.driver.name,
      totalPoints: s.totalPoints
    })));
    
    exportGeneralStandings(sortedStandings, championshipTitle, championshipYear);
  };

  const handlePrintImage = () => {
    console.log('📸 Export image demandé - Classement général');
    exportToImage(
      'general-standings-table',
      `classement-general-${championshipYear}`,
      `${championshipTitle} - Classement Général ${championshipYear}`
    );
  };

  const handlePrintWeb = () => {
    console.log('🖨️ Impression web demandée - Classement général');
    printWebPage(
      'general-standings-table',
      `${championshipTitle} - Classement Général ${championshipYear}`
    );
  };

  const handlePrintUnicode = () => {
    console.log('🔤 Impression Unicode demandée - Classement général');
    printWithUnicodeSupport(
      'general-standings-table',
      `${championshipTitle} • Classement Général ${championshipYear} ★`,
      `
        .unicode-enhanced {
          font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1;
          text-rendering: optimizeLegibility;
        }
        .champion-row {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #1a1a1a;
          font-weight: 700;
        }
      `
    );
  };

  return (
    <div className="space-y-6">
      <GeneralStandingsHeader 
        championshipTitle={championshipTitle}
        championshipYear={championshipYear}
      />

      <GeneralStandingsTable
        standings={standings}
        championshipTitle={championshipTitle}
        championshipYear={championshipYear}
        onPrintPdf={handlePrintPdf}
        onPrintImage={handlePrintImage}
        onPrintWeb={handlePrintWeb}
        onPrintUnicode={handlePrintUnicode}
      />

      <GeneralStandingsStats standings={standings} />
    </div>
  );
};

export default GeneralStandings;
