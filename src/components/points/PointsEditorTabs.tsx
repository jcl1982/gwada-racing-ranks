
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mountain, Car, Trophy } from 'lucide-react';
import { Driver, Race, RaceResult } from '@/types/championship';
import RaceTypeTab from './RaceTypeTab';
import { useMemo } from 'react';

interface PointsEditorTabsProps {
  drivers: Driver[];
  montagneRaces: Race[];
  rallyeRaces: Race[];
  onRaceUpdate: (raceId: string, results: RaceResult[]) => Promise<void>;
}

const PointsEditorTabs = ({
  drivers,
  montagneRaces,
  rallyeRaces,
  onRaceUpdate
}: PointsEditorTabsProps) => {
  // Combiner toutes les courses pour l'onglet C2 R2
  const allRaces = useMemo(() => {
    return [...montagneRaces, ...rallyeRaces].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [montagneRaces, rallyeRaces]);

  // Filtrer les pilotes C2 R2
  const c2r2Drivers = useMemo(() => {
    return drivers.filter(driver => {
      const hasC2R2Profile = driver.carModel?.toLowerCase().includes('c2') && 
                             driver.carModel?.toLowerCase().includes('r2');
      const hasC2R2Results = allRaces.some(race => 
        race.results.some(result => 
          result.driverId === driver.id && 
          result.carModel?.toLowerCase().includes('c2') && 
          result.carModel?.toLowerCase().includes('r2')
        )
      );
      return hasC2R2Profile || hasC2R2Results;
    });
  }, [drivers, allRaces]);

  return (
    <Tabs defaultValue="montagne" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="montagne" className="flex items-center gap-2">
          <Mountain className="w-4 h-4" />
          Courses de Montagne
        </TabsTrigger>
        <TabsTrigger value="rallye" className="flex items-center gap-2">
          <Car className="w-4 h-4" />
          Courses de Rallye
        </TabsTrigger>
        <TabsTrigger value="c2r2" className="flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Trophée C2 R2
        </TabsTrigger>
      </TabsList>

      <TabsContent value="montagne" className="mt-6">
        <RaceTypeTab
          races={montagneRaces}
          drivers={drivers}
          raceType="montagne"
          onRaceUpdate={onRaceUpdate}
        />
      </TabsContent>

      <TabsContent value="rallye" className="mt-6">
        <RaceTypeTab
          races={rallyeRaces}
          drivers={drivers}
          raceType="rallye"
          onRaceUpdate={onRaceUpdate}
        />
      </TabsContent>

      <TabsContent value="c2r2" className="mt-6">
        <RaceTypeTab
          races={allRaces}
          drivers={c2r2Drivers}
          raceType="c2r2"
          onRaceUpdate={onRaceUpdate}
        />
      </TabsContent>
    </Tabs>
  );
};

export default PointsEditorTabs;
