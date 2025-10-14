
import { Card } from '@/components/ui/card';
import { Trophy, Mountain, Car } from 'lucide-react';
import { ChampionshipStanding } from '@/types/championship';

interface GeneralStandingsStatsProps {
  standings: ChampionshipStanding[];
}

const GeneralStandingsStats = ({ standings }: GeneralStandingsStatsProps) => {
  // Filtrer uniquement les pilotes (exclure les copilotes)
  const piloteStandings = standings.filter(s => s.driver.driverRole === 'pilote');
  
  const leader = piloteStandings[0];
  const bestMontagne = [...piloteStandings].sort((a, b) => b.montagnePoints - a.montagnePoints)[0];
  const bestRallye = [...piloteStandings].sort((a, b) => b.rallyePoints - a.rallyePoints)[0];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="card-glass p-6 text-center">
        <div className="gradient-caribbean w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="text-white" size={32} />
        </div>
        <h3 className="text-lg font-bold mb-2">Leader du Championnat</h3>
        <p className="text-2xl font-bold text-blue-600">
          {leader?.driver.name}
        </p>
        <p className="text-gray-600">{leader?.totalPoints} points</p>
      </Card>

      <Card className="card-glass p-6 text-center">
        <div className="gradient-ocean w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mountain className="text-white" size={32} />
        </div>
        <h3 className="text-lg font-bold mb-2">Meilleur en Montagne</h3>
        <p className="text-2xl font-bold text-green-600">
          {bestMontagne?.driver.name}
        </p>
        <p className="text-gray-600">
          {bestMontagne?.montagnePoints} points
        </p>
      </Card>

      <Card className="card-glass p-6 text-center">
        <div className="bg-gradient-to-r from-red-500 to-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Car className="text-white" size={32} />
        </div>
        <h3 className="text-lg font-bold mb-2">Meilleur en Rallye</h3>
        <p className="text-2xl font-bold text-red-600">
          {bestRallye?.driver.name}
        </p>
        <p className="text-gray-600">
          {bestRallye?.rallyePoints} points
        </p>
      </Card>
    </div>
  );
};

export default GeneralStandingsStats;
