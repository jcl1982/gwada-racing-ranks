
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';

export interface SeasonArchive {
  id: string;
  championship_id: string | null;
  title: string;
  year: string;
  archived_at: string;
  config_data: Record<string, any>;
  drivers_data: any[];
  races_data: any[];
  standings_data: Record<string, any>;
}

export const useSeasonArchives = () => {
  const { toast } = useToast();
  const [archives, setArchives] = useState<SeasonArchive[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchArchives = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('season_archives')
        .select('*')
        .order('archived_at', { ascending: false });

      if (error) throw error;
      setArchives((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching archives:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  const archiveSeason = useCallback(async (
    championshipId: string,
    title: string,
    year: string,
    drivers: Driver[],
    races: Race[],
    standings: Record<string, ChampionshipStanding[]>,
    configData: Record<string, any>
  ) => {
    try {
      // Serialize standings - convert driver objects to plain data with per-race points
      const serializeStandings = (standingsList: ChampionshipStanding[], relevantRaces: Race[]) =>
        standingsList.map(s => {
          // Calculate per-race points for this driver
          const racePoints: Record<string, number> = {};
          relevantRaces.forEach(race => {
            const result = race.results.find(r => r.driverId === s.driver.id);
            if (result && result.points > 0) {
              racePoints[race.name] = result.points;
            }
          });

          return {
            driverName: s.driver.name,
            driverTeam: s.driver.team,
            driverNumber: s.driver.number,
            driverCarModel: s.driver.carModel,
            driverRole: s.driver.driverRole,
            position: s.position,
            montagnePoints: s.montagnePoints,
            rallyePoints: s.rallyePoints,
            totalPoints: s.totalPoints,
            positionChange: s.positionChange,
            racePoints,
          };
        });

      const standingsData: Record<string, any> = {};
      // Build race lists per category for per-race point tracking
      const montagneRaces = races.filter(r => r.type === 'montagne');
      const rallyeRaces = races.filter(r => r.type === 'rallye');
      const allRaces = races;

      const racesByCategory: Record<string, Race[]> = {
        general: allRaces,
        montagne: montagneRaces,
        rallye: rallyeRaces,
        r2: allRaces,
        copilote: rallyeRaces,
      };

      for (const [key, value] of Object.entries(standings)) {
        standingsData[key] = serializeStandings(value, racesByCategory[key] || allRaces);
      }

      // Dédupliquer les courses par ID pour éviter les doublons dans l'archive
      const uniqueRaces = races.filter((race, index, self) =>
        index === self.findIndex(r => r.id === race.id)
      );

      const driversData = drivers.map(d => ({
        name: d.name,
        team: d.team,
        number: d.number,
        carModel: d.carModel,
        driverRole: d.driverRole,
      }));

      const racesData = uniqueRaces.map(r => ({
        name: r.name,
        date: r.date,
        endDate: r.endDate,
        type: r.type,
        organizer: r.organizer,
        resultsCount: r.results.length,
        results: r.results.map(res => {
          const driver = drivers.find(d => d.id === res.driverId);
          return {
            driverName: driver?.name || 'Inconnu',
            position: res.position,
            points: res.points,
            time: res.time,
            dnf: res.dnf,
            carModel: res.carModel,
            category: res.category,
            bonus: res.bonus,
          };
        }),
      }));

      const { error } = await supabase
        .from('season_archives')
        .insert({
          championship_id: championshipId,
          title,
          year,
          config_data: configData as any,
          drivers_data: driversData as any,
          races_data: racesData as any,
          standings_data: standingsData as any,
        } as any);

      if (error) throw error;

      toast({
        title: "Saison archivée",
        description: `La saison "${title} ${year}" a été archivée avec succès.`,
      });

      await fetchArchives();
    } catch (error) {
      console.error('Error archiving season:', error);
      toast({
        title: "Erreur d'archivage",
        description: "Impossible d'archiver la saison.",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast, fetchArchives]);

  const deleteArchive = useCallback(async (archiveId: string) => {
    try {
      const { error } = await supabase
        .from('season_archives')
        .delete()
        .eq('id', archiveId);

      if (error) throw error;

      toast({
        title: "Archive supprimée",
        description: "L'archive a été supprimée.",
      });

      await fetchArchives();
    } catch (error) {
      console.error('Error deleting archive:', error);
      toast({
        title: "Erreur de suppression",
        description: "Impossible de supprimer l'archive.",
        variant: "destructive"
      });
    }
  }, [toast, fetchArchives]);

  return {
    archives,
    loading,
    archiveSeason,
    deleteArchive,
    fetchArchives,
  };
};
