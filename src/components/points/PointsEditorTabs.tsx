
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mountain, Car } from 'lucide-react';
import { Driver, Race, RaceResult } from '@/types/championship';
import RaceTypeTab from './RaceTypeTab';

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
  return (
    <Tabs defaultValue="montagne" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="montagne" className="flex items-center gap-2">
          <Mountain className="w-4 h-4" />
          Courses de Montagne
        </TabsTrigger>
        <TabsTrigger value="rallye" className="flex items-center gap-2">
          <Car className="w-4 h-4" />
          Courses de Rallye
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
    </Tabs>
  );
};

export default PointsEditorTabs;
