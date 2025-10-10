
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
    previousStandings,
    championshipTitle,
    championshipYear,
    loading,
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
    saveCurrentStandingsAsPrevious,
    resetDriversEvolution,
    restorePreviousStandings
  } = useChampionshipData();

  const { currentView, setCurrentView } = useViewNavigation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Chargement des données...</p>
        </div>
      </div>
    );
  }

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
          previousStandings={previousStandings}
          handleImport={handleImport}
          handleReset={handleReset}
          handleRacesChange={handleRacesChange}
          handleDriversChange={handleDriversChange}
          handleTitleChange={handleTitleChange}
          saveDriver={saveDriver}
          deleteDriver={deleteDriver}
          deleteAllDrivers={deleteAllDrivers}
          saveRace={saveRace}
          deleteRace={deleteRace}
          saveCurrentStandingsAsPrevious={saveCurrentStandingsAsPrevious}
          resetDriversEvolution={resetDriversEvolution}
          restorePreviousStandings={restorePreviousStandings}
        />
      </div>
    </div>
  );
};

export default ChampionshipApp;
