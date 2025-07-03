
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

// Helper function to validate UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Helper function to generate UUID
const generateUUID = (): string => {
  return crypto.randomUUID();
};

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

      if (driversError) {
        console.error('Drivers error:', driversError);
        throw driversError;
      }

      // Load races
      const { data: racesData, error: racesError } = await supabase
        .from('races')
        .select('*')
        .order('date');

      if (racesError) {
        console.error('Races error:', racesError);
        throw racesError;
      }

      // Load race results
      const { data: resultsData, error: resultsError } = await supabase
        .from('race_results')
        .select('*');

      if (resultsError) {
        console.error('Results error:', resultsError);
        throw resultsError;
      }

      // Load championship config
      const { data: configData, error: configError } = await supabase
        .from('championship_config')
        .select('*')
        .limit(1);

      if (configError) {
        console.error('Config error:', configError);
        throw configError;
      }

      // Load previous standings
      const { data: standingsData, error: standingsError } = await supabase
        .from('previous_standings')
        .select('*');

      if (standingsError) {
        console.error('Standings error:', standingsError);
        throw standingsError;
      }

      // Convert and set data
      const appDrivers = driversData?.map(convertSupabaseDriverToApp) || [];
      setDrivers(appDrivers);

      const appRaces = racesData?.map(race => {
        const raceResults = resultsData?.filter(result => result.race_id === race.id) || [];
        const typedRace: SupabaseRace = {
          ...race,
          type: race.type as 'montagne' | 'rallye'
        };
        return convertSupabaseRaceToApp(typedRace, raceResults);
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

  // Save driver to Supabase
  const saveDriver = async (driver: Omit<Driver, 'id'> | Driver) => {
    try {
      console.log('💾 Saving driver:', driver);

      if ('id' in driver) {
        // Update existing driver - validate UUID first
        if (!isValidUUID(driver.id)) {
          console.error('❌ Invalid UUID for driver update:', driver.id);
          throw new Error('ID du pilote invalide');
        }

        const { error } = await supabase
          .from('drivers')
          .update({
            name: driver.name,
            number: driver.number,
            updated_at: new Date().toISOString()
          })
          .eq('id', driver.id);

        if (error) {
          console.error('❌ Update driver error:', error);
          throw error;
        }

        console.log('✅ Driver updated successfully');
      } else {
        // Create new driver
        console.log('➕ Creating new driver with data:', {
          name: driver.name,
          number: driver.number
        });

        const { data, error } = await supabase
          .from('drivers')
          .insert({
            name: driver.name,
            number: driver.number
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Insert driver error:', error);
          throw error;
        }

        console.log('✅ Driver created successfully:', data);
      }

      await loadData();
      toast({
        title: "Pilote sauvegardé",
        description: "Le pilote a été sauvegardé avec succès.",
      });
    } catch (error) {
      console.error('❌ Error saving driver:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error instanceof Error ? error.message : "Impossible de sauvegarder le pilote.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Delete driver from Supabase
  const deleteDriver = async (driverId: string) => {
    try {
      console.log('🗑️ Deleting driver with ID:', driverId);

      // Validate UUID
      if (!isValidUUID(driverId)) {
        console.error('❌ Invalid UUID for driver deletion:', driverId);
        throw new Error('ID du pilote invalide');
      }

      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);

      if (error) {
        console.error('❌ Delete driver error:', error);
        throw error;
      }

      console.log('✅ Driver deleted successfully');
      await loadData();
      toast({
        title: "Pilote supprimé",
        description: "Le pilote a été supprimé avec succès.",
      });
    } catch (error) {
      console.error('❌ Error deleting driver:', error);
      toast({
        title: "Erreur de suppression",
        description: error instanceof Error ? error.message : "Impossible de supprimer le pilote.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Save race to Supabase
  const saveRace = async (race: Omit<Race, 'id' | 'results'> | Race) => {
    try {
      console.log('💾 Saving race:', race);
      let raceId: string;
      
      if ('id' in race) {
        // Validate UUID for existing race
        if (!isValidUUID(race.id)) {
          console.error('❌ Invalid UUID for race update:', race.id);
          throw new Error('ID de la course invalide');
        }

        const { error } = await supabase
          .from('races')
          .update({
            name: race.name,
            date: race.date,
            type: race.type,
            updated_at: new Date().toISOString()
          })
          .eq('id', race.id);

        if (error) {
          console.error('❌ Update race error:', error);
          throw error;
        }
        raceId = race.id;

        // Delete existing results
        const { error: deleteError } = await supabase
          .from('race_results')
          .delete()
          .eq('race_id', race.id);

        if (deleteError) {
          console.error('❌ Delete race results error:', deleteError);
          throw deleteError;
        }

        console.log('✅ Race updated successfully');
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

        if (error) {
          console.error('❌ Insert race error:', error);
          throw error;
        }
        raceId = data.id;
        console.log('✅ Race created successfully:', data);
      }

      // Insert race results if they exist
      if ('results' in race && race.results.length > 0) {
        console.log('💾 Saving race results:', race.results.length, 'results');
        
        // Validate all driver IDs before inserting
        for (const result of race.results) {
          if (!isValidUUID(result.driverId)) {
            console.error('❌ Invalid driver UUID in race results:', result.driverId);
            throw new Error(`ID du pilote invalide dans les résultats: ${result.driverId}`);
          }
        }

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

        if (resultsError) {
          console.error('❌ Insert race results error:', resultsError);
          throw resultsError;
        }

        console.log('✅ Race results saved successfully');
      }

      await loadData();
      toast({
        title: "Course sauvegardée",
        description: "La course a été sauvegardée avec succès.",
      });
    } catch (error) {
      console.error('❌ Error saving race:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error instanceof Error ? error.message : "Impossible de sauvegarder la course.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Delete race from Supabase
  const deleteRace = async (raceId: string) => {
    try {
      console.log('🗑️ Deleting race with ID:', raceId);

      // Validate UUID
      if (!isValidUUID(raceId)) {
        console.error('❌ Invalid UUID for race deletion:', raceId);
        throw new Error('ID de la course invalide');
      }

      const { error } = await supabase
        .from('races')
        .delete()
        .eq('id', raceId);

      if (error) {
        console.error('❌ Delete race error:', error);
        throw error;
      }

      console.log('✅ Race deleted successfully');
      await loadData();
      toast({
        title: "Course supprimée",
        description: "La course a été supprimée avec succès.",
      });
    } catch (error) {
      console.error('❌ Error deleting race:', error);
      toast({
        title: "Erreur de suppression",
        description: error instanceof Error ? error.message : "Impossible de supprimer la course.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Update championship config
  const updateChampionshipConfig = async (title: string, year: string) => {
    try {
      console.log('⚙️ Updating championship config:', { title, year });

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

        if (error) {
          console.error('❌ Update config error:', error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('championship_config')
          .insert({ title, year });

        if (error) {
          console.error('❌ Insert config error:', error);
          throw error;
        }
      }

      setChampionshipTitle(title);
      setChampionshipYear(year);

      console.log('✅ Championship config updated successfully');
      toast({
        title: "Configuration mise à jour",
        description: "La configuration du championnat a été mise à jour.",
      });
    } catch (error) {
      console.error('❌ Error updating championship config:', error);
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de mettre à jour la configuration.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Reset all data
  const resetAllData = async () => {
    try {
      console.log('🔄 Resetting all data...');

      // Delete all data in correct order to avoid foreign key constraints
      const { error: resultsError } = await supabase
        .from('race_results')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (resultsError) {
        console.error('❌ Error deleting race results:', resultsError);
        throw resultsError;
      }

      const { error: standingsError } = await supabase
        .from('previous_standings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (standingsError) {
        console.error('❌ Error deleting standings:', standingsError);
        throw standingsError;
      }

      const { error: racesError } = await supabase
        .from('races')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (racesError) {
        console.error('❌ Error deleting races:', racesError);
        throw racesError;
      }

      const { error: driversError } = await supabase
        .from('drivers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (driversError) {
        console.error('❌ Error deleting drivers:', driversError);
        throw driversError;
      }

      console.log('✅ All data reset successfully');
      await loadData();
      toast({
        title: "Données effacées",
        description: "Toutes les données ont été supprimées.",
      });
    } catch (error) {
      console.error('❌ Error resetting data:', error);
      toast({
        title: "Erreur de réinitialisation",
        description: "Impossible de réinitialiser les données.",
        variant: "destructive"
      });
      throw error;
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
