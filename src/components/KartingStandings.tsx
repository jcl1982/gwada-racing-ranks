import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import CategoryStandings from './CategoryStandings';

interface KartingStandingsProps {
  drivers: Driver[];
  kartingRaces: Race[];
  championshipYear: string;
  previousStandings: ChampionshipStanding[];
}

const KartingStandings = ({ 
  drivers, 
  kartingRaces, 
  championshipYear,
  previousStandings 
}: KartingStandingsProps) => {
  return (
    <CategoryStandings
      title="Championnat Karting"
      races={kartingRaces}
      drivers={drivers}
      type="karting"
      championshipYear={championshipYear}
      previousStandings={previousStandings}
    />
  );
};

export default KartingStandings;
