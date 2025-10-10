import { useState, useEffect } from 'react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import { loadSupabaseData } from './supabase/dataLoader';
import { createDriverOperations } from './supabase/driver';
import { createRaceOperations } from './supabase/raceOperations';
import { createConfigOperations } from './supabase/configOperations';

export const useSupabaseData = (initialChampionshipId?: string) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [previousStandings, setPreviousStandings] = useState<ChampionshipStanding[]>([]);
  const [championshipTitle, setChampionshipTitle] = useState('Championnat Automobile');
  const [championshipYear, setChampionshipYear] = useState('de Guadeloupe 2025');
  const [championshipId, setChampionshipId] = useState<string | undefined>(initialChampionshipId);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load all data from Supabase
  const loadData = async (specificChampionshipId?: string) => {
    try {
      console.log('🔄 Début du chargement des données...', { specificChampionshipId, currentChampionshipId: championshipId });
      setLoading(true);

      // Utiliser le championshipId spécifique si fourni, sinon utiliser celui en état
      const idToUse = specificChampionshipId || championshipId;

      const {
        drivers: appDrivers,
        races: appRaces,
        previousStandings: appPreviousStandings,
        championshipTitle: title,
        championshipYear: year,
        championshipId: id
      } = await loadSupabaseData(idToUse);

      console.log('📊 Données chargées depuis Supabase:', {
        drivers: appDrivers.length,
        races: appRaces.length,
        standings: appPreviousStandings.length
      });

      // Log détaillé avant mise à jour
      const cafeiereBefore = races.find(r => r.name.includes('Caféière'));
      console.log('📅 AVANT mise à jour état - Course de Côte de Caféière:', cafeiereBefore?.date);
      
      // Forcer la mise à jour des états
      setDrivers([...appDrivers]);
      setRaces([...appRaces]);
      setPreviousStandings([...appPreviousStandings]);
      setChampionshipTitle(title);
      setChampionshipYear(year);
      setChampionshipId(id);

      // Log détaillé après mise à jour
      const cafeiereAfter = appRaces.find(r => r.name.includes('Caféière'));
      console.log('📅 APRÈS mise à jour état - Course de Côte de Caféière:', cafeiereAfter?.date);
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
  const { saveDriver: baseSaveDriver, deleteDriver, deleteAllDrivers } = createDriverOperations(toast, loadData);
  
  // Wrapper pour saveDriver qui passe automatiquement le championshipId
  const saveDriver = async (driver: Omit<Driver, 'id'> | Driver) => {
    console.log('🔧 saveDriver wrapper called with:', { driver, championshipId });
    return baseSaveDriver(driver, championshipId);
  };
  
  const { saveRace: baseSaveRace, deleteRace } = createRaceOperations(toast, loadData, championshipId);
  
  // Wrapper pour saveRace qui passe automatiquement le championshipId
  const saveRace = async (race: Omit<Race, 'id' | 'results'> | Race) => {
    console.log('🔧 saveRace wrapper called with:', { race, championshipId });
    // S'assurer que le championshipId est ajouté à la course
    const raceWithChampionship = {
      ...race,
      championshipId: championshipId || race.championshipId
    };
    return baseSaveRace(raceWithChampionship);
  };
  
  const { updateChampionshipConfig, saveCurrentStandingsAsPrevious, resetDriversEvolution, restorePreviousStandings, resetAllData } = createConfigOperations(toast, championshipId);

  // Enhanced reset function that reloads data after reset
  const handleResetAllData = async () => {
    await resetAllData();
    await loadData();
  };

  // Enhanced save standings function that reloads data after save
  const handleSaveCurrentStandingsAsPrevious = async (saveName?: string) => {
    await saveCurrentStandingsAsPrevious(saveName);
    await loadData(); // Recharger pour voir les nouveaux previous_standings
  };

  // Enhanced reset drivers evolution function that reloads data after reset
  const handleResetDriversEvolution = async () => {
    await resetDriversEvolution();
    await loadData(); // Recharger pour voir la réinitialisation
  };

  // Enhanced restore previous standings function that reloads data after restore
  const handleRestorePreviousStandings = async () => {
    await restorePreviousStandings();
    await loadData(); // Recharger pour voir la restauration
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

  // Load data on component mount or when championshipId changes
  useEffect(() => {
    loadData(championshipId);
  }, [championshipId]);

  return {
    drivers,
    races: races.filter(race => race.type === 'montagne' || race.type === 'rallye'),
    montagneRaces: races.filter(race => race.type === 'montagne'),
    rallyeRaces: races.filter(race => race.type === 'rallye'),
    
    previousStandings,
    championshipTitle,
    championshipYear,
    championshipId,
    loading,
    saveDriver,
    deleteDriver,
    deleteAllDrivers,
    saveRace,
    deleteRace,
    updateChampionshipConfig: handleUpdateChampionshipConfig,
    saveCurrentStandingsAsPrevious: handleSaveCurrentStandingsAsPrevious,
    resetDriversEvolution: handleResetDriversEvolution,
    restorePreviousStandings: handleRestorePreviousStandings,
    resetAllData: handleResetAllData,
    refreshData: forceRefreshData,
    setChampionshipId
  };
};
