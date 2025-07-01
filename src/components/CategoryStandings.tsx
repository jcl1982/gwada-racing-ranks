import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mountain, Car, Calendar, MapPin } from 'lucide-react';
import { Driver, Race } from '@/types/championship';
import { calculateDriverPoints, getPositionBadgeColor } from '@/utils/championship';
import PrintButton from '@/components/PrintButton';
import { usePdfExport } from '@/hooks/usePdfExport';

interface CategoryStandingsProps {
  title: string;
  races: Race[];
  drivers: Driver[];
  type: 'montagne' | 'rallye';
  championshipYear: string;
}

const CategoryStandings = ({ title, races, drivers, type, championshipYear }: CategoryStandingsProps) => {
  const { exportCategoryStandings } = usePdfExport();

  const standings = drivers
    .map(driver => ({
      driver,
      points: calculateDriverPoints(driver.id, races)
    }))
    .sort((a, b) => b.points - a.points)
    .map((standing, index) => ({
      ...standing,
      position: index + 1,
      positionChange: 0
    }));

  const Icon = type === 'montagne' ? Mountain : Car;
  const gradientClass = type === 'montagne' ? 'from-green-600 to-emerald-600' : 'from-blue-600 to-cyan-600';

  const handlePrintPdf = () => {
    exportCategoryStandings(title, races, drivers, championshipYear);
  };

  // Fonction pour obtenir les points d'un pilote pour une course spécifique
  const getDriverPointsForRace = (driverId: string, race: Race): number => {
    const result = race.results.find(r => r.driverId === driverId);
    return result?.points || 0;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-caribbean bg-clip-text text-transparent mb-2">
          {title}
        </h1>
        <p className="text-xl text-gray-600">Saison {championshipYear}</p>
      </div>

      {/* Race Calendar */}
      <Card className="card-glass p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar size={24} />
          Calendrier des Courses
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {races.map(race => (
            <div key={race.id} className="bg-white/70 rounded-lg p-4 border border-white/20">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <MapPin size={16} />
                {race.name}
              </h4>
              <p className="text-gray-600">
                {new Date(race.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Standings Table */}
      <Card className="card-glass overflow-hidden">
        <div className={`bg-gradient-to-r ${gradientClass} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon size={32} />
              <h2 className="text-2xl font-bold">Classement {title}</h2>
            </div>
            <PrintButton onClick={handlePrintPdf} variant="outline" className="bg-white/20 hover:bg-white/30 border-white/30" />
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

      {/* Top 3 Podium */}
      <div className="grid md:grid-cols-3 gap-6">
        {standings.slice(0, 3).map((standing, index) => {
          const positions = ['🥇', '🥈', '🥉'];
          const colors = ['from-yellow-400 to-yellow-600', 'from-gray-400 to-gray-600', 'from-amber-600 to-amber-800'];
          
          return (
            <Card key={standing.driver.id} className="card-glass p-6 text-center">
              <div className={`bg-gradient-to-r ${colors[index]} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl`}>
                {positions[index]}
              </div>
              <h3 className="text-lg font-bold mb-2">{standing.position}ᵉ Place</h3>
              <p className="text-xl font-bold text-gray-800">
                {standing.driver.name}
              </p>
              <p className="text-gray-600">{standing.points} points</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryStandings;
