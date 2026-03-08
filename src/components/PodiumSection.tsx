
import { Card } from '@/components/ui/card';
import { Driver } from '@/types/championship';

interface PodiumSectionProps {
  standings: Array<{
    driver: Driver;
    points: number;
    position: number;
    positionChange?: number;
    previousPosition?: number;
  }>;
}

const PodiumSection = ({ standings }: PodiumSectionProps) => {
  const positions = ['🥇', '🥈', '🥉'];
  const colors = ['from-yellow-400 to-yellow-600', 'from-gray-400 to-gray-600', 'from-amber-600 to-amber-800'];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {standings.slice(0, 3).map((standing, index) => (
        <Card key={standing.driver.id} className="card-glass p-6 text-center">
          <div className={`bg-gradient-to-r ${colors[index]} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl`}>
            {positions[index]}
          </div>
          <h3 className="text-lg font-bold mb-2">{standing.position}ᵉ Place</h3>
          <p className="text-xl font-bold text-foreground">
            {standing.driver.name}
          </p>
          <p className="text-muted-foreground">{standing.points} points</p>
        </Card>
      ))}
    </div>
  );
};

export default PodiumSection;
