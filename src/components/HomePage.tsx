
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Mountain, Car, Calendar, Users, Award } from 'lucide-react';
import { ChampionshipStanding, Race } from '@/types/championship';

interface HomePageProps {
  standings: ChampionshipStanding[];
  championshipTitle: string;
  championshipYear: string;
  montagneRaces: Race[];
  rallyeRaces: Race[];
}

const HomePage = ({ standings, championshipTitle, championshipYear, montagneRaces, rallyeRaces }: HomePageProps) => {
  const leader = standings[0];
  const totalDrivers = standings.length;
  const totalRaces = montagneRaces.length + rallyeRaces.length;
  const totalMontagneRaces = montagneRaces.length;
  const totalRallyeRaces = rallyeRaces.length;

  // Obtenir les courses les plus récentes pour les actualités
  const allRaces = [...montagneRaces, ...rallyeRaces].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const recentRaces = allRaces.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-5xl md:text-6xl font-bold gradient-caribbean bg-clip-text text-transparent mb-4">
          {championshipTitle}
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          {championshipYear}
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Suivez les performances de nos pilotes à travers les courses de côte et les rallyes 
          de l'archipel guadeloupéen
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="card-glass p-6 text-center">
          <div className="gradient-caribbean w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-white" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{totalDrivers}</h3>
          <p className="text-gray-600">Pilotes</p>
        </Card>

        <Card className="card-glass p-6 text-center">
          <div className="gradient-ocean w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-white" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{totalRaces}</h3>
          <p className="text-gray-600">Courses</p>
        </Card>

        <Card className="card-glass p-6 text-center">
          <div className="bg-gradient-to-r from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mountain className="text-white" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{totalMontagneRaces}</h3>
          <p className="text-gray-600">Courses de Côte</p>
        </Card>

        <Card className="card-glass p-6 text-center">
          <div className="bg-gradient-to-r from-red-500 to-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="text-white" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{totalRallyeRaces}</h3>
          <p className="text-gray-600">Rallyes</p>
        </Card>
      </div>

      {/* Current Leader */}
      {leader && (
        <Card className="card-glass overflow-hidden">
          <div className="gradient-caribbean p-8 text-white text-center">
            <Trophy size={48} className="mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2">Leader du Championnat</h3>
            <h4 className="text-4xl font-bold mb-2">{leader.driver.name}</h4>
            <p className="text-xl opacity-90">{leader.driver.team}</p>
            <div className="mt-4">
              <Badge className="bg-white text-blue-600 text-lg px-4 py-2 font-bold">
                {leader.totalPoints} points
              </Badge>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Mountain size={20} className="text-green-600" />
                  <h5 className="font-semibold">Courses de Côte</h5>
                </div>
                <p className="text-2xl font-bold text-green-600">{leader.montagnePoints} pts</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Car size={20} className="text-blue-600" />
                  <h5 className="font-semibold">Rallyes</h5>
                </div>
                <p className="text-2xl font-bold text-blue-600">{leader.rallyePoints} pts</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Top 3 */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <Award size={28} />
          Top 3 du Championnat
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {standings.slice(0, 3).map((standing, index) => {
            const positions = ['🥇', '🥈', '🥉'];
            const colors = [
              'from-yellow-400 to-yellow-600',
              'from-gray-400 to-gray-600',
              'from-amber-600 to-amber-800'
            ];
            
            return (
              <Card key={standing.driver.id} className="card-glass p-6 text-center hover:scale-105 transition-transform duration-300">
                <div className={`bg-gradient-to-r ${colors[index]} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl`}>
                  {positions[index]}
                </div>
                <h4 className="text-xl font-bold mb-2">{standing.driver.name}</h4>
                <p className="text-gray-600 mb-3">{standing.driver.team}</p>
                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg px-3 py-1">
                  {standing.totalPoints} points
                </Badge>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-green-600 font-semibold">{standing.montagnePoints}</span>
                    <span className="text-gray-500"> mont.</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-semibold">{standing.rallyePoints}</span>
                    <span className="text-gray-500"> rallye</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent News */}
      <Card className="card-glass p-6">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Calendar size={24} />
          Actualités du Championnat
        </h3>
        <div className="space-y-4">
          {recentRaces.length > 0 ? (
            recentRaces.map((race, index) => (
              <div key={race.id} className={`border-l-4 ${race.type === 'rallye' ? 'border-blue-500' : 'border-green-500'} pl-4`}>
                <h4 className="font-semibold">
                  {race.name} - {race.type === 'rallye' ? 'Rallye' : 'Course de Côte'}
                </h4>
                <p className="text-gray-600 text-sm">
                  {race.results.length > 0 && standings.find(s => s.driver.id === race.results[0]?.driverId) ? 
                    `Victoire de ${standings.find(s => s.driver.id === race.results[0]?.driverId)?.driver.name}` :
                    'Course terminée'
                  }
                </p>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Aucune course programmée pour le moment.</p>
              <p className="text-sm mt-2">Les actualités apparaîtront ici dès qu'il y aura des courses.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default HomePage;
