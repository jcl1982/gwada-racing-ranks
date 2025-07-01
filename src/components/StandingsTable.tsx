
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mountain, Car } from 'lucide-react';
import { Driver, Race } from '@/types/championship';
import { getPositionBadgeColor } from '@/utils/championship';
import PrintButton from '@/components/PrintButton';
import { useImageExport } from '@/hooks/useImageExport';
import { useWebPrint } from '@/hooks/useWebPrint';

interface StandingsTableProps {
  displayTitle: string;
  races: Race[];
  type: 'montagne' | 'rallye';
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
  const { printWebPage } = useWebPrint();
  const Icon = type === 'montagne' ? Mountain : Car;
  const gradientClass = type === 'montagne' ? 'from-green-600 to-emerald-600' : 'from-blue-600 to-cyan-600';

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

  return (
    <Card className="card-glass overflow-hidden" id="category-standings-table">
      <div className={`bg-gradient-to-r ${gradientClass} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon size={32} />
            <h2 className="text-2xl font-bold">Classement {displayTitle}</h2>
          </div>
          <PrintButton 
            onPrintPdf={onPrintPdf} 
            onPrintImage={handlePrintImage}
            onPrintWeb={handlePrintWeb}
            variant="outline" 
            className="bg-white/20 hover:bg-white/30 border-white/30" 
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold">Position</th>
              <th className="text-left p-4 font-semibold">Pilote</th>
              {races.map(race => (
                <th key={race.id} className="text-center p-2 font-semibold min-w-[80px]">
                  <div className="text-xs">
                    {race.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(race.date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </div>
                </th>
              ))}
              <th className="text-center p-4 font-semibold">Total</th>
              <th className="text-center p-4 font-semibold">Écart</th>
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
                  <td className="p-4">
                    <Badge className={`${getPositionBadgeColor(standing.position)} font-bold`}>
                      {standing.position}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">
                      {standing.driver.name}
                    </div>
                  </td>
                  {races.map(race => {
                    const points = getDriverPointsForRace(standing.driver.id, race);
                    const result = race.results.find(r => r.driverId === standing.driver.id);
                    return (
                      <td key={race.id} className="p-2 text-center">
                        {points > 0 ? (
                          <div className="text-center">
                            <Badge variant="outline" className="text-xs mb-1">
                              {points} pts
                            </Badge>
                            {result && (
                              <div className="text-xs text-gray-500">
                                P{result.position}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-4 text-center">
                    <Badge className={`bg-gradient-to-r ${gradientClass} text-white font-bold`}>
                      {standing.points} pts
                    </Badge>
                  </td>
                  <td className="p-4 text-center text-gray-600">
                    {gap === 0 ? 'Leader' : `-${gap} pts`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default StandingsTable;
