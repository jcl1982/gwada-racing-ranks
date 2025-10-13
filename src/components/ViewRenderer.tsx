
import HomePage from '@/components/HomePage';
import GeneralStandings from '@/components/GeneralStandings';
import CategoryStandings from '@/components/CategoryStandings';
import C2R2Standings from '@/components/C2R2Standings';
import KartingStandings from '@/components/KartingStandings';
import RallyeMontagneTabs from '@/components/RallyeMontagneTabs';
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
  // Ajout des standings par catégorie
  montagneStandings?: ChampionshipStanding[];
  rallyeStandings?: ChampionshipStanding[];
  c2r2Standings?: ChampionshipStanding[];
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
  refreshData,
  montagneStandings = [],
  rallyeStandings = [],
  c2r2Standings = []
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
    case 'montagne':
    case 'rallye':
    case 'c2r2':
      // Utiliser RallyeMontagneTabs pour toutes les vues Rallye-Montagne
      return (
        <RallyeMontagneTabs
          generalStandings={standings}
          montagneStandings={montagneStandings}
          rallyeStandings={rallyeStandings}
          c2r2Standings={c2r2Standings}
          championshipTitle={championshipTitle}
          championshipYear={championshipYear}
          championshipId={championshipId || ''}
          montagneRaces={montagneRaces}
          rallyeRaces={rallyeRaces}
          drivers={drivers}
          onRaceUpdate={async (raceId, results) => {
            // À implémenter si nécessaire
            await refreshData();
          }}
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
            kartingRaces={kartingRaces}
            accelerationRaces={accelerationRaces}
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
            kartingRaces={[]}
            accelerationRaces={accelerationRaces}
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
