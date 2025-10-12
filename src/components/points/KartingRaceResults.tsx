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
  // Filtrer les pilotes par catégorie
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
