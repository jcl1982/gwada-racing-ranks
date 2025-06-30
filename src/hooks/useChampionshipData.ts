
import { useState, useEffect } from 'react';
import { drivers as initialDrivers, montagneRaces as initialMontagneRaces, rallyeRaces as initialRallyeRaces } from '@/data/mockData';
import { calculateChampionshipStandings } from '@/utils/championship';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

export const useChampionshipData = () => {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [montagneRaces, setMontagneRaces] = useState<Race[]>(initialMontagneRaces);
  const [rallyeRaces, setRallyeRaces] = useState<Race[]>(initialRallyeRaces);
  const [previousStandings, setPreviousStandings] = useState<ChampionshipStanding[]>([]);
  const [championshipTitle, setChampionshipTitle] = useState('Championnat Automobile');
  const [championshipYear, setChampionshipYear] = useState('de Guadeloupe 2024');
  
  const { data: savedData, saveData, clearData } = useLocalStorage();
  const { toast } = useToast();

  // Load saved data on startup
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

  // Function to automatically save data
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
    
    // Save current standings as previous
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

    // Auto-save after import
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
    
    // Clear saved data
    clearData();
    
    toast({
      title: "Données effacées",
      description: "Toutes les données ont été supprimées.",
    });
  };

  const handleRacesChange = (newMontagneRaces: Race[], newRallyeRaces: Race[]) => {
    setMontagneRaces(newMontagneRaces);
    setRallyeRaces(newRallyeRaces);
    
    // Auto-save after races modification
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
    
    // Auto-save after drivers modification
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
    
    // Auto-save after title modification
    saveCurrentData(
      drivers,
      montagneRaces,
      rallyeRaces,
      previousStandings,
      title,
      year
    );
  };

  return {
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
  };
};
