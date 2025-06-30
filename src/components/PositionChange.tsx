
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface PositionChangeProps {
  change: number;
  size?: number;
}

const PositionChange = ({ change, size = 16 }: PositionChangeProps) => {
  if (change === 0) {
    return (
      <div className="flex items-center text-gray-400">
        <Minus size={size} />
      </div>
    );
  }

  if (change > 0) {
    return (
      <div className="flex items-center text-green-600">
        <ArrowUp size={size} />
        <span className="text-xs font-medium ml-1">+{change}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-red-600">
      <ArrowDown size={size} />
      <span className="text-xs font-medium ml-1">{change}</span>
    </div>
  );
};

export default PositionChange;
