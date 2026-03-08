
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Driver, Race, ChampionshipStanding, RaceResult } from '@/types/championship';
import AdminHeader from './admin/AdminHeader';
import AdminTabsList from './admin/AdminTabsList';
import AdminTabsContent from './admin/AdminTabsContent';
import { StandingsTitles } from '@/hooks/useChampionshipConfig';

interface AdminPanelProps {
  drivers: Driver[];
  montagneRaces: Race[];
  rallyeRaces: Race[];
  kartingRaces: Race[];
  accelerationRaces: Race[];
  standings: ChampionshipStanding[];
  championshipTitle: string;
  championshipYear: string;
  championshipId?: string;
  standingsTitles?: StandingsTitles;
  onDriversChange: (drivers: Driver[]) => void;
  onRacesChange: (montagneRaces: Race[], rallyeRaces: Race[]) => void;
  onReset: () => void;
  onTitleChange: (title: string, year: string) => void;
  onStandingsTitlesChange?: (titles: Record<string, string>) => Promise<void>;
  saveDriver: (driver: Omit<Driver, 'id'> | Driver) => Promise<void>;
  deleteDriver: (driverId: string) => Promise<void>;
  deleteAllDrivers: () => Promise<void>;
  saveRace: (race: Omit<Race, 'id' | 'results'> | Race) => Promise<void>;
  deleteRace: (raceId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AdminPanel = ({
  drivers,
  montagneRaces,
  rallyeRaces,
  kartingRaces,
  accelerationRaces,
  standings,
  championshipTitle,
  championshipYear,
  championshipId,
  standingsTitles,
  onDriversChange,
  onRacesChange,
  onReset,
  onTitleChange,
  onStandingsTitlesChange,
  saveDriver,
  deleteDriver,
  deleteAllDrivers,
  saveRace,
  deleteRace,
  refreshData
}: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState('drivers');

  const handleRaceUpdate = async (raceId: string, results: RaceResult[]) => {
    const allRaces = [...montagneRaces, ...rallyeRaces, ...kartingRaces, ...accelerationRaces];
    const raceToUpdate = allRaces.find(race => race.id === raceId);
    
    if (!raceToUpdate) {
      throw new Error('Course introuvable');
    }

    const updatedRace: Race = {
      ...raceToUpdate,
      results
    };

    await saveRace(updatedRace);
  };

  return (
    <div className="space-y-6">
      <Card className="card-glass p-6">
        <AdminHeader onReset={onReset} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <AdminTabsList />

          <AdminTabsContent
            drivers={drivers}
            montagneRaces={montagneRaces}
            rallyeRaces={rallyeRaces}
            kartingRaces={kartingRaces}
            accelerationRaces={accelerationRaces}
            standings={standings}
            championshipTitle={championshipTitle}
            championshipYear={championshipYear}
            championshipId={championshipId}
            standingsTitles={standingsTitles}
            onDriversChange={onDriversChange}
            onRacesChange={onRacesChange}
            onTitleChange={onTitleChange}
            onStandingsTitlesChange={onStandingsTitlesChange}
            saveDriver={saveDriver}
            deleteDriver={deleteDriver}
            deleteAllDrivers={deleteAllDrivers}
            saveRace={saveRace}
            deleteRace={deleteRace}
            refreshData={refreshData}
            onRaceUpdate={handleRaceUpdate}
          />
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminPanel;
