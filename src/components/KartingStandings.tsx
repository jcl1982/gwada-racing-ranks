import { useMemo } from 'react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryHeader from '@/components/CategoryHeader';
import RaceCalendar from '@/components/RaceCalendar';
import StandingsTable from '@/components/StandingsTable';
import PodiumSection from '@/components/PodiumSection';

interface KartingStandingsProps {
  races: Race[];
  drivers: Driver[];
  championshipYear: string;
  previousStandings?: ChampionshipStanding[];
}

// Catégories de karting
const KARTING_CATEGORIES = [
  { id: 'mini60', label: 'MINI 60', displayName: 'MINI 60' },
  { id: 'senior', label: 'SENIOR MASTER GENTLEMAN', displayName: 'SENIOR MASTER GENTLEMAN' },
  { id: 'kz2', label: 'KZ2', displayName: 'KZ2' }
];

const KartingStandings = ({ 
  races, 
  drivers, 
  championshipYear,
  previousStandings 
}: KartingStandingsProps) => {
  
  // Fonction pour calculer les classements par catégorie
  const calculateCategoryStandings = (category: string) => {
    // Filtrer les pilotes par catégorie (utilise le champ team pour l'instant)
    const categoryDrivers = drivers.filter(driver => {
      const driverCategory = driver.team?.toLowerCase() || '';
      const searchCategory = category.toLowerCase();
      
      if (searchCategory === 'mini60') {
        return driverCategory.includes('mini') && driverCategory.includes('60');
      } else if (searchCategory === 'senior') {
        return driverCategory.includes('senior') || 
               driverCategory.includes('master') || 
               driverCategory.includes('gentleman');
      } else if (searchCategory === 'kz2') {
        return driverCategory.includes('kz2') || driverCategory.includes('kz 2');
      }
      return false;
    });

    // Calculer les points pour chaque pilote de cette catégorie
    const standingsMap = new Map<string, number>();
    
    categoryDrivers.forEach(driver => {
      let totalPoints = 0;
      
      races.forEach(race => {
        const result = race.results.find(r => r.driverId === driver.id);
        if (result) {
          totalPoints += result.points;
        }
      });
      
      if (totalPoints > 0) {
        standingsMap.set(driver.id, totalPoints);
      }
    });

    // Créer le classement trié
    const standings = categoryDrivers
      .filter(driver => standingsMap.has(driver.id))
      .map(driver => ({
        driver,
        points: standingsMap.get(driver.id) || 0,
        position: 0,
        positionChange: 0,
        previousPosition: undefined
      }))
      .sort((a, b) => b.points - a.points)
      .map((standing, index) => ({
        ...standing,
        position: index + 1
      }));

    return standings;
  };

  // Calculer les classements pour chaque catégorie
  const mini60Standings = useMemo(
    () => calculateCategoryStandings('mini60'),
    [drivers, races]
  );

  const seniorStandings = useMemo(
    () => calculateCategoryStandings('senior'),
    [drivers, races]
  );

  const kz2Standings = useMemo(
    () => calculateCategoryStandings('kz2'),
    [drivers, races]
  );

  return (
    <div className="space-y-6">
      <CategoryHeader 
        displayTitle="Championnat Karting" 
        championshipYear={championshipYear} 
      />
      
      <RaceCalendar races={races} />

      <Tabs defaultValue="mini60" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mini60">MINI 60</TabsTrigger>
          <TabsTrigger value="senior">SENIOR MASTER GENTLEMAN</TabsTrigger>
          <TabsTrigger value="kz2">KZ2</TabsTrigger>
        </TabsList>

        <TabsContent value="mini60" className="space-y-6">
          <StandingsTable
            displayTitle="Classement MINI 60"
            races={races}
            type="karting"
            standings={mini60Standings}
            onPrintPdf={() => {}}
          />
          <PodiumSection standings={mini60Standings} />
        </TabsContent>

        <TabsContent value="senior" className="space-y-6">
          <StandingsTable
            displayTitle="Classement SENIOR MASTER GENTLEMAN"
            races={races}
            type="karting"
            standings={seniorStandings}
            onPrintPdf={() => {}}
          />
          <PodiumSection standings={seniorStandings} />
        </TabsContent>

        <TabsContent value="kz2" className="space-y-6">
          <StandingsTable
            displayTitle="Classement KZ2"
            races={races}
            type="karting"
            standings={kz2Standings}
            onPrintPdf={() => {}}
          />
          <PodiumSection standings={kz2Standings} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KartingStandings;
