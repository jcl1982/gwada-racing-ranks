
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import HomePage from '@/components/HomePage';
import GeneralStandings from '@/components/GeneralStandings';
import CategoryStandings from '@/components/CategoryStandings';
import ExcelImport from '@/components/ExcelImport';
import { drivers as initialDrivers, montagneRaces as initialMontagneRaces, rallyeRaces as initialRallyeRaces } from '@/data/mockData';
import { calculateChampionshipStandings } from '@/utils/championship';
import { Driver, Race } from '@/types/championship';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'montagne' | 'rallye' | 'general' | 'import'>('home');
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [montagneRaces, setMontagneRaces] = useState<Race[]>(initialMontagneRaces);
  const [rallyeRaces, setRallyeRaces] = useState<Race[]>(initialRallyeRaces);
  
  const standings = calculateChampionshipStandings(drivers, montagneRaces, rallyeRaces);

  const handleImport = (newRaces: Race[], newDrivers: Driver[]) => {
    console.log('Importing races:', newRaces);
    console.log('New drivers:', newDrivers);
    
    // Update drivers
    setDrivers(newDrivers);
    
    // Separate races by type and add to existing races
    const newMontagneRaces = newRaces.filter(race => race.type === 'montagne');
    const newRallyeRaces = newRaces.filter(race => race.type === 'rallye');
    
    setMontagneRaces(prev => [...prev, ...newMontagneRaces]);
    setRallyeRaces(prev => [...prev, ...newRallyeRaces]);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage standings={standings} />;
      case 'general':
        return <GeneralStandings standings={standings} />;
      case 'montagne':
        return (
          <CategoryStandings
            title="Courses de Côte"
            races={montagneRaces}
            drivers={drivers}
            type="montagne"
          />
        );
      case 'rallye':
        return (
          <CategoryStandings
            title="Rallyes"
            races={rallyeRaces}
            drivers={drivers}
            type="rallye"
          />
        );
      case 'import':
        return (
          <ExcelImport
            drivers={drivers}
            onImport={handleImport}
          />
        );
      default:
        return <HomePage standings={standings} />;
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

export default Index;
