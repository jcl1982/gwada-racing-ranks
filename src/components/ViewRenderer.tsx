
import HomePage from '@/components/HomePage';
import GeneralStandings from '@/components/GeneralStandings';
import CategoryStandings from '@/components/CategoryStandings';
import C2R2Standings from '@/components/C2R2Standings';
import KartingStandings from '@/components/KartingStandings';
import ExcelImport from '@/components/ExcelImport';
import AdminPanel from '@/components/AdminPanel';
import RoleProtectedComponent from '@/components/RoleProtectedComponent';
import AdminAccessDenied from '@/components/AdminAccessDenied';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { ViewType } from '@/hooks/useViewNavigation';

interface ViewRendererProps {
  currentView: ViewType;
  standings: ChampionshipStanding[];
  championshipTitle: string;
  championshipYear: string;
  championshipId?: string;
  montagneRaces: Race[];
  rallyeRaces: Race[];
  kartingRaces: Race[];
  accelerationRaces: Race[];
  races: Race[];
  drivers: Driver[];
  previousStandings: Record<string, ChampionshipStanding[]>;
  handleImport: (newRaces: Race[], newDrivers: Driver[]) => Promise<void>;
  handleReset: () => void;
  handleRacesChange: (newMontagneRaces: Race[], newRallyeRaces: Race[]) => void;
  handleDriversChange: (newDrivers: Driver[]) => void;
  handleTitleChange: (title: string, year: string) => void;
  saveDriver: (driver: Omit<Driver, 'id'> | Driver) => Promise<void>;
  deleteDriver: (driverId: string) => Promise<void>;
  deleteAllDrivers: () => Promise<void>;
  saveRace: (race: Omit<Race, 'id' | 'results'> | Race) => Promise<void>;
  deleteRace: (raceId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const ViewRenderer = ({
  currentView,
  standings,
  championshipTitle,
  championshipYear,
  championshipId,
  montagneRaces,
  rallyeRaces,
  kartingRaces,
  accelerationRaces,
  races,
  drivers,
  previousStandings,
  handleImport,
  handleReset,
  handleRacesChange,
  handleDriversChange,
  handleTitleChange,
  saveDriver,
  deleteDriver,
  deleteAllDrivers,
  saveRace,
  deleteRace,
  refreshData
}: ViewRendererProps) => {
  switch (currentView) {
    case 'home':
      return (
        <HomePage 
          championshipTitle={championshipTitle}
          championshipYear={championshipYear}
        />
      );
    case 'general':
      return (
        <GeneralStandings 
          standings={standings} 
          championshipTitle={championshipTitle}
          championshipYear={championshipYear}
        />
      );
    case 'montagne':
      return (
        <CategoryStandings
          title="Courses de Côte"
          races={montagneRaces}
          drivers={drivers}
          type="montagne"
          championshipYear={championshipYear}
          previousStandings={previousStandings.montagne}
        />
      );
    case 'rallye':
      return (
        <CategoryStandings
          title="Rallyes"
          races={rallyeRaces}
          drivers={drivers}
          type="rallye"
          championshipYear={championshipYear}
          previousStandings={previousStandings.rallye}
        />
      );
    case 'c2r2':
      return (
        <C2R2Standings
          drivers={drivers}
          montagneRaces={montagneRaces}
          rallyeRaces={rallyeRaces}
          championshipYear={championshipYear}
          previousStandings={previousStandings.c2r2}
        />
      );
    case 'acceleration':
      return (
        <CategoryStandings
          title="Championnat Accélération"
          races={accelerationRaces}
          drivers={drivers}
          type="acceleration"
          championshipYear={championshipYear}
          previousStandings={[]}
        />
      );
    case 'karting':
      return (
        <KartingStandings
          races={kartingRaces}
          drivers={drivers}
          championshipYear={championshipYear}
          previousStandings={previousStandings.karting || []}
          onRaceUpdate={async (raceId, results) => {
            // Implementation will be handled by parent
            console.log('Race update:', raceId, results);
          }}
        />
      );
    case 'import':
      return (
        <RoleProtectedComponent 
          requiredRole="admin" 
          fallback={<AdminAccessDenied />}
        >
          <ExcelImport
            drivers={drivers}
            races={races}
            onImport={handleImport}
            championshipId={championshipId}
            
          />
        </RoleProtectedComponent>
      );
    case 'admin':
      return (
        <RoleProtectedComponent 
          requiredRole="admin" 
          fallback={<AdminAccessDenied />}
        >
          <AdminPanel
            drivers={drivers}
            montagneRaces={montagneRaces}
            rallyeRaces={rallyeRaces}
            standings={standings}
            championshipTitle={championshipTitle}
            championshipYear={championshipYear}
            championshipId={championshipId}
            onDriversChange={handleDriversChange}
            onRacesChange={handleRacesChange}
            onReset={handleReset}
            onTitleChange={handleTitleChange}
            saveDriver={saveDriver}
            deleteDriver={deleteDriver}
            deleteAllDrivers={deleteAllDrivers}
            saveRace={saveRace}
            deleteRace={deleteRace}
            refreshData={refreshData}
          />
        </RoleProtectedComponent>
      );
    case 'admin-acceleration':
      return (
        <RoleProtectedComponent 
          requiredRole="admin" 
          fallback={<AdminAccessDenied />}
        >
          <AdminPanel
            drivers={drivers}
            montagneRaces={[]}
            rallyeRaces={[]}
            standings={standings}
            championshipTitle="Championnat Accélération"
            championshipYear={championshipYear}
            onDriversChange={handleDriversChange}
            onRacesChange={handleRacesChange}
            onReset={handleReset}
            onTitleChange={handleTitleChange}
            saveDriver={saveDriver}
            deleteDriver={deleteDriver}
            deleteAllDrivers={deleteAllDrivers}
            saveRace={saveRace}
            deleteRace={deleteRace}
            refreshData={refreshData}
          />
        </RoleProtectedComponent>
      );
    case 'admin-karting':
      return (
        <RoleProtectedComponent 
          requiredRole="admin" 
          fallback={<AdminAccessDenied />}
        >
          <AdminPanel
            drivers={drivers}
            montagneRaces={[]}
            rallyeRaces={[]}
            standings={standings}
            championshipTitle="Championnat Karting"
            championshipYear={championshipYear}
            onDriversChange={handleDriversChange}
            onRacesChange={handleRacesChange}
            onReset={handleReset}
            onTitleChange={handleTitleChange}
            saveDriver={saveDriver}
            deleteDriver={deleteDriver}
            deleteAllDrivers={deleteAllDrivers}
            saveRace={saveRace}
            deleteRace={deleteRace}
            refreshData={refreshData}
          />
        </RoleProtectedComponent>
      );
    default:
      return (
        <HomePage 
          championshipTitle={championshipTitle}
          championshipYear={championshipYear}
        />
      );
  }
};

export default ViewRenderer;
