
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface PositionChangeProps {
  change: number;
  size?: number;
}

const PositionChange = ({ change, size = 16 }: PositionChangeProps) => {
  if (change === 0) {
    return (
      <div className="flex items-center text-muted-foreground/60">
        <Minus size={size} className="opacity-50" />
      </div>
    );
  }

  if (change > 0) {
    return (
      <div className="flex items-center text-green-600 dark:text-green-500">
        <ArrowUp size={size} className="animate-pulse" />
        <span className="text-xs font-bold ml-1">+{change}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-red-600 dark:text-red-500">
      <ArrowDown size={size} className="animate-pulse" />
      <span className="text-xs font-bold ml-1">{change}</span>
    </div>
  );
};

export default PositionChange;
