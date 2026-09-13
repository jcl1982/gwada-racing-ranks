import { useMemo } from 'react';
import { Driver, Race, RaceResult } from '@/types/championship';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CategoryHeader from '@/components/CategoryHeader';
import RaceCalendar from '@/components/RaceCalendar';
import StandingsTable from '@/components/StandingsTable';
import PodiumSection from '@/components/PodiumSection';
import KartingRaceResults from '@/components/points/KartingRaceResults';
import DeleteStandingPointsButton from '@/components/DeleteStandingPointsButton';
import { useUrlTab } from '@/hooks/useUrlTab';

interface AccelerationStandingsProps {
  races: Race[];
  drivers: Driver[];
  championshipYear: string;
  championshipId?: string;
  onRaceUpdate: (raceId: string, results: RaceResult[]) => Promise<void>;
}

export const ACCELERATION_CATEGORIES = [
  'ET Pro A',
  'ET Pro B',
  'ET Pro C',
  'ET Spt A',
  'ET Spt B',
  'ET Spt C',
  'ET Spt D',
  'ET Spt E',
] as const;

export const normalizeAccelerationCategory = (value?: string) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

const AccelerationStandings = ({
  races,
  drivers,
  championshipYear,
  championshipId,
  onRaceUpdate,
}: AccelerationStandingsProps) => {
  const [tab, setTab] = useUrlTab('acceleration', 'general');

  const computeStandings = (category: string | null) => {
    const map = new Map<string, { totalPoints: number; totalBonus: number; categories: Set<string> }>();
    const target = category ? normalizeAccelerationCategory(category) : null;

    races.forEach((race) => {
      race.results.forEach((result) => {
        if (target) {
          const resultCat = normalizeAccelerationCategory(result.category);
          if (resultCat !== target) return;
        }
        const current = map.get(result.driverId) || {
          totalPoints: 0,
          totalBonus: 0,
          categories: new Set<string>(),
        };
        const resultCategory = result.category?.trim();
        if (resultCategory) current.categories.add(resultCategory);
        map.set(result.driverId, {
          totalPoints: current.totalPoints + result.points + (result.bonus || 0),
          totalBonus: current.totalBonus + (result.bonus || 0),
          categories: current.categories,
        });
      });
    });

    return Array.from(map.entries())
      .map(([driverId, data]) => {
        const driver = drivers.find((d) => d.id === driverId);
        if (!driver) return null;
        return {
          driver,
          points: data.totalPoints,
          bonus: data.totalBonus,
          categories: Array.from(data.categories).sort((a, b) => a.localeCompare(b)),
          position: 0,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .sort((a, b) => b.points - a.points)
      .map((s, index) => ({ ...s, position: index + 1 }));
  };

  const standingsByCategory = useMemo(() => {
    const entries: Record<string, ReturnType<typeof computeStandings>> = {
      general: computeStandings(null),
    };
    ACCELERATION_CATEGORIES.forEach((cat) => {
      entries[cat] = computeStandings(cat);
    });
    return entries;
  }, [races, drivers]);

  const currentStandings = standingsByCategory[tab] || standingsByCategory.general;
  const currentLabel = tab === 'general' ? 'Général (toutes catégories)' : tab;

  // Résultats concernés par le classement affiché (course + pilote + catégorie)
  const currentPairs = useMemo(() => {
    const target = tab === 'general' ? null : normalizeAccelerationCategory(tab);
    const pairs: Array<{ raceId: string; driverId: string; category?: string }> = [];
    races.forEach((race) => {
      race.results.forEach((result) => {
        if (target && normalizeAccelerationCategory(result.category) !== target) return;
        pairs.push({ raceId: race.id, driverId: result.driverId, category: result.category });
      });
    });
    return pairs;
  }, [races, tab]);

  return (
    <div className="space-y-6">
      <CategoryHeader
        displayTitle="Championnat Accélération"
        championshipYear={championshipYear}
      />

      <RaceCalendar races={races} driverIds={drivers.map((d) => d.id)} />

      {/* Sélecteur de catégorie */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-sm font-medium shrink-0">Catégorie :</label>
        <Select value={tab} onValueChange={setTab}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">Général (toutes catégories)</SelectItem>
            {ACCELERATION_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        <StandingsTable
          displayTitle={`Classement ${currentLabel}`}
          races={races}
          type="acceleration"
          standings={currentStandings}
          onPrintPdf={() => {}}
        />
        <div className="flex justify-end">
          <DeleteStandingPointsButton
            standingTitle={`Accélération - ${currentLabel}`}
            raceIds={races.map((r) => r.id)}
            pairs={currentPairs}
            championshipId={championshipId}
            onDeleted={async () => {
              await onRaceUpdate('', []);
            }}
          />
        </div>
        <PodiumSection standings={currentStandings} />
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Résultats par Course - {currentLabel}</h3>
        <KartingRaceResults
          races={races}
          drivers={drivers}
          category={tab === 'general' ? '' : tab}
          onRaceUpdate={onRaceUpdate}
        />
      </div>
    </div>
  );
};

export default AccelerationStandings;
