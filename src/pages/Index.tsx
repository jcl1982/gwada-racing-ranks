
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import HomePage from '@/components/HomePage';
import GeneralStandings from '@/components/GeneralStandings';
import CategoryStandings from '@/components/CategoryStandings';
import ExcelImport from '@/components/ExcelImport';
import AdminPanel from '@/components/AdminPanel';
import { drivers as initialDrivers, montagneRaces as initialMontagneRaces, rallyeRaces as initialRallyeRaces } from '@/data/mockData';
import { calculateChampionshipStandings } from '@/utils/championship';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'montagne' | 'rallye' | 'general' | 'import' | 'admin'>('home');
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [montagneRaces, setMontagneRaces] = useState<Race[]>(initialMontagneRaces);
  const [rallyeRaces, setRallyeRaces] = useState<Race[]>(initialRallyeRaces);
  const [previousStandings, setPreviousStandings] = useState<ChampionshipStanding[]>([]);
  const [championshipTitle, setChampionshipTitle] = useState('Championnat Automobile');
  const [championshipYear, setChampionshipYear] = useState('de Guadeloupe 2024');
  
  const standings = calculateChampionshipStandings(drivers, montagneRaces, rallyeRaces, previousStandings);

  const handleImport = (newRaces: Race[], newDrivers: Driver[]) => {
    console.log('Importing races:', newRaces);
    console.log('New drivers:', newDrivers);
    
    // Sauvegarder les classements actuels comme précédents
    setPreviousStandings(standings);
    
    // Update drivers
    setDrivers(newDrivers);
    
    // Separate races by type and add to existing races
    const newMontagneRaces = newRaces.filter(race => race.type === 'montagne');
    const newRallyeRaces = newRaces.filter(race => race.type === 'rallye');
    
    setMontagneRaces(prev => [...prev, ...newMontagneRaces]);
    setRallyeRaces(prev => [...prev, ...newRallyeRaces]);
  };

  const handleReset = () => {
    setDrivers([]);
    setMontagneRaces([]);
    setRallyeRaces([]);
    setPreviousStandings([]);
  };

  const handleRacesChange = (newMontagneRaces: Race[], newRallyeRaces: Race[]) => {
    setMontagneRaces(newMontagneRaces);
    setRallyeRaces(newRallyeRaces);
  };

  const handleTitleChange = (title: string, year: string) => {
    setChampionshipTitle(title);
    setChampionshipYear(year);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage 
            standings={standings} 
            championshipTitle={championshipTitle}
            championshipYear={championshipYear}
          />
        );
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
      case 'admin':
        return (
          <AdminPanel
            drivers={drivers}
            montagneRaces={montagneRaces}
            rallyeRaces={rallyeRaces}
            standings={standings}
            championshipTitle={championshipTitle}
            championshipYear={championshipYear}
            onDriversChange={setDrivers}
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

export default Index;
