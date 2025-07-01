
import Navigation from '@/components/Navigation';
import ViewRenderer from '@/components/ViewRenderer';
import { useChampionshipData } from '@/hooks/useChampionshipData';
import { useViewNavigation } from '@/hooks/useViewNavigation';

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

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <ViewRenderer
          currentView={currentView}
          standings={standings}
          championshipTitle={championshipTitle}
          championshipYear={championshipYear}
          montagneRaces={montagneRaces}
          rallyeRaces={rallyeRaces}
          drivers={drivers}
          handleImport={handleImport}
          handleReset={handleReset}
          handleRacesChange={handleRacesChange}
          handleDriversChange={handleDriversChange}
          handleTitleChange={handleTitleChange}
        />
      </div>
    </div>
  );
};

export default ChampionshipApp;
