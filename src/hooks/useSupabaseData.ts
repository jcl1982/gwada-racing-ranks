
import { useState, useEffect } from 'react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import { loadSupabaseData } from './supabase/dataLoader';
import { createDriverOperations } from './supabase/driverOperations';
import { createRaceOperations } from './supabase/raceOperations';
import { createConfigOperations } from './supabase/configOperations';

export const useSupabaseData = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [previousStandings, setPreviousStandings] = useState<ChampionshipStanding[]>([]);
  const [championshipTitle, setChampionshipTitle] = useState('Championnat Automobile');
  const [championshipYear, setChampionshipYear] = useState('de Guadeloupe 2024');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load all data from Supabase
  const loadData = async () => {
    try {
      setLoading(true);

      const {
        drivers: appDrivers,
        races: appRaces,
        previousStandings: appPreviousStandings,
        championshipTitle: title,
        championshipYear: year
      } = await loadSupabaseData();

      setDrivers(appDrivers);
      setRaces(appRaces);
      setPreviousStandings(appPreviousStandings);
      setChampionshipTitle(title);
      setChampionshipYear(year);

      console.log('✅ Data loaded successfully:', {
        drivers: appDrivers.length,
        races: appRaces.length,
        standings: appPreviousStandings.length
      });

    } catch (error) {
      console.error('❌ Error loading data from Supabase:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données depuis la base de données.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create operation handlers
  const { saveDriver, deleteDriver } = createDriverOperations(toast, loadData);
  const { saveRace, deleteRace } = createRaceOperations(toast, loadData);
  const { updateChampionshipConfig, resetAllData } = createConfigOperations(toast);

  // Enhanced reset function that reloads data after reset
  const handleResetAllData = async () => {
    await resetAllData();
    await loadData();
  };

  // Enhanced config update that updates local state
  const handleUpdateChampionshipConfig = async (title: string, year: string) => {
    await updateChampionshipConfig(title, year);
    setChampionshipTitle(title);
    setChampionshipYear(year);
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  return {
    drivers,
    races: races.filter(race => race.type === 'montagne' || race.type === 'rallye'),
    montagneRaces: races.filter(race => race.type === 'montagne'),
    rallyeRaces: races.filter(race => race.type === 'rallye'),
    previousStandings,
    championshipTitle,
    championshipYear,
    loading,
    saveDriver,
    deleteDriver,
    saveRace,
    deleteRace,
    updateChampionshipConfig: handleUpdateChampionshipConfig,
    resetAllData: handleResetAllData,
    refreshData: loadData
  };
};
