import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HomePage from '@/components/HomePage';
import GeneralStandings from '@/components/GeneralStandings';
import CategoryStandings from '@/components/CategoryStandings';
import ExcelImport from '@/components/ExcelImport';
import AdminPanel from '@/components/AdminPanel';
import { drivers as initialDrivers, montagneRaces as initialMontagneRaces, rallyeRaces as initialRallyeRaces } from '@/data/mockData';
import { calculateChampionshipStandings } from '@/utils/championship';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'montagne' | 'rallye' | 'general' | 'import' | 'admin'>('home');
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [montagneRaces, setMontagneRaces] = useState<Race[]>(initialMontagneRaces);
  const [rallyeRaces, setRallyeRaces] = useState<Race[]>(initialRallyeRaces);
  const [previousStandings, setPreviousStandings] = useState<ChampionshipStanding[]>([]);
  const [championshipTitle, setChampionshipTitle] = useState('Championnat Automobile');
  const [championshipYear, setChampionshipYear] = useState('de Guadeloupe 2024');
  
  const { data: savedData, saveData, clearData } = useLocalStorage();
  const { toast } = useToast();

  // Charger les données sauvegardées au démarrage
  useEffect(() => {
    if (savedData) {
      setDrivers(savedData.drivers);
      setMontagneRaces(savedData.montagneRaces);
      setRallyeRaces(savedData.rallyeRaces);
      setPreviousStandings(savedData.previousStandings);
      setChampionshipTitle(savedData.championshipTitle);
      setChampionshipYear(savedData.championshipYear);
      
      toast({
        title: "Données chargées",
        description: "Vos données précédentes ont été restaurées.",
      });
    }
  }, [savedData, toast]);

  const standings = calculateChampionshipStandings(drivers, montagneRaces, rallyeRaces, previousStandings);

  // Fonction pour sauvegarder automatiquement les données
  const saveCurrentData = (
    newDrivers: Driver[],
    newMontagneRaces: Race[],
    newRallyeRaces: Race[],
    newPreviousStandings: ChampionshipStanding[],
    newTitle: string,
    newYear: string
  ) => {
    const dataToSave = {
      drivers: newDrivers,
      montagneRaces: newMontagneRaces,
      rallyeRaces: newRallyeRaces,
      previousStandings: newPreviousStandings,
      championshipTitle: newTitle,
      championshipYear: newYear
    };
    saveData(dataToSave);
  };

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
    
    const updatedMontagneRaces = [...montagneRaces, ...newMontagneRaces];
    const updatedRallyeRaces = [...rallyeRaces, ...newRallyeRaces];
    
    setMontagneRaces(updatedMontagneRaces);
    setRallyeRaces(updatedRallyeRaces);

    // Sauvegarder automatiquement après l'import
    saveCurrentData(
      newDrivers,
      updatedMontagneRaces,
      updatedRallyeRaces,
      standings,
      championshipTitle,
      championshipYear
    );

    toast({
      title: "Import sauvegardé",
      description: "Les données ont été importées et sauvegardées automatiquement.",
    });
  };

  const handleReset = () => {
    setDrivers([]);
    setMontagneRaces([]);
    setRallyeRaces([]);
    setPreviousStandings([]);
    
    // Supprimer les données sauvegardées
    clearData();
    
    toast({
      title: "Données effacées",
      description: "Toutes les données ont été supprimées.",
    });
  };

  const handleRacesChange = (newMontagneRaces: Race[], newRallyeRaces: Race[]) => {
    setMontagneRaces(newMontagneRaces);
    setRallyeRaces(newRallyeRaces);
    
    // Sauvegarder automatiquement après modification des courses
    saveCurrentData(
      drivers,
      newMontagneRaces,
      newRallyeRaces,
      previousStandings,
      championshipTitle,
      championshipYear
    );
  };

  const handleDriversChange = (newDrivers: Driver[]) => {
    setDrivers(newDrivers);
    
    // Sauvegarder automatiquement après modification des pilotes
    saveCurrentData(
      newDrivers,
      montagneRaces,
      rallyeRaces,
      previousStandings,
      championshipTitle,
      championshipYear
    );
  };

  const handleTitleChange = (title: string, year: string) => {
    setChampionshipTitle(title);
    setChampionshipYear(year);
    
    // Sauvegarder automatiquement après modification du titre
    saveCurrentData(
      drivers,
      montagneRaces,
      rallyeRaces,
      previousStandings,
      title,
      year
    );
  };

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

export default Index;
