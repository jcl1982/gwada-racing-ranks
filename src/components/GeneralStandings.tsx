
import { ChampionshipStanding } from '@/types/championship';
import { usePdfExport } from '@/hooks/usePdfExport';
import { useImageExport } from '@/hooks/useImageExport';
import { useWebPrint } from '@/hooks/useWebPrint';
import { useExcelExport } from '@/hooks/useExcelExport';
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
  const { exportGeneralToExcel } = useExcelExport();

  console.log('🔍 [GeneralStandings] Données reçues:', {
    standings: standings.length,
    standingsData: standings.slice(0, 3).map(s => ({
      position: s.position,
      name: s.driver.name,
      totalPoints: s.totalPoints
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

  const handlePrintImage = () => {
    console.log('📸 Export image demandé - Classement général provisoire');
    exportToImage(
      'general-standings-table',
      `classement-general-provisoire-${championshipYear}`,
      `${championshipTitle} - Classement Général Provisoire ${championshipYear}`
    );
  };

  const handlePrintWeb = () => {
    console.log('🖨️ Impression web demandée - Classement général provisoire');
    printWebPage(
      'general-standings-table',
      `${championshipTitle} - Classement Général Provisoire ${championshipYear}`
    );
  };

  const handlePrintUnicode = () => {
    console.log('🔤 Impression Unicode demandée - Classement général provisoire');
    printWithUnicodeSupport(
      'general-standings-table',
      `${championshipTitle} • Classement Général Provisoire ${championshipYear} ★`,
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

  const handleExportExcel = () => {
    console.log('📊 Export Excel demandé - Classement général provisoire');
    exportGeneralToExcel(sortedStandings, championshipTitle, championshipYear);
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
        onPrintImage={handlePrintImage}
        onPrintWeb={handlePrintWeb}
        onPrintUnicode={handlePrintUnicode}
        onPrintExcel={handleExportExcel}
      />

      <GeneralStandingsStats standings={sortedStandings} />
    </div>
  );
};

export default GeneralStandings;
