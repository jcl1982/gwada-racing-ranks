
import { Card } from '@/components/ui/card';
import { Driver, Race } from '@/types/championship';
import RaceCard from './RaceCard';

interface RaceTypeTabProps {
  races: Race[];
  drivers: Driver[];
  raceType: 'montagne' | 'rallye';
  onRaceUpdate: (raceId: string, results: any[]) => Promise<void>;
}

const RaceTypeTab = ({ races, drivers, raceType, onRaceUpdate }: RaceTypeTabProps) => {
  const emptyMessage = raceType === 'montagne' 
    ? "Aucune course de montagne disponible"
    : "Aucune course de rallye disponible";

  if (races.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {races.map(race => (
        <RaceCard
          key={race.id}
          race={race}
          drivers={drivers}
          onRaceUpdate={onRaceUpdate}
        />
      ))}
    </div>
  );
};

export default RaceTypeTab;
