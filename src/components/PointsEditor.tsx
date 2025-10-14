import { useState, useMemo } from 'react';
import { Driver, Race, RaceResult, DriverRole } from '@/types/championship';
import PointsEditorHeader from './points/PointsEditorHeader';
import PointsEditorTabs from './points/PointsEditorTabs';

interface PointsEditorProps {
  drivers: Driver[];
  races: Race[];
  onRaceUpdate: (raceId: string, results: RaceResult[]) => Promise<void>;
  driverLabel?: string;
  showRoleSelector?: boolean;
  defaultRole?: DriverRole;
}

const PointsEditor = ({ 
  drivers, 
  races, 
  onRaceUpdate, 
  driverLabel,
  showRoleSelector = true,
  defaultRole = 'pilote'
}: PointsEditorProps) => {
  const [selectedRole, setSelectedRole] = useState<DriverRole>(defaultRole);

  // Filtrer les drivers selon le rôle sélectionné
  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => driver.driverRole === selectedRole);
  }, [drivers, selectedRole]);

  console.log('🎯 [PointsEditor] Rôle sélectionné:', selectedRole, 'Drivers filtrés:', filteredDrivers.length);

  const currentDriverLabel = selectedRole === 'pilote' ? 'Pilote' : 'Copilote';

  return (
    <div className="space-y-6">
      {showRoleSelector && (
        <PointsEditorHeader 
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
        />
      )}
      <PointsEditorTabs
        drivers={filteredDrivers}
        races={races}
        onRaceUpdate={onRaceUpdate}
        driverLabel={currentDriverLabel}
        selectedRole={selectedRole}
      />
    </div>
  );
};

export default PointsEditor;
