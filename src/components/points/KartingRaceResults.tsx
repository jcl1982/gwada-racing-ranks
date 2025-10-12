import { Card } from '@/components/ui/card';
import { Driver, Race } from '@/types/championship';
import RaceCard from './RaceCard';

interface KartingRaceResultsProps {
  races: Race[];
  drivers: Driver[];
  category: string;
  onRaceUpdate: (raceId: string, results: any[]) => Promise<void>;
}

const KartingRaceResults = ({ races, drivers, category, onRaceUpdate }: KartingRaceResultsProps) => {
  // Récupérer tous les pilotes qui ont participé aux courses de cette catégorie
  const getCategoryDrivers = () => {
    const driverIds = new Set<string>();
    
    races.forEach(race => {
      race.results.forEach(result => {
        const resultCategory = result.category?.toLowerCase() || '';
        const searchCategory = category.toLowerCase();
        
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
        
        if (isMatchingCategory) {
          driverIds.add(result.driverId);
        }
      });
    });
    
    return drivers.filter(d => driverIds.has(d.id));
  };
  
  const categoryDrivers = getCategoryDrivers();

  const emptyMessage = category === 'mini60' 
    ? "Aucune course MINI 60 disponible"
    : category === 'senior'
    ? "Aucune course SENIOR MASTER GENTLEMAN disponible"
    : "Aucune course KZ2 disponible";

  if (races.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {races.map(race => (
        <RaceCard
          key={race.id}
          race={race}
          drivers={categoryDrivers}
          onRaceUpdate={onRaceUpdate}
        />
      ))}
    </div>
  );
};

export default KartingRaceResults;
