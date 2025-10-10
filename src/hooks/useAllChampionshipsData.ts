import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChampionshipStanding, Driver, Race } from '@/types/championship';
import { calculateChampionshipStandings } from '@/utils/championship';
import { convertSupabaseDriver, convertSupabaseRace } from './supabase/converters';

export interface ChampionshipData {
  id: string;
  title: string;
  year: string;
  drivers: Driver[];
  races: Race[];
  standings: ChampionshipStanding[];
}

export const useAllChampionshipsData = () => {
  const [championships, setChampionships] = useState<ChampionshipData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllChampionships = async () => {
      try {
        // 1. Charger toutes les configurations de championnats
        const { data: configs, error: configError } = await supabase
          .from('championship_config')
          .select('*')
          .order('title');

        if (configError) throw configError;

        // 2. Pour chaque championnat, charger les données
        const championshipsData = await Promise.all(
          (configs || []).map(async (config) => {
            // Charger les pilotes
            const { data: driversData } = await supabase
              .from('drivers')
              .select('*')
              .eq('championship_id', config.id);

            const drivers = (driversData || []).map(convertSupabaseDriver);

            // Charger les courses avec leurs résultats
            const { data: racesData } = await supabase
              .from('races')
              .select(`
                *,
                race_results (
                  id,
                  race_id,
                  driver_id,
                  position,
                  points,
                  dnf,
                  car_model,
                  time,
                  drivers (
                    id,
                    name,
                    number,
                    team,
                    car_model
                  )
                )
              `)
              .eq('championship_id', config.id)
              .order('date', { ascending: false });

            const races = (racesData || []).map((race: any) => convertSupabaseRace(race));

            // Calculer les classements
            const montagneRaces = races.filter(r => r.type === 'montagne');
            const rallyeRaces = races.filter(r => r.type === 'rallye');
            const standings = calculateChampionshipStandings(
              drivers,
              montagneRaces,
              rallyeRaces
            );

            return {
              id: config.id,
              title: config.title,
              year: config.year,
              drivers,
              races,
              standings
            };
          })
        );

        // Sort championships in menu order: Rallye-Montagne, Accélération, Karting
        const orderedChampionships = championshipsData.sort((a, b) => {
          const order = ['Championnat Rallye-Montagne', 'Championnat Accélération', 'Championnat Karting'];
          return order.indexOf(a.title) - order.indexOf(b.title);
        });

        setChampionships(orderedChampionships);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des championnats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllChampionships();
  }, []);

  return { championships, loading };
};
