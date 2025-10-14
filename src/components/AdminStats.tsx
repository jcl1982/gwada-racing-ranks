import { Card } from '@/components/ui/card';
import { Users, Trophy, Mountain, Car, Star, Zap } from 'lucide-react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';

// Parse une date YYYY-MM-DD en Date locale sans décalage de fuseau horaire
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

interface AdminStatsProps {
  drivers: Driver[];
  races: Race[];
  standings: ChampionshipStanding[];
  championshipType?: string;
}

const AdminStats = ({ drivers, races, standings, championshipType }: AdminStatsProps) => {
  const totalRaces = races.length;
  const totalPilotes = drivers.filter(d => d.driverRole === 'pilote').length;
  const totalCopilotes = drivers.filter(d => d.driverRole === 'copilote').length;
  const isKarting = championshipType === 'karting';
  
  // Pour le karting, calculer les meilleurs pilotes par catégorie
  const getKartingTopDrivers = () => {
    if (!isKarting) return [];
    
    const categories = ['MINI 60', 'SENIOR MASTER GENTLEMAN', 'KZ2'];
    return categories.map(category => {
      const categoryRaces = races.filter(r => r.type === 'karting');
      const driverPoints = new Map<string, number>();
      
      categoryRaces.forEach(race => {
        race.results.forEach(result => {
          const resultCategory = result.category?.toLowerCase() || '';
          const searchCategory = category.toLowerCase();
          
          let isMatchingCategory = false;
          if (searchCategory.includes('mini') && searchCategory.includes('60')) {
            isMatchingCategory = resultCategory.includes('mini') && resultCategory.includes('60');
          } else if (searchCategory.includes('senior')) {
            isMatchingCategory = resultCategory.includes('senior') || 
                               resultCategory.includes('master') || 
                               resultCategory.includes('gentleman');
          } else if (searchCategory.includes('kz2')) {
            isMatchingCategory = resultCategory.includes('kz2') || resultCategory.includes('kz 2');
          }
          
          if (isMatchingCategory) {
            const current = driverPoints.get(result.driverId) || 0;
            driverPoints.set(result.driverId, current + result.points + (result.bonus || 0));
          }
        });
      });
      
      const sortedDrivers = Array.from(driverPoints.entries())
        .map(([driverId, points]) => ({
          driver: drivers.find(d => d.id === driverId),
          points
        }))
        .filter(d => d.driver)
        .sort((a, b) => b.points - a.points);
      
      return {
        category,
        topDriver: sortedDrivers[0]
      };
    }).filter(c => c.topDriver);
  };
  
  const kartingTopDrivers = getKartingTopDrivers();
  const topDriver = !isKarting ? standings[0] : null;
  
  // Grouper les courses par type
  const racesByType = races.reduce((acc, race) => {
    acc[race.type] = (acc[race.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Configuration des icônes par type
  const typeIcons: Record<string, { icon: typeof Trophy, color: string, label: string }> = {
    montagne: { icon: Mountain, color: 'text-green-600', label: 'Courses de Côte' },
    rallye: { icon: Car, color: 'text-orange-600', label: 'Rallyes' },
    acceleration: { icon: Zap, color: 'text-purple-600', label: 'Accélération' },
    karting: { icon: Trophy, color: 'text-blue-600', label: 'Karting' }
  };
  
  // Définir l'ordre d'affichage des types de courses selon les menus
  const raceTypeOrder = ['montagne', 'rallye', 'acceleration', 'karting'];
  
  const stats = [
    {
      title: 'Total Pilotes',
      value: totalPilotes,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Total Copilotes',
      value: totalCopilotes,
      icon: Users,
      color: 'text-cyan-600'
    },
    {
      title: 'Total Courses',
      value: totalRaces,
      icon: Trophy,
      color: 'text-purple-600'
    },
    ...raceTypeOrder
      .filter(type => racesByType[type]) // Seulement les types qui existent
      .map(type => {
        const config = typeIcons[type];
        return {
          title: config.label,
          value: racesByType[type],
          icon: config.icon,
          color: config.color
        };
      })
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

      {topDriver && !isKarting && (
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

      {isKarting && kartingTopDrivers.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="text-yellow-500 w-6 h-6" />
            Leaders par Catégorie
          </h3>
          <div className="space-y-3">
            {kartingTopDrivers.map(({ category, topDriver }) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-500">{category}</p>
                  <p className="text-lg font-semibold">{topDriver.driver?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{topDriver.points}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dernières Courses</h3>
        <div className="space-y-3">
          {races.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Aucune course enregistrée</p>
          ) : (
            races
              .sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime())
              .slice(0, 5)
              .map((race) => {
                const config = typeIcons[race.type] || { icon: Trophy, color: 'text-gray-600', label: race.type };
                const Icon = config.icon;
                return (
                  <div key={race.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className={config.color} size={20} />
                      <div>
                        <p className="font-medium">{race.name}</p>
                        <p className="text-sm text-gray-600">
                          {parseLocalDate(race.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {race.results.length} participants
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminStats;
