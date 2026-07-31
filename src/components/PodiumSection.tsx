
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
  const medals = ['🥇', '🥈', '🥉'];
  const rings = [
    'from-primary to-accent',
    'from-muted-foreground/60 to-muted-foreground',
    'from-secondary to-primary',
  ];
  // Ordre visuel : 2e, 1er, 3e sur desktop
  const order = ['md:order-2', 'md:order-1', 'md:order-3'];
  const heights = ['md:-translate-y-3', '', 'md:translate-y-2'];

  return (
    <div className="grid md:grid-cols-3 gap-4 sm:gap-6 items-end">
      {standings.slice(0, 3).map((standing, index) => (
        <Card
          key={standing.driver.id}
          className={`card-glass relative overflow-hidden p-6 text-center transition-transform ${order[index]} ${heights[index]} ${
            index === 0 ? 'ring-2 ring-accent/60 shadow-2xl' : ''
          }`}
        >
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${rings[index]}`} />
          <div
            className={`bg-gradient-to-br ${rings[index]} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-lg`}
          >
            {medals[index]}
          </div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            {standing.position}ᵉ Place
          </h3>
          <p className="font-serif text-xl sm:text-2xl text-foreground leading-tight">
            {standing.driver.name}
          </p>
          <p className="mt-2 font-mono text-lg font-bold text-primary tabular-nums">
            {standing.points} <span className="text-xs text-muted-foreground font-sans">pts</span>
          </p>
        </Card>
      ))}
    </div>
  );
};

export default PodiumSection;
