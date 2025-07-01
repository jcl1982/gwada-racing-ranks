
import Navigation from '@/components/Navigation';
import HomePage from '@/components/HomePage';
import GeneralStandings from '@/components/GeneralStandings';
import CategoryStandings from '@/components/CategoryStandings';
import ExcelImport from '@/components/ExcelImport';
import AdminPanel from '@/components/AdminPanel';
import { useChampionshipData } from '@/hooks/useChampionshipData';
import { useViewNavigation, ViewType } from '@/hooks/useViewNavigation';

const ChampionshipApp = () => {
  const {
    drivers,
    montagneRaces,
    rallyeRaces,
    standings,
    championshipTitle,
    championshipYear,
    handleImport,
    handleReset,
    handleRacesChange,
    handleDriversChange,
    handleTitleChange
  } = useChampionshipData();

  const { currentView, setCurrentView } = useViewNavigation();

  const renderCurrentView = () => {
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

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default ChampionshipApp;
