import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Mountain, Car, Calendar, Users, Award, Zap, Circle, Clock } from 'lucide-react';
import { useImageExport } from '@/hooks/useImageExport';
import { useWebPrint } from '@/hooks/useWebPrint';
import PrintButton from '@/components/PrintButton';
import PartnerLogos from '@/components/PartnerLogos';
import { useAllChampionshipsData } from '@/hooks/useAllChampionshipsData';
import { ChampionshipStanding } from '@/types/championship';

// Parse une date YYYY-MM-DD en Date locale sans décalage de fuseau horaire
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}
interface HomePageProps {
  championshipTitle: string;
  championshipYear: string;
}
const HomePage = ({
  championshipTitle,
  championshipYear
}: HomePageProps) => {
  const {
    exportToImage
  } = useImageExport();
  const {
    printWebPage,
    printWithUnicodeSupport
  } = useWebPrint();
  const {
    championships,
    loading
  } = useAllChampionshipsData();
  if (loading) {
    return <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement des championnats...</p>
        </div>
      </div>;
  }

  // Obtenir les données pour chaque championnat
  const rallyeMontagne = championships.find(c => c.title === 'Championnat Rallye-Montagne');
  const acceleration = championships.find(c => c.title === 'Championnat Accélération');
  const karting = championships.find(c => c.title === 'Championnat Karting');
  const getChampionshipIcon = (title: string) => {
    if (title.includes('Accélération')) return Zap;
    if (title.includes('Karting')) return Circle;
    return Trophy;
  };
  const getChampionshipColor = (title: string) => {
    if (title.includes('Accélération')) return 'from-orange-500 to-orange-600';
    if (title.includes('Karting')) return 'from-purple-500 to-purple-600';
    return 'from-blue-500 to-blue-600';
  };
  const handlePrintImage = () => {
    exportToImage('homepage-content', `Accueil_${championshipYear}`, championshipTitle);
  };
  const handlePrintWeb = () => {
    printWebPage('homepage-content', `${championshipTitle} - ${championshipYear}`);
  };
  const handlePrintUnicode = () => {
    printWithUnicodeSupport('homepage-content', `${championshipTitle} - ${championshipYear}`);
  };
  return <div id="homepage-content" className="space-y-8">
      {/* Export Button */}
      <div className="flex justify-end">
        <PrintButton onPrintPdf={() => {}} onPrintImage={handlePrintImage} onPrintWeb={handlePrintWeb} onPrintUnicode={handlePrintUnicode} variant="outline" adminOnly={true} />
      </div>

      {/* Hero Section */}
      <div className="text-center py-12">
        <PartnerLogos />
        <h1 className="text-5xl md:text-6xl font-bold gradient-caribbean bg-clip-text text-transparent mb-4 py-[10px]">
          Championnats Automobiles
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 my-0">
          de Guadeloupe {championshipYear}
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Suivez les performances de nos pilotes à travers les différents championnats 
          de l'archipel guadeloupéen
        </p>
      </div>

      {/* Championships Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {championships.map(championship => {
        const ChampIcon = getChampionshipIcon(championship.title);
        const colorClass = getChampionshipColor(championship.title);
        const isKarting = championship.title === 'Championnat Karting';
        
        // Fonction pour calculer les classements par catégorie karting
        const calculateKartingCategoryStandings = (category: string) => {
          const standingsMap = new Map<string, { totalPoints: number, driverName: string }>();
          
          championship.races.forEach(race => {
            race.results.forEach(result => {
              const resultCategory = result.category?.toLowerCase() || '';
              const searchCategory = category.toLowerCase();
              
              let isMatchingCategory = false;
              if (searchCategory === 'mini60') {
                isMatchingCategory = resultCategory.includes('mini') && resultCategory.includes('60');
              } else if (searchCategory === 'senior') {
                isMatchingCategory = resultCategory.includes('senior') || 
                                   resultCategory.includes('master') || 
                                   resultCategory.includes('gentleman');
              } else if (searchCategory === 'kz2') {
                isMatchingCategory = resultCategory.includes('kz2') || resultCategory.includes('kz 2');
              }
              
              if (isMatchingCategory) {
                const driver = championship.drivers.find(d => d.id === result.driverId);
                const current = standingsMap.get(result.driverId) || { 
                  totalPoints: 0, 
                  driverName: driver?.name || 'Unknown'
                };
                const pointsWithBonus = result.points + (result.bonus || 0);
                standingsMap.set(result.driverId, {
                  totalPoints: current.totalPoints + pointsWithBonus,
                  driverName: current.driverName
                });
              }
            });
          });

          return Array.from(standingsMap.entries())
            .map(([driverId, data]) => {
              const driver = championship.drivers.find(d => d.id === driverId);
              if (!driver) return null;
              return { driver, totalPoints: data.totalPoints };
            })
            .filter((s): s is NonNullable<typeof s> => s !== null)
            .sort((a, b) => b.totalPoints - a.totalPoints);
        };
        
        // Pour le karting, calculer les points avec bonus
        let leader = championship.standings[0];
        let kartingCategoryStandings: { mini60: any[], senior: any[], kz2: any[] } | null = null;
        
        if (isKarting && championship.drivers.length > 0) {
          // Calculer les classements par catégorie
          kartingCategoryStandings = {
            mini60: calculateKartingCategoryStandings('mini60').slice(0, 3),
            senior: calculateKartingCategoryStandings('senior').slice(0, 3),
            kz2: calculateKartingCategoryStandings('kz2').slice(0, 3)
          };
          
          // Calculer le leader global
          const kartingStandings = championship.drivers.map(driver => {
            const totalPoints = championship.races.reduce((sum, race) => {
              const result = race.results.find(r => r.driverId === driver.id);
              return sum + (result?.points || 0) + (result?.bonus || 0);
            }, 0);
            return { driver, totalPoints };
          }).filter(s => s.totalPoints > 0)
            .sort((a, b) => b.totalPoints - a.totalPoints);
          
          if (kartingStandings.length > 0) {
            leader = {
              driver: kartingStandings[0].driver,
              totalPoints: kartingStandings[0].totalPoints,
              montagnePoints: 0,
              rallyePoints: 0,
              position: 1,
              positionChange: 0
            } as ChampionshipStanding;
          }
        }
        
        const montagneRaces = championship.races.filter(r => r.type === 'montagne');
        const rallyeRaces = championship.races.filter(r => r.type === 'rallye');
        const totalRaces = championship.races.length;
        return <Card key={championship.id} className="card-glass overflow-hidden">
              {/* Header */}
              <div className={`bg-gradient-to-r ${colorClass} p-6 text-white text-center`}>
                <ChampIcon size={40} className="mx-auto mb-3" />
                <h3 className="text-xl font-bold">{championship.title}</h3>
              </div>

              {/* Stats */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="gradient-caribbean w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="text-white" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{championship.drivers.filter(d => d.driverRole === 'pilote').length}</p>
                    <p className="text-sm text-gray-600">Pilotes</p>
                  </div>
                  <div className="text-center">
                    <div className="gradient-ocean w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Calendar className="text-white" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{totalRaces}</p>
                    <p className="text-sm text-gray-600">Courses</p>
                  </div>
                </div>

                {/* Leader */}
                {leader ? <div className="border-t pt-4 mt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy size={20} className="text-yellow-500" />
                      <h4 className="font-semibold">Leader</h4>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-bold text-lg">{leader.driver.name}</p>
                      <p className="text-sm text-gray-600">{leader.driver.team}</p>
                      <div className="mt-2">
                        <Badge className={`bg-gradient-to-r ${colorClass} text-white font-bold`}>
                          {leader.totalPoints} points
                        </Badge>
                      </div>
                      {championship.title === 'Championnat Rallye-Montagne' && <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                          <div className="text-center">
                            <span className="text-green-600 font-semibold">{leader.montagnePoints}</span>
                            <span className="text-gray-500"> Montagne</span>
                          </div>
                          <div className="text-center">
                            <span className="text-blue-600 font-semibold">{leader.rallyePoints}</span>
                            <span className="text-gray-500"> Rallye</span>
                          </div>
                        </div>}
                      {isKarting && <div className="mt-3 text-xs text-center">
                          <p className="text-gray-500">Points totaux (course + bonus)</p>
                        </div>}
                    </div>
                  </div> : <div className="border-t pt-4 mt-4">
                    <p className="text-center text-gray-500 py-4">
                      Aucun classement disponible
                    </p>
                  </div>}

                {/* Top 3 */}
                {isKarting && kartingCategoryStandings ? (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Award size={18} />
                      Top 3 par Catégorie
                    </h4>
                    
                    {/* MINI 60 */}
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-purple-700 mb-2">MINI 60</h5>
                      <div className="space-y-1">
                        {kartingCategoryStandings.mini60.length > 0 ? (
                          kartingCategoryStandings.mini60.map((standing, index) => {
                            const positions = ['🥇', '🥈', '🥉'];
                            return (
                              <div key={standing.driver.id} className="flex items-center justify-between bg-purple-50 rounded-lg p-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{positions[index]}</span>
                                  <div>
                                    <p className="font-semibold text-xs">{standing.driver.name}</p>
                                    <p className="text-xs text-gray-600">{standing.totalPoints} pts</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-gray-500 text-center py-2">Aucun classement</p>
                        )}
                      </div>
                    </div>
                    
                    {/* SENIOR MASTER GENTLEMAN */}
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-purple-700 mb-2">SENIOR MASTER GENTLEMAN</h5>
                      <div className="space-y-1">
                        {kartingCategoryStandings.senior.length > 0 ? (
                          kartingCategoryStandings.senior.map((standing, index) => {
                            const positions = ['🥇', '🥈', '🥉'];
                            return (
                              <div key={standing.driver.id} className="flex items-center justify-between bg-purple-50 rounded-lg p-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{positions[index]}</span>
                                  <div>
                                    <p className="font-semibold text-xs">{standing.driver.name}</p>
                                    <p className="text-xs text-gray-600">{standing.totalPoints} pts</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-gray-500 text-center py-2">Aucun classement</p>
                        )}
                      </div>
                    </div>
                    
                    {/* KZ2 */}
                    <div>
                      <h5 className="text-sm font-semibold text-purple-700 mb-2">KZ2</h5>
                      <div className="space-y-1">
                        {kartingCategoryStandings.kz2.length > 0 ? (
                          kartingCategoryStandings.kz2.map((standing, index) => {
                            const positions = ['🥇', '🥈', '🥉'];
                            return (
                              <div key={standing.driver.id} className="flex items-center justify-between bg-purple-50 rounded-lg p-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{positions[index]}</span>
                                  <div>
                                    <p className="font-semibold text-xs">{standing.driver.name}</p>
                                    <p className="text-xs text-gray-600">{standing.totalPoints} pts</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-gray-500 text-center py-2">Aucun classement</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : championship.standings.length >= 3 && !isKarting && <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Award size={18} />
                      Top 3
                    </h4>
                    <div className="space-y-2">
                      {championship.standings.slice(0, 3).map((standing, index) => {
                        const positions = ['🥇', '🥈', '🥉'];
                        return (
                          <div key={standing.driver.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{positions[index]}</span>
                              <div>
                                <p className="font-semibold text-sm">{standing.driver.name}</p>
                                <p className="text-xs text-gray-600">{standing.totalPoints} pts</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>}
              </div>
            </Card>;
      })}
      </div>

      {/* News Section - Latest and Upcoming Races */}
      <Card className="card-glass p-6 mt-8">
        <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
          <Clock className="text-primary" />
          Actualités des Championnats
        </h3>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {championships.map(championship => {
          const ChampIcon = getChampionshipIcon(championship.title);
          const colorClass = getChampionshipColor(championship.title);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Séparer les courses passées et à venir
          const upcomingRaces = championship.races.filter(r => parseLocalDate(r.date) >= today).sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime()).slice(0, 2);
          const pastRaces = championship.races.filter(r => parseLocalDate(r.date) < today).sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()).slice(0, 2);
          return <div key={championship.id}>
                <div className={`bg-gradient-to-r ${colorClass} p-4 rounded-t-lg text-white flex items-center gap-2`}>
                  <ChampIcon size={24} />
                  <h4 className="font-semibold">{championship.title}</h4>
                </div>
                
                <div className="border border-t-0 rounded-b-lg p-4 space-y-4">
                  {/* Prochaines courses */}
                  {upcomingRaces.length > 0 && <div>
                      <h5 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                        <Calendar size={16} className="text-green-600" />
                        À venir
                      </h5>
                      <div className="space-y-2">
                        {upcomingRaces.map(race => <div key={race.id} className="bg-green-50 rounded-lg p-2 border-l-4 border-green-500">
                            <p className="font-medium text-sm">{race.name}</p>
                            <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                              <Calendar size={12} />
                              {parseLocalDate(race.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long'
                      })}
                            </p>
                          </div>)}
                      </div>
                    </div>}

                  {/* Dernières courses */}
                  {pastRaces.length > 0 && <div>
                      <h5 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                        <Trophy size={16} className="text-blue-600" />
                        Résultats récents
                      </h5>
                      <div className="space-y-2">
                        {pastRaces.map(race => {
                    const winner = race.results.sort((a, b) => a.position - b.position)[0];
                    const winnerDriver = winner ? championship.drivers.find(d => d.id === winner.driverId) : null;
                    return <div key={race.id} className="bg-blue-50 rounded-lg p-2 border-l-4 border-blue-500">
                              <p className="font-medium text-sm">{race.name}</p>
                              <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                <Calendar size={12} />
                                {parseLocalDate(race.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long'
                        })}
                              </p>
                              {winnerDriver && <p className="text-xs text-gray-700 mt-1 flex items-center gap-1">
                                  <Trophy size={12} className="text-yellow-500" />
                                  <span className="font-semibold">{winnerDriver.name}</span>
                                </p>}
                            </div>;
                  })}
                      </div>
                    </div>}

                  {upcomingRaces.length === 0 && pastRaces.length === 0 && <p className="text-center text-gray-500 text-sm py-4">
                      Aucune actualité pour le moment
                    </p>}
                </div>
              </div>;
        })}
        </div>
      </Card>
    </div>;
};
export default HomePage;