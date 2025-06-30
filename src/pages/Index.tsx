
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import HomePage from '@/components/HomePage';
import GeneralStandings from '@/components/GeneralStandings';
import CategoryStandings from '@/components/CategoryStandings';
import { drivers, montagneRaces, rallyeRaces } from '@/data/mockData';
import { calculateChampionshipStandings } from '@/utils/championship';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'montagne' | 'rallye' | 'general'>('home');
  
  const standings = calculateChampionshipStandings(drivers, montagneRaces, rallyeRaces);

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
