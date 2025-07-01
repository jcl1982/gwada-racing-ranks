
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Mountain, Car } from 'lucide-react';
import { ChampionshipStanding } from '@/types/championship';
import { getPositionBadgeColor } from '@/utils/championship';
import PositionChange from '@/components/PositionChange';
import PrintButton from '@/components/PrintButton';
import { usePdfExport } from '@/hooks/usePdfExport';

interface GeneralStandingsProps {
  standings: ChampionshipStanding[];
  championshipTitle: string;
  championshipYear: string;
}

const GeneralStandings = ({ standings, championshipTitle, championshipYear }: GeneralStandingsProps) => {
  const { exportGeneralStandings } = usePdfExport();

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

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-caribbean bg-clip-text text-transparent mb-2">
          {championshipTitle}
        </h1>
        <p className="text-xl text-gray-600">Classement Général {championshipYear}</p>
      </div>

      <Card className="card-glass overflow-hidden">
        <div className="gradient-ocean p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy size={32} />
              <h2 className="text-2xl font-bold">Classement Général</h2>
            </div>
            <PrintButton onClick={handlePrintPdf} variant="outline" className="bg-white/20 hover:bg-white/30 border-white/30" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold">Position</th>
                <th className="text-left p-4 font-semibold">Évolution</th>
                <th className="text-left p-4 font-semibold">Pilote</th>
                <th className="text-center p-4 font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <Mountain size={16} />
                    <span>Montagne</span>
                  </div>
                </th>
                <th className="text-center p-4 font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <Car size={16} />
                    <span>Rallye</span>
                  </div>
                </th>
                <th className="text-center p-4 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {sortedStandings.map((standing, index) => (
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
                    <PositionChange change={standing.positionChange} />
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">
                      {standing.driver.name}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant="outline" className="bg-green-50 border-green-200">
                      {standing.montagnePoints} pts
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant="outline" className="bg-blue-50 border-blue-200">
                      {standing.rallyePoints} pts
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold">
                      {standing.totalPoints} pts
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="card-glass p-6 text-center">
          <div className="gradient-caribbean w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="text-white" size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2">Leader du Championnat</h3>
          <p className="text-2xl font-bold text-blue-600">
            {sortedStandings[0]?.driver.name}
          </p>
          <p className="text-gray-600">{sortedStandings[0]?.totalPoints} points</p>
        </Card>

        <Card className="card-glass p-6 text-center">
          <div className="gradient-ocean w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mountain className="text-white" size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2">Meilleur en Montagne</h3>
          <p className="text-2xl font-bold text-green-600">
            {sortedStandings.sort((a, b) => b.montagnePoints - a.montagnePoints)[0]?.driver.name}
          </p>
          <p className="text-gray-600">
            {sortedStandings.sort((a, b) => b.montagnePoints - a.montagnePoints)[0]?.montagnePoints} points
          </p>
        </Card>

        <Card className="card-glass p-6 text-center">
          <div className="bg-gradient-to-r from-red-500 to-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="text-white" size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2">Meilleur en Rallye</h3>
          <p className="text-2xl font-bold text-red-600">
            {sortedStandings.sort((a, b) => b.rallyePoints - a.rallyePoints)[0]?.driver.name}
          </p>
          <p className="text-gray-600">
            {sortedStandings.sort((a, b) => b.rallyePoints - a.rallyePoints)[0]?.rallyePoints} points
          </p>
        </Card>
      </div>
    </div>
  );
};

export default GeneralStandings;
