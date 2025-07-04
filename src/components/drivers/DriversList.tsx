
import { Card } from '@/components/ui/card';
import { Driver } from '@/types/championship';
import DriverCard from './DriverCard';

interface DriversListProps {
  drivers: Driver[];
  onEdit: (driver: Driver) => void;
  onDelete: (driverId: string) => void;
  isLoading: boolean;
}

const DriversList = ({ drivers, onEdit, onDelete, isLoading }: DriversListProps) => {
  if (drivers.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">Aucun pilote disponible</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {drivers.map((driver) => (
        <DriverCard
          key={driver.id}
          driver={driver}
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default DriversList;
