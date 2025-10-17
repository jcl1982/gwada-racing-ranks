
import Navigation from '@/components/Navigation';
import ViewRenderer from '@/components/ViewRenderer';
import { useChampionshipData } from '@/hooks/useChampionshipData';
import { useViewNavigation } from '@/hooks/useViewNavigation';

const ChampionshipApp = () => {
  const { currentView, setCurrentView } = useViewNavigation();
  
  const {
    drivers,
    montagneRaces,
    rallyeRaces,
    kartingRaces,
    accelerationRaces,
    standings,
    previousStandings,
    championshipTitle,
    championshipYear,
    championshipId,
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
    refreshData,
    standingsCalculation
  } = useChampionshipData(currentView);

  // Combiner toutes les courses pour l'import
  const races = [...montagneRaces, ...rallyeRaces, ...kartingRaces, ...accelerationRaces];

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
          championshipId={championshipId}
          montagneRaces={montagneRaces}
          rallyeRaces={rallyeRaces}
          kartingRaces={kartingRaces}
          accelerationRaces={accelerationRaces}
          races={races}
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
          refreshData={refreshData}
          montagneStandings={standingsCalculation.montagneStandings}
          rallyeStandings={standingsCalculation.rallyeStandings}
          r2Standings={standingsCalculation.r2Standings}
          copiloteStandings={standingsCalculation.copiloteStandings}
        />
      </div>
    </div>
  );
};

export default ChampionshipApp;
