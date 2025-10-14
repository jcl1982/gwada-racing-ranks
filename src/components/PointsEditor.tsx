import { useState, useMemo } from 'react';
import { Driver, Race, RaceResult, DriverRole } from '@/types/championship';
import PointsEditorHeader from './points/PointsEditorHeader';
import PointsEditorTabs from './points/PointsEditorTabs';

interface PointsEditorProps {
  drivers: Driver[];
  races: Race[];
  onRaceUpdate: (raceId: string, results: RaceResult[]) => Promise<void>;
  driverLabel?: string;
}

const PointsEditor = ({ drivers, races, onRaceUpdate, driverLabel }: PointsEditorProps) => {
  const [selectedRole, setSelectedRole] = useState<DriverRole>('pilote');

  // Filtrer les drivers selon le rôle sélectionné
  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => driver.driverRole === selectedRole);
  }, [drivers, selectedRole]);

  console.log('🎯 [PointsEditor] Rôle sélectionné:', selectedRole, 'Drivers filtrés:', filteredDrivers.length);

  return (
    <div className="space-y-6">
      <PointsEditorHeader 
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
      />
      <PointsEditorTabs
        drivers={filteredDrivers}
        races={races}
        onRaceUpdate={onRaceUpdate}
        driverLabel={driverLabel}
      />
    </div>
  );
};

export default PointsEditor;
