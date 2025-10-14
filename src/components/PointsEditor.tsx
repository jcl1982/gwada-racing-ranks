
import { Driver, Race, RaceResult } from '@/types/championship';
import PointsEditorHeader from './points/PointsEditorHeader';
import PointsEditorTabs from './points/PointsEditorTabs';

interface PointsEditorProps {
  drivers: Driver[];
  races: Race[];
  onRaceUpdate: (raceId: string, results: RaceResult[]) => Promise<void>;
  driverLabel?: string;
}

const PointsEditor = ({ drivers, races, onRaceUpdate, driverLabel }: PointsEditorProps) => {
  return (
    <div className="space-y-6">
      <PointsEditorHeader />
      <PointsEditorTabs
        drivers={drivers}
        races={races}
        onRaceUpdate={onRaceUpdate}
        driverLabel={driverLabel}
      />
    </div>
  );
};

export default PointsEditor;
