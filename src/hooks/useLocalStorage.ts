
import { useState, useEffect } from 'react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';

interface ChampionshipData {
  drivers: Driver[];
  montagneRaces: Race[];
  rallyeRaces: Race[];
  previousStandings: ChampionshipStanding[];
  championshipTitle: string;
  championshipYear: string;
}

const STORAGE_KEY = 'championship-data';

export const useLocalStorage = () => {
  const [data, setData] = useState<ChampionshipData | null>(null);

  // Charger les données depuis le localStorage au démarrage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }, []);

  // Sauvegarder les données dans le localStorage
  const saveData = (newData: ChampionshipData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Supprimer les données du localStorage
  const clearData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setData(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return {
    data,
    saveData,
    clearData
  };
};
