import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Race, Driver } from '@/types/championship';
import { Trophy, Medal, Target, TrendingUp, Award, BarChart3 } from 'lucide-react';

interface DriverAdvancedStatsProps {
  races: Race[];
  drivers: Driver[];
  title?: string;
  type?: 'montagne' | 'rallye' | 'karting' | 'acceleration' | 'r2' | 'all';
}

interface DriverStats {
  id: string;
  name: string;
  victories: number;
  podiums: number;
  racesCount: number;
  totalRaces: number;
  participationRate: number;
  avgPointsPerRace: number;
  totalPoints: number;
  bestStreak: number;
  bestPosition: number;
}

const DriverAdvancedStats = ({
  races,
  drivers,
  title = "Statistiques détaillées",
  type = 'all',
}: DriverAdvancedStatsProps) => {

  const sortedRaces = useMemo(() => {
    const filtered = type === 'all'
      ? races
      : races.filter(r => r.type === type);
    return [...filtered]
      .filter(r => r.results && r.results.length > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [races, type]);

  const driverStats = useMemo(() => {
    if (sortedRaces.length === 0) return [];

    const statsMap = new Map<string, DriverStats>();
    const totalRaces = sortedRaces.length;

    // Initialize
    drivers.forEach(d => {
      statsMap.set(d.id, {
        id: d.id,
        name: d.name,
        victories: 0,
        podiums: 0,
        racesCount: 0,
        totalRaces,
        participationRate: 0,
        avgPointsPerRace: 0,
        totalPoints: 0,
        bestStreak: 0,
        bestPosition: 999,
      });
    });

    // Track consecutive podiums for streak
    const currentStreak = new Map<string, number>();

    sortedRaces.forEach((race) => {
      const participatingDrivers = new Set<string>();

      race.results.forEach((result) => {
        const stats = statsMap.get(result.driverId);
        if (!stats) return;

        participatingDrivers.add(result.driverId);
        stats.racesCount++;
        stats.totalPoints += result.points + (result.bonus || 0);

        if (result.position === 1) stats.victories++;
        if (result.position <= 3) {
          stats.podiums++;
          const streak = (currentStreak.get(result.driverId) || 0) + 1;
          currentStreak.set(result.driverId, streak);
          if (streak > stats.bestStreak) stats.bestStreak = streak;
        } else {
          currentStreak.set(result.driverId, 0);
        }

        if (result.position < stats.bestPosition) {
          stats.bestPosition = result.position;
        }
      });
    });

    // Compute derived stats
    const results: DriverStats[] = [];
    statsMap.forEach((stats) => {
      if (stats.racesCount === 0) return;
      stats.participationRate = Math.round((stats.racesCount / totalRaces) * 100);
      stats.avgPointsPerRace = Math.round((stats.totalPoints / stats.racesCount) * 10) / 10;
      results.push(stats);
    });

    return results.sort((a, b) => b.totalPoints - a.totalPoints);
  }, [sortedRaces, drivers]);

  if (driverStats.length === 0) return null;

  // Summary stats
  const mostVictories = [...driverStats].sort((a, b) => b.victories - a.victories)[0];
  const mostPodiums = [...driverStats].sort((a, b) => b.podiums - a.podiums)[0];
  const bestAvg = [...driverStats].sort((a, b) => b.avgPointsPerRace - a.avgPointsPerRace)[0];
  const bestStreak = [...driverStats].sort((a, b) => b.bestStreak - a.bestStreak)[0];

  const summaryCards = [
    {
      icon: Trophy,
      label: "Plus de victoires",
      value: mostVictories?.name,
      detail: `${mostVictories?.victories} victoire${mostVictories?.victories > 1 ? 's' : ''}`,
      gradient: "from-amber-500 to-yellow-500",
      textColor: "text-amber-600",
    },
    {
      icon: Medal,
      label: "Plus de podiums",
      value: mostPodiums?.name,
      detail: `${mostPodiums?.podiums} podium${mostPodiums?.podiums > 1 ? 's' : ''}`,
      gradient: "from-blue-500 to-cyan-500",
      textColor: "text-blue-600",
    },
    {
      icon: TrendingUp,
      label: "Meilleure moyenne",
      value: bestAvg?.name,
      detail: `${bestAvg?.avgPointsPerRace} pts/course`,
      gradient: "from-emerald-500 to-green-500",
      textColor: "text-emerald-600",
    },
    {
      icon: Award,
      label: "Meilleure série de podiums",
      value: bestStreak?.name,
      detail: `${bestStreak?.bestStreak} podium${bestStreak?.bestStreak > 1 ? 's' : ''} consécutif${bestStreak?.bestStreak > 1 ? 's' : ''}`,
      gradient: "from-purple-500 to-violet-500",
      textColor: "text-purple-600",
    },
  ];

  return (
    <Card className="card-glass p-6 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="text-primary" size={22} />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card) => (
          <Card key={card.label} className="p-4 text-center bg-card border-border">
            <div className={`bg-gradient-to-r ${card.gradient} w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2`}>
              <card.icon className="text-white" size={20} />
            </div>
            <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
            <p className={`text-sm font-bold ${card.textColor}`}>{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.detail}</p>
          </Card>
        ))}
      </div>

      {/* Detailed table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 text-muted-foreground font-medium">Pilote</th>
              <th className="text-center py-2 px-2 text-muted-foreground font-medium">
                <Trophy size={14} className="inline mr-1 text-amber-500" />V
              </th>
              <th className="text-center py-2 px-2 text-muted-foreground font-medium">
                <Medal size={14} className="inline mr-1 text-blue-500" />P
              </th>
              <th className="text-center py-2 px-2 text-muted-foreground font-medium">Courses</th>
              <th className="text-center py-2 px-2 text-muted-foreground font-medium hidden sm:table-cell">Participation</th>
              <th className="text-center py-2 px-2 text-muted-foreground font-medium">Moy.</th>
              <th className="text-center py-2 px-2 text-muted-foreground font-medium hidden sm:table-cell">Série</th>
              <th className="text-center py-2 px-2 text-muted-foreground font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {driverStats.slice(0, 15).map((stats, idx) => (
              <tr
                key={stats.id}
                className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${
                  idx < 3 ? 'font-medium' : ''
                }`}
              >
                <td className="py-2 px-2 text-foreground">
                  <span className="text-muted-foreground mr-1.5 text-xs">{idx + 1}.</span>
                  {stats.name}
                </td>
                <td className="text-center py-2 px-2">
                  <span className={stats.victories > 0 ? 'text-amber-500 font-bold' : 'text-muted-foreground'}>
                    {stats.victories}
                  </span>
                </td>
                <td className="text-center py-2 px-2">
                  <span className={stats.podiums > 0 ? 'text-blue-500 font-bold' : 'text-muted-foreground'}>
                    {stats.podiums}
                  </span>
                </td>
                <td className="text-center py-2 px-2 text-foreground">
                  {stats.racesCount}/{stats.totalRaces}
                </td>
                <td className="text-center py-2 px-2 hidden sm:table-cell">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    stats.participationRate === 100
                      ? 'bg-emerald-500/20 text-emerald-600'
                      : stats.participationRate >= 75
                      ? 'bg-blue-500/20 text-blue-600'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {stats.participationRate}%
                  </span>
                </td>
                <td className="text-center py-2 px-2 text-foreground font-medium">
                  {stats.avgPointsPerRace}
                </td>
                <td className="text-center py-2 px-2 hidden sm:table-cell">
                  {stats.bestStreak > 0 ? (
                    <span className="text-purple-500 font-bold">{stats.bestStreak}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="text-center py-2 px-2 font-bold text-primary">
                  {stats.totalPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-muted-foreground flex flex-wrap gap-4">
        <span><Trophy size={12} className="inline mr-1 text-amber-500" />V = Victoires</span>
        <span><Medal size={12} className="inline mr-1 text-blue-500" />P = Podiums (top 3)</span>
        <span>Moy. = Points moyens par course</span>
        <span>Série = Meilleure série de podiums consécutifs</span>
      </div>
    </Card>
  );
};

export default DriverAdvancedStats;
