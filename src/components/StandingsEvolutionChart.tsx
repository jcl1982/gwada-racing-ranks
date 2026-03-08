import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Race, Driver } from '@/types/championship';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface StandingsEvolutionChartProps {
  races: Race[];
  drivers: Driver[];
  title?: string;
  type?: 'montagne' | 'rallye' | 'karting' | 'acceleration' | 'all';
}

const COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#ea580c', '#9333ea',
  '#0891b2', '#ca8a04', '#e11d48', '#4f46e5', '#059669',
  '#d97706', '#7c3aed', '#0d9488', '#be185d', '#6d28d9',
];

const StandingsEvolutionChart = ({
  races,
  drivers,
  title = "Évolution des classements",
  type = 'all',
}: StandingsEvolutionChartProps) => {
  const [visibleDrivers, setVisibleDrivers] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  // Filter and sort races by date
  const sortedRaces = useMemo(() => {
    const filtered = type === 'all' 
      ? races 
      : races.filter(r => r.type === type);
    return [...filtered]
      .filter(r => r.results && r.results.length > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [races, type]);

  // Build evolution data: cumulative points per driver across races
  const { chartData, activeDrivers } = useMemo(() => {
    if (sortedRaces.length === 0) return { chartData: [], activeDrivers: [] };

    const driverPoints: Record<string, number> = {};
    const driverParticipated = new Set<string>();

    const data = sortedRaces.map((race) => {
      const entry: Record<string, any> = {
        name: race.name.length > 15 ? race.name.substring(0, 15) + '…' : race.name,
        fullName: race.name,
      };

      race.results.forEach((result) => {
        driverPoints[result.driverId] = (driverPoints[result.driverId] || 0) + result.points + (result.bonus || 0);
        driverParticipated.add(result.driverId);
      });

      // Add cumulative points for all drivers who have participated
      driverParticipated.forEach((driverId) => {
        entry[driverId] = driverPoints[driverId] || 0;
      });

      return entry;
    });

    // Get drivers sorted by final points (top first)
    const active = Array.from(driverParticipated)
      .map(id => ({
        id,
        name: drivers.find(d => d.id === id)?.name || 'Inconnu',
        finalPoints: driverPoints[id] || 0,
      }))
      .sort((a, b) => b.finalPoints - a.finalPoints);

    return { chartData: data, activeDrivers: active };
  }, [sortedRaces, drivers]);

  // Initialize visible drivers to top 5
  useMemo(() => {
    if (!initialized && activeDrivers.length > 0) {
      setVisibleDrivers(new Set(activeDrivers.slice(0, 5).map(d => d.id)));
      setInitialized(true);
    }
  }, [activeDrivers, initialized]);

  if (sortedRaces.length === 0) {
    return null;
  }

  const toggleDriver = (driverId: string) => {
    setVisibleDrivers(prev => {
      const next = new Set(prev);
      if (next.has(driverId)) {
        next.delete(driverId);
      } else {
        next.add(driverId);
      }
      return next;
    });
  };

  const showAll = () => setVisibleDrivers(new Set(activeDrivers.map(d => d.id)));
  const showTop5 = () => setVisibleDrivers(new Set(activeDrivers.slice(0, 5).map(d => d.id)));
  const hideAll = () => setVisibleDrivers(new Set());

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const fullName = payload[0]?.payload?.fullName || label;
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground mb-2">{fullName}</p>
        {payload
          .sort((a: any, b: any) => b.value - a.value)
          .map((entry: any) => (
            <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
              {activeDrivers.find(d => d.id === entry.dataKey)?.name}: <strong>{entry.value} pts</strong>
            </p>
          ))}
      </div>
    );
  };

  return (
    <Card className="card-glass p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-primary" size={22} />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>

      {/* Driver filter buttons */}
      <div className="flex flex-wrap gap-1 mb-4">
        <button onClick={showTop5} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          Top 5
        </button>
        <button onClick={showAll} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          Tous
        </button>
        <button onClick={hideAll} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
          Aucun
        </button>
        <div className="w-px bg-border mx-1" />
        {activeDrivers.map((driver, idx) => (
          <button
            key={driver.id}
            onClick={() => toggleDriver(driver.id)}
            className={`text-xs px-2 py-1 rounded transition-colors border ${
              visibleDrivers.has(driver.id)
                ? 'border-current font-medium'
                : 'border-transparent opacity-50 hover:opacity-75'
            }`}
            style={{ color: COLORS[idx % COLORS.length] }}
          >
            {driver.name}
          </button>
        ))}
      </div>

      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
              label={{ value: 'Points', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            {activeDrivers.map((driver, idx) =>
              visibleDrivers.has(driver.id) ? (
                <Line
                  key={driver.id}
                  type="monotone"
                  dataKey={driver.id}
                  name={driver.name}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default StandingsEvolutionChart;
