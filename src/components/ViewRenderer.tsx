
import HomePage from '@/components/HomePage';
import GeneralStandings from '@/components/GeneralStandings';
import CategoryStandings from '@/components/CategoryStandings';
import R2Standings from '@/components/R2Standings';
import KartingStandings from '@/components/KartingStandings';
import RallyeMontagneTabs from '@/components/RallyeMontagneTabs';
import ExcelImport from '@/components/ExcelImport';
import AdminPanel from '@/components/AdminPanel';
import AdminHub from '@/components/AdminHub';
import RoleProtectedComponent from '@/components/RoleProtectedComponent';
import AdminAccessDenied from '@/components/AdminAccessDenied';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';
import SeasonArchivesViewer from '@/components/SeasonArchivesViewer';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { ViewType } from '@/hooks/useViewNavigation';
import { StandingsTitles, DEFAULT_STANDINGS_TITLES } from '@/hooks/useChampionshipConfig';

interface ViewRendererProps {
  currentView: ViewType;
  standings: ChampionshipStanding[];
  championshipTitle: string;
  championshipYear: string;
  championshipId?: string;
  standingsTitles?: StandingsTitles;
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
  updateStandingsTitles?: (titles: Record<string, string>) => Promise<void>;
  onViewChange: (view: ViewType) => void;
  montagneStandings?: ChampionshipStanding[];
  rallyeStandings?: ChampionshipStanding[];
  r2Standings?: ChampionshipStanding[];
  copiloteStandings?: ChampionshipStanding[];
}

const ViewRenderer = ({
  currentView,
  standings,
  championshipTitle,
  championshipYear,
  championshipId,
  standingsTitles,
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
  refreshData,
  updateStandingsTitles,
  onViewChange,
  montagneStandings = [],
  rallyeStandings = [],
  r2Standings = [],
  copiloteStandings = []
}: ViewRendererProps) => {
  const titles = standingsTitles || DEFAULT_STANDINGS_TITLES;

  switch (currentView) {
    case 'home':
      return (
        <HomePage 
          championshipTitle={championshipTitle}
          championshipYear={championshipYear}
        />
      );
    case 'general':
    case 'montagne':
    case 'rallye':
    case 'r2':
      return (
        <RallyeMontagneTabs
          generalStandings={standings}
          montagneStandings={montagneStandings}
          rallyeStandings={rallyeStandings}
          r2Standings={r2Standings}
          copiloteStandings={copiloteStandings}
          championshipTitle={championshipTitle}
          championshipYear={championshipYear}
          championshipId={championshipId || ''}
          standingsTitles={titles}
          montagneRaces={montagneRaces}
          rallyeRaces={rallyeRaces}
          drivers={drivers}
          onRaceUpdate={async (raceId, results) => {
            await refreshData();
          }}
        />
      );
    case 'acceleration':
      return (
        <CategoryStandings
          title={titles.general || "Classement Accélération"}
          races={accelerationRaces}
          drivers={drivers}
          type="acceleration"
          championshipYear={championshipYear}
          championshipId={championshipId || ''}
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
            console.log('Race update:', raceId, results);
          }}
        />
      );
    case 'archives':
      return <SeasonArchivesViewer />;
    case 'admin-hub':
      return (
        <RoleProtectedComponent 
          requiredRole="admin" 
          fallback={<AdminAccessDenied />}
        >
          <AdminHub onViewChange={onViewChange} />
        </RoleProtectedComponent>
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
            kartingRaces={kartingRaces}
            accelerationRaces={accelerationRaces}
            standings={standings}
            montagneStandings={montagneStandings}
            rallyeStandings={rallyeStandings}
            r2Standings={r2Standings}
            copiloteStandings={copiloteStandings}
            championshipTitle={championshipTitle}
            championshipYear={championshipYear}
            championshipId={championshipId}
            standingsTitles={titles}
            onDriversChange={handleDriversChange}
            onRacesChange={handleRacesChange}
            onReset={handleReset}
            onTitleChange={handleTitleChange}
            onStandingsTitlesChange={updateStandingsTitles}
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
            kartingRaces={[]}
            accelerationRaces={accelerationRaces}
            standings={standings}
            championshipTitle="Championnat Accélération"
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
            kartingRaces={kartingRaces}
            accelerationRaces={[]}
            standings={standings}
            championshipTitle="Championnat Karting"
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
