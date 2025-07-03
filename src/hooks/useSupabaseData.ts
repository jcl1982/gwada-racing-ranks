
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Driver, Race, ChampionshipStanding, RaceResult } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';

interface SupabaseDriver {
  id: string;
  name: string;
  team?: string;
  number?: number;
  created_at: string;
  updated_at: string;
}

interface SupabaseRace {
  id: string;
  name: string;
  date: string;
  type: 'montagne' | 'rallye';
  created_at: string;
  updated_at: string;
}

interface SupabaseRaceResult {
  id: string;
  race_id: string;
  driver_id: string;
  position: number;
  points: number;
  time?: string;
  dnf?: boolean;
  created_at: string;
  updated_at: string;
}

interface SupabasePreviousStanding {
  id: string;
  driver_id: string;
  position: number;
  montagne_points: number;
  rallye_points: number;
  total_points: number;
  created_at: string;
}

interface SupabaseChampionshipConfig {
  id: string;
  title: string;
  year: string;
  created_at: string;
  updated_at: string;
}

export const useSupabaseData = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [previousStandings, setPreviousStandings] = useState<ChampionshipStanding[]>([]);
  const [championshipTitle, setChampionshipTitle] = useState('Championnat Automobile');
  const [championshipYear, setChampionshipYear] = useState('de Guadeloupe 2024');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Convert Supabase data to app format
  const convertSupabaseDriverToApp = (supabaseDriver: SupabaseDriver): Driver => ({
    id: supabaseDriver.id,
    name: supabaseDriver.name,
    number: supabaseDriver.number || 0
  });

  const convertSupabaseRaceToApp = (supabaseRace: SupabaseRace, results: SupabaseRaceResult[]): Race => ({
    id: supabaseRace.id,
    name: supabaseRace.name,
    date: supabaseRace.date,
    type: supabaseRace.type,
    results: results.map(result => ({
      driverId: result.driver_id,
      position: result.position,
      points: result.points,
      time: result.time,
      dnf: result.dnf || false
    }))
  });

  // Load all data from Supabase
  const loadData = async () => {
    try {
      setLoading(true);

      // Load drivers
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .order('name');

      if (driversError) throw driversError;

      // Load races
      const { data: racesData, error: racesError } = await supabase
        .from('races')
        .select('*')
        .order('date');

      if (racesError) throw racesError;

      // Load race results
      const { data: resultsData, error: resultsError } = await supabase
        .from('race_results')
        .select('*');

      if (resultsError) throw resultsError;

      // Load championship config
      const { data: configData, error: configError } = await supabase
        .from('championship_config')
        .select('*')
        .limit(1);

      if (configError) throw configError;

      // Load previous standings
      const { data: standingsData, error: standingsError } = await supabase
        .from('previous_standings')
        .select('*');

      if (standingsError) throw standingsError;

      // Convert and set data
      const appDrivers = driversData?.map(convertSupabaseDriverToApp) || [];
      setDrivers(appDrivers);

      const appRaces = racesData?.map(race => {
        const raceResults = resultsData?.filter(result => result.race_id === race.id) || [];
        return convertSupabaseRaceToApp(race, raceResults);
      }) || [];
      setRaces(appRaces);

      if (configData && configData.length > 0) {
        setChampionshipTitle(configData[0].title);
        setChampionshipYear(configData[0].year);
      }

      // Convert previous standings
      const appPreviousStandings: ChampionshipStanding[] = standingsData?.map(standing => {
        const driver = appDrivers.find(d => d.id === standing.driver_id);
        return {
          driver: driver!,
          position: standing.position,
          montagnePoints: standing.montagne_points,
          rallyePoints: standing.rallye_points,
          totalPoints: standing.total_points,
          previousPosition: standing.position,
          positionChange: 0
        };
      }).filter(standing => standing.driver) || [];
      
      setPreviousStandings(appPreviousStandings);

    } catch (error) {
      console.error('Error loading data from Supabase:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données depuis la base de données.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Save driver to Supabase
  const saveDriver = async (driver: Omit<Driver, 'id'> | Driver) => {
    try {
      if ('id' in driver) {
        // Update existing driver
        const { error } = await supabase
          .from('drivers')
          .update({
            name: driver.name,
            number: driver.number,
            updated_at: new Date().toISOString()
          })
          .eq('id', driver.id);

        if (error) throw error;
      } else {
        // Create new driver
        const { data, error } = await supabase
          .from('drivers')
          .insert({
            name: driver.name,
            number: driver.number
          })
          .select()
          .single();

        if (error) throw error;
      }

      await loadData();
      toast({
        title: "Pilote sauvegardé",
        description: "Le pilote a été sauvegardé avec succès.",
      });
    } catch (error) {
      console.error('Error saving driver:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder le pilote.",
        variant: "destructive"
      });
    }
  };

  // Delete driver from Supabase
  const deleteDriver = async (driverId: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);

      if (error) throw error;

      await loadData();
      toast({
        title: "Pilote supprimé",
        description: "Le pilote a été supprimé avec succès.",
      });
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast({
        title: "Erreur de suppression",
        description: "Impossible de supprimer le pilote.",
        variant: "destructive"
      });
    }
  };

  // Save race to Supabase
  const saveRace = async (race: Omit<Race, 'id' | 'results'> | Race) => {
    try {
      let raceId: string;
      
      if ('id' in race) {
        // Update existing race
        const { error } = await supabase
          .from('races')
          .update({
            name: race.name,
            date: race.date,
            type: race.type,
            updated_at: new Date().toISOString()
          })
          .eq('id', race.id);

        if (error) throw error;
        raceId = race.id;

        // Delete existing results
        await supabase
          .from('race_results')
          .delete()
          .eq('race_id', race.id);
      } else {
        // Create new race
        const { data, error } = await supabase
          .from('races')
          .insert({
            name: race.name,
            date: race.date,
            type: race.type
          })
          .select()
          .single();

        if (error) throw error;
        raceId = data.id;
      }

      // Insert race results if they exist
      if ('results' in race && race.results.length > 0) {
        const { error: resultsError } = await supabase
          .from('race_results')
          .insert(
            race.results.map(result => ({
              race_id: raceId,
              driver_id: result.driverId,
              position: result.position,
              points: result.points,
              time: result.time,
              dnf: result.dnf || false
            }))
          );

        if (resultsError) throw resultsError;
      }

      await loadData();
      toast({
        title: "Course sauvegardée",
        description: "La course a été sauvegardée avec succès.",
      });
    } catch (error) {
      console.error('Error saving race:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder la course.",
        variant: "destructive"
      });
    }
  };

  // Delete race from Supabase
  const deleteRace = async (raceId: string) => {
    try {
      const { error } = await supabase
        .from('races')
        .delete()
        .eq('id', raceId);

      if (error) throw error;

      await loadData();
      toast({
        title: "Course supprimée",
        description: "La course a été supprimée avec succès.",
      });
    } catch (error) {
      console.error('Error deleting race:', error);
      toast({
        title: "Erreur de suppression",
        description: "Impossible de supprimer la course.",
        variant: "destructive"
      });
    }
  };

  // Update championship config
  const updateChampionshipConfig = async (title: string, year: string) => {
    try {
      const { data: existingConfig } = await supabase
        .from('championship_config')
        .select('id')
        .limit(1);

      if (existingConfig && existingConfig.length > 0) {
        const { error } = await supabase
          .from('championship_config')
          .update({
            title,
            year,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig[0].id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('championship_config')
          .insert({ title, year });

        if (error) throw error;
      }

      setChampionshipTitle(title);
      setChampionshipYear(year);

      toast({
        title: "Configuration mise à jour",
        description: "La configuration du championnat a été mise à jour.",
      });
    } catch (error) {
      console.error('Error updating championship config:', error);
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de mettre à jour la configuration.",
        variant: "destructive"
      });
    }
  };

  // Reset all data
  const resetAllData = async () => {
    try {
      // Delete all data in correct order
      await supabase.from('race_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('previous_standings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('races').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('drivers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      await loadData();
      toast({
        title: "Données effacées",
        description: "Toutes les données ont été supprimées.",
      });
    } catch (error) {
      console.error('Error resetting data:', error);
      toast({
        title: "Erreur de réinitialisation",
        description: "Impossible de réinitialiser les données.",
        variant: "destructive"
      });
    }
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
    updateChampionshipConfig,
    resetAllData,
    refreshData: loadData
  };
};
