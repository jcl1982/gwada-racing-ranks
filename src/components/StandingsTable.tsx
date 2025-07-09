import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mountain, Car } from 'lucide-react';
import { Driver, Race } from '@/types/championship';
import { getPositionBadgeColor } from '@/utils/championship';
import PrintButton from '@/components/PrintButton';
import Logo from '@/components/Logo';
import PositionChange from '@/components/PositionChange';
import { useImageExport } from '@/hooks/useImageExport';
import { useWebPrint } from '@/hooks/useWebPrint';

interface StandingsTableProps {
  displayTitle: string;
  races: Race[];
  type: 'montagne' | 'rallye' | 'c2r2';
  standings: Array<{
    driver: Driver;
    points: number;
    position: number;
    positionChange?: number;
    previousPosition?: number;
  }>;
  onPrintPdf: () => void;
}

const StandingsTable = ({ displayTitle, races, type, standings, onPrintPdf }: StandingsTableProps) => {
  const { exportToImage } = useImageExport();
  const { printWebPage, printWithUnicodeSupport } = useWebPrint();
  const Icon = type === 'montagne' ? Mountain : Car;
  const gradientClass = type === 'montagne' ? 'from-green-600 to-emerald-600' : 
                       type === 'c2r2' ? 'from-orange-600 to-red-600' : 
                       'from-blue-600 to-cyan-600';

  // Fonction pour obtenir les points d'un pilote pour une course spécifique
  const getDriverPointsForRace = (driverId: string, race: Race): number => {
    const result = race.results.find(r => r.driverId === driverId);
    return result?.points || 0;
  };

  const handlePrintImage = () => {
    console.log('📸 Export image demandé - Classement catégorie:', displayTitle);
    const filename = displayTitle.toLowerCase().replace(/\s+/g, '-');
    exportToImage(
      'category-standings-table',
      `${filename}-2024`,
      `${displayTitle} - Saison 2024`
    );
  };

  const handlePrintWeb = () => {
    console.log('🖨️ Impression web demandée - Classement catégorie:', displayTitle);
    printWebPage(
      'category-standings-table',
      `${displayTitle} - Saison 2024`
    );
  };

  const handlePrintUnicode = () => {
    console.log('🔤 Impression Unicode demandée - Classement catégorie:', displayTitle);
    printWithUnicodeSupport(
      'category-standings-table',
      `${displayTitle} - Saison 2024 • Classement avec caractères spéciaux ✓`,
      `
        .unicode-enhanced {
          font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1;
          text-rendering: optimizeLegibility;
        }
        .position-badge {
          font-variant-numeric: tabular-nums;
        }
      `
    );
  };

  return (
    <Card className="card-glass overflow-hidden" id="category-standings-table">
      <div className={`bg-gradient-to-r ${gradientClass} p-6 text-white relative`}>
        {/* Logo de la ligue (haut gauche) */}
        <Logo 
          src="/lovable-uploads/a51e24a3-77b9-4a08-a1b1-c446ea39eb10.png" 
          alt="Logo Ligue Sport Automobile Guadeloupe" 
          className="absolute top-4 left-4 w-12 h-12 object-contain"
          removeBackground={false}
        />
        
        {/* Logo de la fédération (haut droite) */}
        <Logo 
          src="/lovable-uploads/b4f87f86-04ce-4966-aca2-cd5ab7745508.png" 
          alt="Logo FFSA" 
          className="absolute top-4 right-4 w-12 h-12 object-contain"
          removeBackground={false}
        />

        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Icon size={32} />
            <h2 className="text-2xl font-bold">Classement provisoire {displayTitle}</h2>
          </div>
        </div>
        
        <div className="absolute top-6 right-20">
          <PrintButton 
            onPrintPdf={onPrintPdf} 
            onPrintImage={handlePrintImage}
            onPrintWeb={handlePrintWeb}
            onPrintUnicode={handlePrintUnicode}
            variant="outline" 
            className="bg-white/20 hover:bg-white/30 border-white/30 no-print" 
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-1 px-1 font-semibold">Position</th>
              <th className="text-left py-1 px-1 font-semibold">Évolution</th>
              <th className="text-left py-1 px-1 font-semibold">Pilote</th>
              {races.map(race => (
                <th key={race.id} className="text-center py-1 px-1 font-semibold min-w-[80px]">
                  <div className="text-xs">
                    {race.name}
                  </div>
                </th>
              ))}
              <th className="text-center py-1 px-1 font-semibold">Total</th>
              <th className="text-center py-1 px-1 font-semibold">Écart</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => {
              const gap = standings[0].points - standing.points;
              return (
                <tr
                  key={standing.driver.id}
                  className={`border-b transition-colors hover:bg-blue-50/50 ${
                    index % 2 === 0 ? 'bg-white/50' : 'bg-white/30'
                  }`}
                >
                  <td className="py-1 px-1">
                    <Badge className={`${getPositionBadgeColor(standing.position)} font-bold position-badge`}>
                      {standing.position}
                    </Badge>
                  </td>
                  <td className="py-1 px-1">
                    <PositionChange change={standing.positionChange || 0} />
                  </td>
                  <td className="py-1 px-1">
                    <div className="font-semibold text-gray-900 unicode-enhanced">
                      {standing.driver.name}
                    </div>
                  </td>
                  {races.map(race => {
                    const points = getDriverPointsForRace(standing.driver.id, race);
                    return (
                      <td key={race.id} className="py-1 px-1 text-center">
                        {points > 0 ? (
                          <Badge variant="outline" className="text-xs">
                            {points} pts
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-1 px-1 text-center">
                    <Badge className="bg-slate-400 hover:bg-slate-500 text-white font-bold">
                      {standing.points} pts
                    </Badge>
                  </td>
                  <td className="py-1 px-1 text-center text-gray-600">
                    {gap === 0 ? 'Leader' : `-${gap} pts`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pied de page avec texte d'affiliation */}
      <div className="bg-gray-50 px-4 py-3 border-t">
        <div className="text-center text-xs text-gray-600 leading-relaxed">
          <div className="font-semibold">Affilié à la Fédération Française du Sport Automobile sous le code 21</div>
          <div>Déclaré au J.O N°Y0046 DU 15/11/2014 sous le n°01987</div>
          <div>Agréée par le Ministère de la Ville, de la Jeunesse et des Sports sous Je N° RNA: W9G2003313</div>
        </div>
      </div>
    </Card>
  );
};

export default StandingsTable;
