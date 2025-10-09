import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import CategoryStandings from './CategoryStandings';

interface AccelerationStandingsProps {
  drivers: Driver[];
  accelerationRaces: Race[];
  championshipYear: string;
  previousStandings: ChampionshipStanding[];
}

const AccelerationStandings = ({ 
  drivers, 
  accelerationRaces, 
  championshipYear,
  previousStandings 
}: AccelerationStandingsProps) => {
  return (
    <CategoryStandings
      title="Championnat d'Accélération"
      races={accelerationRaces}
      drivers={drivers}
      type="acceleration"
      championshipYear={championshipYear}
      previousStandings={previousStandings}
    />
  );
};

export default AccelerationStandings;
