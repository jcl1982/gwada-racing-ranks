import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Race, Driver } from '@/types/championship';
import { Trophy, Medal, Target, TrendingUp, X, UserPlus, GitCompareArrows } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DriverComparatorProps {
  races: Race[];
  drivers: Driver[];
  title?: string;
}

interface ComparedDriverStats {
  id: string;
  name: string;
  team?: string;
  victories: number;
  podiums: number;
  racesCount: number;
  totalRaces: number;
  participationRate: number;
  avgPointsPerRace: number;
  totalPoints: number;
  bestPosition: number;
  bestStreak: number;
  topFiveFinishes: number;
  pointsPerRace: number[];
  raceNames: string[];
}

function computeStats(driver: Driver, races: Race[]): ComparedDriverStats {
  const validRaces = races.filter(r => r.results && r.results.length > 0);
  const totalRaces = validRaces.length;

  let victories = 0;
  let podiums = 0;
  let racesCount = 0;
  let totalPoints = 0;
  let bestPosition = 999;
  let bestStreak = 0;
  let currentStreak = 0;
  let topFiveFinishes = 0;
  const pointsPerRace: number[] = [];
  const raceNames: string[] = [];

  validRaces
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .forEach(race => {
      const result = race.results.find(r => r.driverId === driver.id);
      raceNames.push(race.name);

      if (!result) {
        pointsPerRace.push(0);
        currentStreak = 0;
        return;
      }

      racesCount++;
      const pts = result.points + (result.bonus || 0);
      totalPoints += pts;
      pointsPerRace.push(pts);

      if (result.position === 1) victories++;
      if (result.position <= 3) {
        podiums++;
        currentStreak++;
        if (currentStreak > bestStreak) bestStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
      if (result.position <= 5) topFiveFinishes++;
      if (result.position < bestPosition) bestPosition = result.position;
    });

  return {
    id: driver.id,
    name: driver.name,
    team: driver.team,
    victories,
    podiums,
    racesCount,
    totalRaces,
    participationRate: totalRaces > 0 ? Math.round((racesCount / totalRaces) * 100) : 0,
    avgPointsPerRace: racesCount > 0 ? Math.round((totalPoints / racesCount) * 10) / 10 : 0,
    totalPoints,
    bestPosition: bestPosition === 999 ? 0 : bestPosition,
    bestStreak,
    topFiveFinishes,
    pointsPerRace,
    raceNames,
  };
}

const statRows: { key: keyof ComparedDriverStats; label: string; icon?: React.ReactNode; format?: (v: any) => string }[] = [
  { key: 'totalPoints', label: 'Points totaux', icon: <Target size={14} className="text-primary" /> },
  { key: 'victories', label: 'Victoires', icon: <Trophy size={14} className="text-amber-500" /> },
  { key: 'podiums', label: 'Podiums (top 3)', icon: <Medal size={14} className="text-blue-500" /> },
  { key: 'topFiveFinishes', label: 'Top 5' },
  { key: 'racesCount', label: 'Courses disputées' },
  { key: 'participationRate', label: 'Participation', format: (v: number) => `${v}%` },
  { key: 'avgPointsPerRace', label: 'Moy. pts/course', icon: <TrendingUp size={14} className="text-emerald-500" /> },
  { key: 'bestPosition', label: 'Meilleure position', format: (v: number) => v > 0 ? `${v}ᵉ` : '—' },
  { key: 'bestStreak', label: 'Série podiums consécutifs' },
];

const driverColors = [
  'border-blue-500 bg-blue-500/10',
  'border-amber-500 bg-amber-500/10',
  'border-emerald-500 bg-emerald-500/10',
];

const headerColors = [
  'from-blue-500 to-blue-600',
  'from-amber-500 to-amber-600',
  'from-emerald-500 to-emerald-600',
];

const DriverComparator = ({ races, drivers, title = "Comparateur de pilotes" }: DriverComparatorProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const availableDrivers = useMemo(() => {
    // Only show drivers who participated in at least one race
    const participatingIds = new Set<string>();
    races.forEach(race => {
      race.results.forEach(result => {
        if (drivers.some(d => d.id === result.driverId)) {
          participatingIds.add(result.driverId);
        }
      });
    });
    return drivers
      .filter(d => participatingIds.has(d.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [races, drivers]);

  const comparedStats = useMemo(() => {
    return selectedIds
      .map(id => {
        const driver = drivers.find(d => d.id === id);
        if (!driver) return null;
        return computeStats(driver, races);
      })
      .filter((s): s is ComparedDriverStats => s !== null);
  }, [selectedIds, races, drivers]);

  const addDriver = (id: string) => {
    if (selectedIds.length < 3 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeDriver = (id: string) => {
    setSelectedIds(selectedIds.filter(sid => sid !== id));
  };

  const getBestValue = (key: keyof ComparedDriverStats): number => {
    if (comparedStats.length === 0) return 0;
    const vals = comparedStats.map(s => {
      const v = s[key];
      return typeof v === 'number' ? v : 0;
    });
    // For bestPosition, lower is better
    if (key === 'bestPosition') return Math.min(...vals.filter(v => v > 0));
    return Math.max(...vals);
  };

  const isBest = (stat: ComparedDriverStats, key: keyof ComparedDriverStats): boolean => {
    if (comparedStats.length <= 1) return false;
    const val = stat[key];
    if (typeof val !== 'number') return false;
    const best = getBestValue(key);
    if (key === 'bestPosition') return val === best && val > 0;
    return val === best && val > 0;
  };

  return (
    <Card className="card-glass p-6 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <GitCompareArrows className="text-primary" size={22} />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>

      {/* Driver selection */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        {selectedIds.map((id, idx) => {
          const driver = drivers.find(d => d.id === id);
          return (
            <Badge
              key={id}
              className={`px-3 py-1.5 text-sm flex items-center gap-2 border-2 ${driverColors[idx]} text-foreground`}
            >
              {driver?.name}
              <button onClick={() => removeDriver(id)} className="hover:text-destructive">
                <X size={14} />
              </button>
            </Badge>
          );
        })}

        {selectedIds.length < 3 && (
          <div className="flex items-center gap-2">
            <Select onValueChange={addDriver} value="">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Ajouter un pilote..." />
              </SelectTrigger>
              <SelectContent>
                {availableDrivers
                  .filter(d => !selectedIds.includes(d.id))
                  .map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <UserPlus size={18} className="text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Comparison table */}
      {comparedStats.length >= 2 ? (
        <div className="space-y-6">
          {/* Header cards */}
          <div className={`grid gap-4`} style={{ gridTemplateColumns: `1fr repeat(${comparedStats.length}, 1fr)` }}>
            <div /> {/* Empty cell for labels column */}
            {comparedStats.map((stat, idx) => (
              <div key={stat.id} className={`bg-gradient-to-r ${headerColors[idx]} rounded-lg p-4 text-white text-center`}>
                <p className="font-bold text-lg">{stat.name}</p>
                {stat.team && <p className="text-sm opacity-80">{stat.team}</p>}
                <p className="text-2xl font-bold mt-1">{stat.totalPoints} pts</p>
              </div>
            ))}
          </div>

          {/* Stats rows */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {statRows.map((row, rowIdx) => (
                  <tr key={row.key} className={`border-b border-border/50 ${rowIdx % 2 === 0 ? 'bg-card/50' : ''}`}>
                    <td className="py-3 px-3 text-muted-foreground font-medium flex items-center gap-2">
                      {row.icon}
                      {row.label}
                    </td>
                    {comparedStats.map((stat, idx) => {
                      const val = stat[row.key];
                      const numVal = typeof val === 'number' ? val : 0;
                      const formatted = row.format ? row.format(val) : String(val);
                      const best = isBest(stat, row.key);
                      return (
                        <td key={stat.id} className={`py-3 px-3 text-center font-medium ${best ? 'text-primary font-bold' : 'text-foreground'}`}>
                          <span className={best ? 'relative' : ''}>
                            {formatted}
                            {best && <span className="ml-1 text-primary">★</span>}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Points per race chart (simple bar comparison) */}
          {comparedStats[0]?.raceNames.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-foreground mb-3">Points par course</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-muted-foreground">Course</th>
                      {comparedStats.map((stat, idx) => (
                        <th key={stat.id} className="text-center py-2 px-2 text-muted-foreground">{stat.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparedStats[0].raceNames.map((raceName, raceIdx) => {
                      const maxPts = Math.max(...comparedStats.map(s => s.pointsPerRace[raceIdx] || 0));
                      return (
                        <tr key={raceIdx} className="border-b border-border/30">
                          <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">{raceName}</td>
                          {comparedStats.map((stat, idx) => {
                            const pts = stat.pointsPerRace[raceIdx] || 0;
                            const isMax = pts === maxPts && pts > 0 && comparedStats.length > 1;
                            return (
                              <td key={stat.id} className="py-2 px-2 text-center">
                                <div className="flex items-center justify-center">
                                  <div
                                    className={`rounded px-2 py-0.5 min-w-[40px] ${
                                      pts === 0
                                        ? 'text-muted-foreground'
                                        : isMax
                                        ? `border-2 ${driverColors[idx]} font-bold text-foreground`
                                        : 'text-foreground'
                                    }`}
                                  >
                                    {pts > 0 ? pts : '—'}
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-2">
            ★ = Meilleur dans cette catégorie
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <GitCompareArrows size={40} className="mx-auto mb-3 opacity-40" />
          <p>Sélectionnez au moins 2 pilotes pour comparer leurs performances</p>
        </div>
      )}
    </Card>
  );
};

export default DriverComparator;
