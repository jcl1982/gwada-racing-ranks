
import { Card } from '@/components/ui/card';
import { Users, Trophy, Mountain, Car, Star } from 'lucide-react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';

interface AdminStatsProps {
  drivers: Driver[];
  montagneRaces: Race[];
  rallyeRaces: Race[];
  standings: ChampionshipStanding[];
}

const AdminStats = ({ drivers, montagneRaces, rallyeRaces, standings }: AdminStatsProps) => {
  const totalRaces = montagneRaces.length + rallyeRaces.length;
  const totalParticipants = drivers.length;
  const topDriver = standings[0];
  
  const stats = [
    {
      title: 'Total Pilotes',
      value: totalParticipants,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Total Courses',
      value: totalRaces,
      icon: Trophy,
      color: 'text-purple-600'
    },
    {
      title: 'Courses de Côte',
      value: montagneRaces.length,
      icon: Mountain,
      color: 'text-green-600'
    },
    {
      title: 'Rallyes',
      value: rallyeRaces.length,
      icon: Car,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Statistiques Générales</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`${stat.color} w-8 h-8`} />
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {topDriver && (
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Star className="text-yellow-500 w-8 h-8" />
            <div>
              <h3 className="text-lg font-semibold">Leader du Championnat</h3>
              <p className="text-gray-600">{topDriver.driver.name}</p>
              <p className="text-sm text-gray-500">{topDriver.totalPoints} points</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dernières Courses</h3>
        <div className="space-y-3">
          {[...montagneRaces, ...rallyeRaces]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map((race) => (
              <div key={race.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {race.type === 'montagne' ? (
                    <Mountain className="text-green-600" size={20} />
                  ) : (
                    <Car className="text-blue-600" size={20} />
                  )}
                  <div>
                    <p className="font-medium">{race.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(race.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {race.results.length} participants
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminStats;
