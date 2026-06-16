import { useMemo } from 'react';
import { Driver, Race, ChampionshipStanding, RaceResult } from '@/types/championship';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CategoryHeader from '@/components/CategoryHeader';
import RaceCalendar from '@/components/RaceCalendar';
import StandingsTable from '@/components/StandingsTable';
import PodiumSection from '@/components/PodiumSection';
import KartingRaceResults from '@/components/points/KartingRaceResults';
import { useUrlTab } from '@/hooks/useUrlTab';

interface KartingStandingsProps {
  races: Race[];
  drivers: Driver[];
  championshipYear: string;
  previousStandings?: ChampionshipStanding[];
  onRaceUpdate: (raceId: string, results: RaceResult[]) => Promise<void>;
}

// Catégories de karting
const KARTING_CATEGORIES = [
  { id: 'mini60', label: 'MINI 60', displayName: 'MINI 60' },
  { id: 'senior', label: 'SENIOR MASTER GENTLEMAN', displayName: 'SENIOR MASTER GENTLEMAN' },
  { id: 'kz2', label: 'KZ2', displayName: 'KZ2' }
] as const;

const KartingStandings = ({ 
  races, 
  drivers, 
  championshipYear,
  previousStandings,
  onRaceUpdate
}: KartingStandingsProps) => {
  
  // Fonction pour calculer les classements par catégorie basée sur les résultats importés
  const calculateCategoryStandings = (category: string) => {
    console.log(`📊 Calcul du classement pour la catégorie: ${category}`);
    
    // Créer une map pour accumuler les points par pilote
    const standingsMap = new Map<string, { 
      totalPoints: number, 
      totalBonus: number,
      driverName: string 
    }>();
    
    // Parcourir toutes les courses et leurs résultats
    races.forEach(race => {
      console.log(`  📝 Course: ${race.name}`);
      race.results.forEach(result => {
        // Récupérer la catégorie du résultat (depuis l'import)
        const resultCategory = result.category?.toLowerCase() || '';
        const searchCategory = category.toLowerCase();
        
        // Vérifier si le résultat correspond à la catégorie recherchée
        let isMatchingCategory = false;
        
        if (searchCategory === 'mini60') {
          isMatchingCategory = resultCategory.includes('mini') && resultCategory.includes('60');
        } else if (searchCategory === 'senior') {
          isMatchingCategory = resultCategory.includes('senior') || 
                             resultCategory.includes('master') || 
                             resultCategory.includes('gentleman');
        } else if (searchCategory === 'kz2') {
          isMatchingCategory = resultCategory.includes('kz2') || resultCategory.includes('kz 2');
        }
        
        // Si le résultat correspond, accumuler les points et bonus
        if (isMatchingCategory) {
          const driver = drivers.find(d => d.id === result.driverId);
          const current = standingsMap.get(result.driverId) || { 
            totalPoints: 0, 
            totalBonus: 0,
            driverName: driver?.name || 'Unknown'
          };
          const pointsWithBonus = result.points + (result.bonus || 0);
          standingsMap.set(result.driverId, {
            totalPoints: current.totalPoints + pointsWithBonus,
            totalBonus: current.totalBonus + (result.bonus || 0),
            driverName: current.driverName
          });
          console.log(`    ✅ ${current.driverName}: +${result.points} pts + ${result.bonus || 0} bonus (catégorie: ${result.category})`);
        }
      });
    });

    console.log(`  📊 Total pilotes dans la catégorie ${category}: ${standingsMap.size}`);

    // Créer le classement avec tous les pilotes qui ont des points dans cette catégorie
    const standings = Array.from(standingsMap.entries())
      .map(([driverId, data]) => {
        const driver = drivers.find(d => d.id === driverId);
        if (!driver) return null;
        
        return {
          driver,
          points: data.totalPoints,
          bonus: data.totalBonus,
          position: 0,
          positionChange: 0,
          previousPosition: undefined
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .sort((a, b) => b.points - a.points)
      .map((standing, index) => {
        console.log(`    ${index + 1}. ${standing.driver.name}: ${standing.points} pts (bonus: ${standing.bonus})`);
        return {
          ...standing,
          position: index + 1
        };
      });

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

  const [kartingTab, setKartingTab] = useUrlTab('karting', 'mini60');

  const getCategoryLabel = (id: string) => {
    return KARTING_CATEGORIES.find(cat => cat.id === id)?.label ?? id;
  };

  const currentStandings = kartingTab === 'mini60' ? mini60Standings :
                           kartingTab === 'senior' ? seniorStandings : kz2Standings;

  const currentDisplayTitle = kartingTab === 'mini60' ? 'Classement Général MINI 60' :
                               kartingTab === 'senior' ? 'Classement Général SENIOR MASTER GENTLEMAN' :
                               'Classement Général KZ2';

  const currentRaceTitle = kartingTab === 'mini60' ? 'Résultats par Course MINI 60' :
                            kartingTab === 'senior' ? 'Résultats par Course SENIOR MASTER GENTLEMAN' :
                            'Résultats par Course KZ2';

  return (
    <div className="space-y-6">
      <CategoryHeader 
        displayTitle="Championnat Karting" 
        championshipYear={championshipYear} 
      />
      
      <RaceCalendar races={races} driverIds={drivers.map(d => d.id)} />

      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">Note :</span> Bonus = Points issus du meilleur temps dans la finale
        </p>
      </div>

      {/* Sélecteur de catégorie */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-sm font-medium shrink-0">Catégorie :</label>
        <Select value={kartingTab} onValueChange={setKartingTab}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {KARTING_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        <StandingsTable
          displayTitle={currentDisplayTitle}
          races={races}
          type="karting"
          standings={currentStandings}
          onPrintPdf={() => {}}
        />
        <PodiumSection standings={currentStandings} />
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">{currentRaceTitle}</h3>
        <KartingRaceResults
          races={races}
          drivers={drivers}
          category={kartingTab}
          onRaceUpdate={onRaceUpdate}
        />
      </div>
    </div>
  );
};

export default KartingStandings;
