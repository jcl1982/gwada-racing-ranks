
import { TabsContent } from '@/components/ui/tabs';
import { Driver, Race, ChampionshipStanding, RaceResult } from '@/types/championship';
import DriversManagement from '../DriversManagement';
import RacesManagement from '../RacesManagement';
import PointsEditor from '../PointsEditor';
import AdminStats from '../AdminStats';
import ChampionshipSettings from '../ChampionshipSettings';

interface AdminTabsContentProps {
  drivers: Driver[];
  montagneRaces: Race[];
  rallyeRaces: Race[];
  standings: ChampionshipStanding[];
  championshipTitle: string;
  championshipYear: string;
  onDriversChange: (drivers: Driver[]) => void;
  onRacesChange: (montagneRaces: Race[], rallyeRaces: Race[]) => void;
  onTitleChange: (title: string, year: string) => void;
  saveDriver: (driver: Omit<Driver, 'id'> | Driver) => Promise<void>;
  deleteDriver: (driverId: string) => Promise<void>;
  saveRace: (race: Omit<Race, 'id' | 'results'> | Race) => Promise<void>;
  deleteRace: (raceId: string) => Promise<void>;
  onRaceUpdate: (raceId: string, results: RaceResult[]) => Promise<void>;
}

const AdminTabsContent = ({
  drivers,
  montagneRaces,
  rallyeRaces,
  standings,
  championshipTitle,
  championshipYear,
  onDriversChange,
  onRacesChange,
  onTitleChange,
  saveDriver,
  deleteDriver,
  saveRace,
  deleteRace,
  onRaceUpdate
}: AdminTabsContentProps) => {
  return (
    <>
      <TabsContent value="drivers" className="mt-6">
        <DriversManagement
          drivers={drivers}
          onDriversChange={onDriversChange}
          saveDriver={saveDriver}
          deleteDriver={deleteDriver}
        />
      </TabsContent>

      <TabsContent value="races" className="mt-6">
        <RacesManagement
          drivers={drivers}
          montagneRaces={montagneRaces}
          rallyeRaces={rallyeRaces}
          onRacesChange={onRacesChange}
          saveRace={saveRace}
          deleteRace={deleteRace}
        />
      </TabsContent>

      <TabsContent value="points" className="mt-6">
        <PointsEditor
          drivers={drivers}
          montagneRaces={montagneRaces}
          rallyeRaces={rallyeRaces}
          onRaceUpdate={onRaceUpdate}
        />
      </TabsContent>

      <TabsContent value="stats" className="mt-6">
        <AdminStats
          drivers={drivers}
          montagneRaces={montagneRaces}
          rallyeRaces={rallyeRaces}
          standings={standings}
        />
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        <ChampionshipSettings
          championshipTitle={championshipTitle}
          championshipYear={championshipYear}
          onTitleChange={onTitleChange}
        />
      </TabsContent>
    </>
  );
};

export default AdminTabsContent;
