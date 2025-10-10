import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Mountain, Car, Calendar, Users, Award, Zap, Circle, Clock } from 'lucide-react';
import { useImageExport } from '@/hooks/useImageExport';
import { useWebPrint } from '@/hooks/useWebPrint';
import PrintButton from '@/components/PrintButton';
import PartnerLogos from '@/components/PartnerLogos';
import { useAllChampionshipsData } from '@/hooks/useAllChampionshipsData';

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
        const leader = championship.standings[0];
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
                    <p className="text-2xl font-bold text-gray-800">{championship.drivers.length}</p>
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
                    </div>
                  </div> : <div className="border-t pt-4 mt-4">
                    <p className="text-center text-gray-500 py-4">
                      Aucun classement disponible
                    </p>
                  </div>}

                {/* Top 3 */}
                {championship.standings.length >= 3 && <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Award size={18} />
                      Top 3
                    </h4>
                    <div className="space-y-2">
                      {championship.standings.slice(0, 3).map((standing, index) => {
                  const positions = ['🥇', '🥈', '🥉'];
                  return <div key={standing.driver.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{positions[index]}</span>
                              <div>
                                <p className="font-semibold text-sm">{standing.driver.name}</p>
                                <p className="text-xs text-gray-600">{standing.totalPoints} pts</p>
                              </div>
                            </div>
                          </div>;
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