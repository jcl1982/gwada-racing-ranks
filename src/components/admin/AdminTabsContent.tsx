
import { TabsContent } from '@/components/ui/tabs';
import { Driver, Race, ChampionshipStanding, RaceResult } from '@/types/championship';
import DriversManagement from '../DriversManagement';
import RacesManagement from '../RacesManagement';
import PointsEditor from '../PointsEditor';
import AdminStats from '../AdminStats';
import ChampionshipSettings from '../ChampionshipSettings';
import PreviousStandingsManager from './PreviousStandingsManager';

interface AdminTabsContentProps {
  drivers: Driver[];
  montagneRaces: Race[];
  rallyeRaces: Race[];
  standings: ChampionshipStanding[];
  championshipTitle: string;
  championshipYear: string;
  championshipId?: string;
  onDriversChange: (drivers: Driver[]) => void;
  onRacesChange: (montagneRaces: Race[], rallyeRaces: Race[]) => void;
  onTitleChange: (title: string, year: string) => void;
  saveDriver: (driver: Omit<Driver, 'id'> | Driver) => Promise<void>;
  deleteDriver: (driverId: string) => Promise<void>;
  deleteAllDrivers: () => Promise<void>;
  saveRace: (race: Omit<Race, 'id' | 'results'> | Race) => Promise<void>;
  deleteRace: (raceId: string) => Promise<void>;
  saveCurrentStandingsAsPrevious: () => Promise<void>;
  resetDriversEvolution: () => Promise<void>;
  restorePreviousStandings: () => Promise<void>;
  onRaceUpdate: (raceId: string, results: RaceResult[]) => Promise<void>;
}

const AdminTabsContent = ({
  drivers,
  montagneRaces,
  rallyeRaces,
  standings,
  championshipTitle,
  championshipYear,
  championshipId,
  onDriversChange,
  onRacesChange,
  onTitleChange,
  saveDriver,
  deleteDriver,
  deleteAllDrivers,
  saveRace,
  deleteRace,
  saveCurrentStandingsAsPrevious,
  resetDriversEvolution,
  restorePreviousStandings,
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
          deleteAllDrivers={deleteAllDrivers}
          championshipId={championshipId}
        />
      </TabsContent>

      <TabsContent value="races" className="mt-6">
        <RacesManagement
          drivers={drivers}
          montagneRaces={montagneRaces}
          rallyeRaces={rallyeRaces}
          championshipId={championshipId}
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
        <div className="grid gap-6 md:grid-cols-2">
          <ChampionshipSettings
            championshipTitle={championshipTitle}
            championshipYear={championshipYear}
            onTitleChange={onTitleChange}
          />
          <PreviousStandingsManager
            onSaveCurrentStandings={saveCurrentStandingsAsPrevious}
            onResetDriversEvolution={resetDriversEvolution}
            onRestorePreviousStandings={restorePreviousStandings}
          />
        </div>
      </TabsContent>
    </>
  );
};

export default AdminTabsContent;
