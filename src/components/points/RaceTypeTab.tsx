
import { Card } from '@/components/ui/card';
import { Driver, Race } from '@/types/championship';
import RaceCard from './RaceCard';

interface RaceTypeTabProps {
  races: Race[];
  drivers: Driver[];
  raceType: string;
  onRaceUpdate: (raceId: string, results: any[]) => Promise<void>;
  driverLabel?: string;
  selectedRole: 'pilote' | 'copilote';
}

const RaceTypeTab = ({ races, drivers, raceType, onRaceUpdate, driverLabel, selectedRole }: RaceTypeTabProps) => {
  const typeLabels: Record<string, string> = {
    montagne: "Aucune course de montagne disponible",
    rallye: "Aucune course de rallye disponible",
    karting: "Aucune course de karting disponible",
    acceleration: "Aucune course d'accélération disponible",
    c2r2: "Aucune course C2 R2 disponible"
  };

  const emptyMessage = typeLabels[raceType] || `Aucune course ${raceType} disponible`;

  if (races.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </Card>
    );
  }

  const roleLabel = selectedRole === 'pilote' ? 'Pilotes' : 'Copilotes';

  return (
    <div className="space-y-4">
      {races.map(race => (
        <RaceCard
          key={race.id}
          race={race}
          drivers={drivers}
          onRaceUpdate={onRaceUpdate}
          driverLabel={driverLabel}
          roleLabel={roleLabel}
        />
      ))}
    </div>
  );
};

export default RaceTypeTab;
