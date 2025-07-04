
import { Trophy } from 'lucide-react';

const PointsEditorHeader = () => {
  return (
    <div className="flex items-center gap-2">
      <Trophy className="w-6 h-6 text-yellow-600" />
      <h2 className="text-2xl font-bold">Édition des Points</h2>
    </div>
  );
};

export default PointsEditorHeader;
