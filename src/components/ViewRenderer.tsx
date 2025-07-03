
import HomePage from '@/components/HomePage';
import GeneralStandings from '@/components/GeneralStandings';
import CategoryStandings from '@/components/CategoryStandings';
import ExcelImport from '@/components/ExcelImport';
import AdminPanel from '@/components/AdminPanel';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { ViewType } from '@/hooks/useViewNavigation';

interface ViewRendererProps {
  currentView: ViewType;
  standings: ChampionshipStanding[];
  championshipTitle: string;
  championshipYear: string;
  montagneRaces: Race[];
  rallyeRaces: Race[];
  drivers: Driver[];
  handleImport: (newRaces: Race[], newDrivers: Driver[]) => void;
  handleReset: () => void;
  handleRacesChange: (newMontagneRaces: Race[], newRallyeRaces: Race[]) => void;
  handleDriversChange: (newDrivers: Driver[]) => void;
  handleTitleChange: (title: string, year: string) => void;
  saveDriver: (driver: Omit<Driver, 'id'> | Driver) => Promise<void>;
  deleteDriver: (driverId: string) => Promise<void>;
  saveRace: (race: Omit<Race, 'id' | 'results'> | Race) => Promise<void>;
  deleteRace: (raceId: string) => Promise<void>;
}

const ViewRenderer = ({
  currentView,
  standings,
  championshipTitle,
  championshipYear,
  montagneRaces,
  rallyeRaces,
  drivers,
  handleImport,
  handleReset,
  handleRacesChange,
  handleDriversChange,
  handleTitleChange,
  saveDriver,
  deleteDriver,
  saveRace,
  deleteRace
}: ViewRendererProps) => {
  switch (currentView) {
    case 'home':
      return (
        <HomePage 
          standings={standings} 
          championshipTitle={championshipTitle}
          championshipYear={championshipYear}
          montagneRaces={montagneRaces}
          rallyeRaces={rallyeRaces}
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
        />
      );
    case 'import':
      return (
        <ExcelImport
          drivers={drivers}
          onImport={handleImport}
        />
      );
    case 'admin':
      return (
        <AdminPanel
          drivers={drivers}
          montagneRaces={montagneRaces}
          rallyeRaces={rallyeRaces}
          standings={standings}
          championshipTitle={championshipTitle}
          championshipYear={championshipYear}
          onDriversChange={handleDriversChange}
          onRacesChange={handleRacesChange}
          onReset={handleReset}
          onTitleChange={handleTitleChange}
          saveDriver={saveDriver}
          deleteDriver={deleteDriver}
          saveRace={saveRace}
          deleteRace={deleteRace}
        />
      );
    default:
      return (
        <HomePage 
          standings={standings} 
          championshipTitle={championshipTitle}
          championshipYear={championshipYear}
          montagneRaces={montagneRaces}
          rallyeRaces={rallyeRaces}
        />
      );
  }
};

export default ViewRenderer;
