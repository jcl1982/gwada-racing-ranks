import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Mountain, Car, Calendar, Users, Award, Zap, Circle, Clock, ChevronRight } from 'lucide-react';
import { useImageExport } from '@/hooks/useImageExport';
import { useWebPrint } from '@/hooks/useWebPrint';
import PrintButton from '@/components/PrintButton';
import PartnerLogos from '@/components/PartnerLogos';
import { useAllChampionshipsData } from '@/hooks/useAllChampionshipsData';
import { ChampionshipStanding } from '@/types/championship';

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
  const { exportToImage } = useImageExport();
  const { printWebPage, printWithUnicodeSupport } = useWebPrint();
  const { championships, loading } = useAllChampionshipsData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-muted-foreground">Chargement des championnats...</p>
        </div>
      </div>
    );
  }

  const rallyeMontagne = championships.find(c => c.title === 'Championnat Rallye-Montagne');
  const acceleration = championships.find(c => c.title === 'Championnat Accélération');
  const karting = championships.find(c => c.title === 'Championnat Karting');

  const getChampionshipIcon = (title: string) => {
    if (title.includes('Accélération')) return Zap;
    if (title.includes('Karting')) return Circle;
    return Trophy;
  };

  const getChampionshipColor = (title: string) => {
    if (title.includes('Accélération')) return 'from-primary dark:from-[hsl(var(--primary-foreground))] to-accent';
    if (title.includes('Karting')) return 'from-secondary dark:from-[hsl(var(--primary-foreground))] to-accent';
    return 'from-secondary dark:from-[hsl(var(--primary-foreground))] to-primary';
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

  const totalDrivers = championships.reduce((sum, c) => sum + c.drivers.filter(d => d.driverRole === 'pilote').length, 0);
  const totalRaces = championships.reduce((sum, c) => {
    const normalizeName = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
    const uniqueKeys = new Set(c.races.map(r => `${r.type}|${r.date}|${normalizeName(r.name).replace(/^(rallye|course de cote|course de côte|slalom)\s+(des?\s+|du\s+|de la\s+|de l['’]?\s*)?/i, '')}`));
    return sum + uniqueKeys.size;
  }, 0);

  const calculateKartingCategoryStandings = (championship: typeof championships[0], category: string) => {
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
        } else if (searchCategory === 'nationale') {
          isMatchingCategory = resultCategory.includes('national');
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

  return (
    <div id="homepage-content" className="space-y-8">
      {/* Export Button */}
      <div className="flex justify-end no-export">
        <PrintButton 
          onPrintPdf={() => {}} 
          onPrintImage={handlePrintImage} 
          onPrintWeb={handlePrintWeb} 
          onPrintUnicode={handlePrintUnicode} 
          variant="outline" 
          adminOnly={true} 
        />
      </div>

      {/* Hero Section */}
      <div className="text-center py-10 md:py-14">
        <PartnerLogos />
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-normal gradient-caribbean bg-clip-text text-transparent mb-4 py-[10px]">
          Championnats Automobiles
        </h1>
        <h2 className="font-serif text-2xl md:text-4xl font-normal text-foreground mb-6">
          de Guadeloupe {championshipYear}
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Suivez les performances de nos pilotes à travers les différents championnats 
          de l'archipel guadeloupéen
        </p>
      </div>

      {/* Global Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-glass p-4 text-center">
          <div className="text-3xl font-bold text-primary">{totalDrivers}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide font-semibold mt-1">Pilotes</div>
        </Card>
        <Card className="card-glass p-4 text-center">
          <div className="text-3xl font-bold text-primary">{totalRaces}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide font-semibold mt-1">Courses</div>
        </Card>
        <Card className="card-glass p-4 text-center">
          <div className="text-3xl font-bold text-primary">{championships.length}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide font-semibold mt-1">Championnats</div>
        </Card>
        <Card className="card-glass p-4 text-center">
          <div className="text-3xl font-bold text-primary">{championshipYear}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide font-semibold mt-1">Saison</div>
        </Card>
      </div>

      {/* Championships Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {championships.map(championship => {
          const ChampIcon = getChampionshipIcon(championship.title);
          const colorClass = getChampionshipColor(championship.title);
          const isKarting = championship.title === 'Championnat Karting';
          
          const normalizeName = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
          const uniqueRaceKeys = new Set(championship.races.map(r => `${r.type}|${r.date}|${normalizeName(r.name).replace(/^(rallye|course de cote|course de côte|slalom)\s+(des?\s+|du\s+|de la\s+|de l['’]?\s*)?/i, '')}`));
          const totalRaces = uniqueRaceKeys.size;
          
          let leader = championship.standings[0];
          let kartingCategoryStandings: { mini60: any[], senior: any[], kz2: any[], nationale: any[] } | null = null;
          
          if (isKarting && championship.drivers.length > 0) {
            kartingCategoryStandings = {
              mini60: calculateKartingCategoryStandings(championship, 'mini60').slice(0, 3),
              senior: calculateKartingCategoryStandings(championship, 'senior').slice(0, 3),
              kz2: calculateKartingCategoryStandings(championship, 'kz2').slice(0, 3),
              nationale: calculateKartingCategoryStandings(championship, 'nationale').slice(0, 3)
            };
            
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

          return (
            <Card key={championship.id} className="card-glass overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              {/* Header */}
              <div className={`bg-gradient-to-r ${colorClass} p-6 text-[hsl(var(--light))] text-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative">
                  <ChampIcon size={36} className="mx-auto mb-3" />
                  <h3 className="font-serif text-xl font-normal">{championship.title}</h3>
                </div>
              </div>

              {/* Stats */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-accent/20">
                    <Users className="mx-auto mb-2 text-primary" size={20} />
                    <p className="text-2xl font-bold text-foreground">{championship.drivers.filter(d => d.driverRole === 'pilote').length}</p>
                    <p className="text-sm text-muted-foreground">Pilotes</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-primary/10">
                    <Calendar className="mx-auto mb-2 text-primary" size={20} />
                    <p className="text-2xl font-bold text-foreground">{totalRaces}</p>
                    <p className="text-sm text-muted-foreground">Courses</p>
                  </div>
                </div>

                {/* Leader */}
                {!isKarting && (leader ? (
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy size={20} className="text-primary" />
                      <h4 className="font-semibold">Leader</h4>
                    </div>
                    <div className="bg-background rounded-lg p-3 border-l-4 border-primary shadow-sm">
                      <p className="font-bold text-lg">{leader.driver.name}</p>
                      <p className="text-sm text-muted-foreground">{leader.driver.team}</p>
                      <div className="mt-2">
                        <Badge className="bg-primary text-primary-foreground font-bold">
                          {leader.totalPoints} points
                        </Badge>
                      </div>
                      {championship.title === 'Championnat Rallye-Montagne' && (
                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                          <div className="text-center p-2 rounded bg-background/50">
                            <span className="text-primary font-semibold">{leader.montagnePoints}</span>
                            <span className="text-muted-foreground"> Montagne</span>
                          </div>
                          <div className="text-center p-2 rounded bg-background/50">
                            <span className="text-foreground font-semibold">{leader.rallyePoints}</span>
                            <span className="text-muted-foreground"> Rallye</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-border pt-4 mt-4">
                    <p className="text-center text-muted-foreground py-4">
                      Aucun classement disponible
                    </p>
                  </div>
                ))}

                {/* Top 3 / Karting Categories */}
                {isKarting && kartingCategoryStandings ? (
                  <div className="border-t border-border pt-4 mt-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Award size={18} />
                      Top 3 par Catégorie
                    </h4>
                    
                    {[
                      { key: 'mini60', label: 'MINI 60' },
                      { key: 'senior', label: 'SENIOR MASTER GENTLEMAN' },
                      { key: 'kz2', label: 'KZ2' },
                      { key: 'nationale', label: 'NATIONALE' }
                    ].map(({ key, label }) => {
                      const standings = kartingCategoryStandings![key as keyof typeof kartingCategoryStandings];
                      return (
                        <div className="mb-3" key={key}>
                          <h5 className="text-xs font-bold text-primary uppercase tracking-wide mb-2">{label}</h5>
                          <div className="space-y-1">
                            {standings.length > 0 ? (
                              standings.map((standing, index) => {
                                const positions = ['🥇', '🥈', '🥉'];
                                return (
                                  <div key={standing.driver.id} className="flex items-center justify-between bg-background rounded-lg p-2 border border-border/50">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{positions[index]}</span>
                                      <div>
                                        <p className="font-semibold text-xs">{standing.driver.name}</p>
                                        <p className="text-xs text-muted-foreground">{standing.totalPoints} pts</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-xs text-muted-foreground text-center py-2">Aucun classement</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : championship.standings.length >= 3 && !isKarting && (
                  <div className="border-t border-border pt-4 mt-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Award size={18} />
                      Top 3
                    </h4>
                    <div className="space-y-2">
                      {championship.standings.slice(0, 3).map((standing, index) => {
                        const positions = ['🥇', '🥈', '🥉'];
                        return (
                          <div key={standing.driver.id} className="flex items-center justify-between bg-background rounded-lg p-2 border border-border/50">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{positions[index]}</span>
                              <div>
                                <p className="font-semibold text-sm">{standing.driver.name}</p>
                                <p className="text-xs text-muted-foreground">{standing.totalPoints} pts</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* News Section - Latest and Upcoming Races */}
      <Card className="card-glass p-6">
        <h3 className="font-serif text-2xl font-normal mb-8 text-center flex items-center justify-center gap-2">
          <Clock className="text-primary" />
          Actualités des Championnats
        </h3>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {championships.map(championship => {
            const ChampIcon = getChampionshipIcon(championship.title);
            const colorClass = getChampionshipColor(championship.title);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcomingRaces = championship.races
              .filter(r => parseLocalDate(r.date) >= today)
              .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime())
              .slice(0, 2);
            const pastRaces = championship.races
              .filter(r => parseLocalDate(r.date) < today)
              .sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime())
              .slice(0, 2);

            return (
              <div key={championship.id} className="group">
                <div className={`bg-gradient-to-r ${colorClass} p-4 rounded-t-lg text-[hsl(var(--light))] flex items-center gap-2`}>
                  <ChampIcon size={24} />
                  <h4 className="font-serif font-normal">{championship.title}</h4>
                </div>
                
                <div className="border border-t-0 rounded-b-lg p-4 space-y-4 bg-card/50">
                  {upcomingRaces.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1">
                        <Calendar size={16} className="text-primary" />
                        À venir
                      </h5>
                      <div className="space-y-2">
                        {upcomingRaces.map(race => (
                          <div key={race.id} className="bg-primary/10 dark:bg-primary/15 rounded-lg p-2 border-l-4 border-primary">
                            <p className="font-medium text-sm">{race.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar size={12} />
                              {parseLocalDate(race.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {pastRaces.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1">
                        <Trophy size={16} className="text-primary" />
                        Résultats récents
                      </h5>
                      <div className="space-y-2">
                        {pastRaces.map(race => {
                          const piloteResults = race.results.filter(r => {
                            const d = championship.drivers.find(dr => dr.id === r.driverId);
                            return d?.driverRole !== 'copilote';
                          });
                          const winner = piloteResults.sort((a, b) => a.position - b.position)[0];
                          const winnerDriver = winner ? championship.drivers.find(d => d.id === winner.driverId) : null;
                          return (
                            <div key={race.id} className="bg-primary/10 dark:bg-primary/15 rounded-lg p-2 border-l-4 border-primary">
                              <p className="font-medium text-sm">{race.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Calendar size={12} />
                                {parseLocalDate(race.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                              </p>
                              {winnerDriver && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <Trophy size={12} className="text-primary" />
                                  <span className="font-semibold">{winnerDriver.name}</span>
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {upcomingRaces.length === 0 && pastRaces.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      Aucune actualité pour le moment
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default HomePage;
