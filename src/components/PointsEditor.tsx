
import { Driver, Race, RaceResult } from '@/types/championship';
import PointsEditorHeader from './points/PointsEditorHeader';
import PointsEditorTabs from './points/PointsEditorTabs';

interface PointsEditorProps {
  drivers: Driver[];
  races: Race[];
  onRaceUpdate: (raceId: string, results: RaceResult[]) => Promise<void>;
}

const PointsEditor = ({ drivers, races, onRaceUpdate }: PointsEditorProps) => {
  return (
    <div className="space-y-6">
      <PointsEditorHeader />
      <PointsEditorTabs
        drivers={drivers}
        races={races}
        onRaceUpdate={onRaceUpdate}
      />
    </div>
  );
};

export default PointsEditor;
