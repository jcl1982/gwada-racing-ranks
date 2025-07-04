
import { Driver, Race, RaceResult } from '@/types/championship';
import PointsEditorHeader from './points/PointsEditorHeader';
import PointsEditorTabs from './points/PointsEditorTabs';

interface PointsEditorProps {
  drivers: Driver[];
  montagneRaces: Race[];
  rallyeRaces: Race[];
  onRaceUpdate: (raceId: string, results: RaceResult[]) => Promise<void>;
}

const PointsEditor = ({ drivers, montagneRaces, rallyeRaces, onRaceUpdate }: PointsEditorProps) => {
  return (
    <div className="space-y-6">
      <PointsEditorHeader />
      <PointsEditorTabs
        drivers={drivers}
        montagneRaces={montagneRaces}
        rallyeRaces={rallyeRaces}
        onRaceUpdate={onRaceUpdate}
      />
    </div>
  );
};

export default PointsEditor;
