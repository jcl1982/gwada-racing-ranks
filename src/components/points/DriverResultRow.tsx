
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { Driver, RaceResult } from '@/types/championship';

interface DriverResultRowProps {
  driver: Driver;
  result?: RaceResult;
  isEditing: boolean;
  onPointsChange: (driverId: string, newPoints: number) => void;
  onPositionChange: (driverId: string, newPosition: number) => void;
}

const DriverResultRow = ({
  driver,
  result,
  isEditing,
  onPointsChange,
  onPositionChange
}: DriverResultRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{driver.name}</TableCell>
      <TableCell className="text-center">
        {isEditing ? (
          <Input
            type="number"
            min="1"
            value={result?.position || ''}
            onChange={(e) => onPositionChange(driver.id, parseInt(e.target.value) || 0)}
            className="w-20 text-center"
          />
        ) : (
          result?.position || '-'
        )}
      </TableCell>
      <TableCell className="text-center">
        {isEditing ? (
          <Input
            type="number"
            min="0"
            value={result?.points || ''}
            onChange={(e) => onPointsChange(driver.id, parseInt(e.target.value) || 0)}
            className="w-20 text-center"
          />
        ) : (
          <Badge variant={result?.points ? "default" : "secondary"}>
            {result?.points || 0} pts
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
};

export default DriverResultRow;
