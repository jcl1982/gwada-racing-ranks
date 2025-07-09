import { useState, useEffect } from 'react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import { loadSupabaseData } from './supabase/dataLoader';
import { createDriverOperations } from './supabase/driver';
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
      console.log('🔄 Début du chargement des données...');
      setLoading(true);

      const {
        drivers: appDrivers,
        races: appRaces,
        previousStandings: appPreviousStandings,
        championshipTitle: title,
        championshipYear: year
      } = await loadSupabaseData();

      console.log('📊 Données chargées depuis Supabase:', {
        drivers: appDrivers.length,
        races: appRaces.length,
        standings: appPreviousStandings.length
      });

      // Forcer la mise à jour des états
      setDrivers([...appDrivers]);
      setRaces([...appRaces]);
      setPreviousStandings([...appPreviousStandings]);
      setChampionshipTitle(title);
      setChampionshipYear(year);

      console.log('✅ États mis à jour avec succès');

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

  // Create operation handlers with improved refresh
  const { saveDriver, deleteDriver, deleteAllDrivers } = createDriverOperations(toast, loadData);
  const { saveRace, deleteRace } = createRaceOperations(toast, loadData);
  const { updateChampionshipConfig, saveCurrentStandingsAsPrevious, resetDriversEvolution, resetAllData } = createConfigOperations(toast);

  // Enhanced reset function that reloads data after reset
  const handleResetAllData = async () => {
    await resetAllData();
    await loadData();
  };

  // Enhanced save standings function that reloads data after save
  const handleSaveCurrentStandingsAsPrevious = async () => {
    await saveCurrentStandingsAsPrevious();
    await loadData(); // Recharger pour voir les nouveaux previous_standings
  };

  // Enhanced reset drivers evolution function that reloads data after reset
  const handleResetDriversEvolution = async () => {
    await resetDriversEvolution();
    await loadData(); // Recharger pour voir la réinitialisation
  };

  // Enhanced config update that updates local state
  const handleUpdateChampionshipConfig = async (title: string, year: string) => {
    await updateChampionshipConfig(title, year);
    setChampionshipTitle(title);
    setChampionshipYear(year);
  };

  // Enhanced refresh function that forces complete reload
  const forceRefreshData = async () => {
    console.log('🔄 Rafraîchissement forcé des données...');
    await loadData();
    // Attendre un délai pour s'assurer que tous les composants se remettent à jour
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('✅ Rafraîchissement forcé terminé');
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
    c2r2Races: races.filter(race => race.type === 'c2r2'),
    previousStandings,
    championshipTitle,
    championshipYear,
    loading,
    saveDriver,
    deleteDriver,
    deleteAllDrivers,
    saveRace,
    deleteRace,
    updateChampionshipConfig: handleUpdateChampionshipConfig,
    saveCurrentStandingsAsPrevious: handleSaveCurrentStandingsAsPrevious,
    resetDriversEvolution: handleResetDriversEvolution,
    resetAllData: handleResetAllData,
    refreshData: forceRefreshData
  };
};
