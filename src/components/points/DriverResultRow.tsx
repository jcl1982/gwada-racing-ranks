
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Driver, RaceResult } from '@/types/championship';

interface DriverResultRowProps {
  driver: Driver;
  result?: RaceResult;
  isEditing: boolean;
  onPointsChange: (driverId: string, newPoints: number) => void;
  onPositionChange: (driverId: string, newPosition: number) => void;
  onCarModelChange: (driverId: string, newCarModel: string) => void;
}

const DriverResultRow = ({
  driver,
  result,
  isEditing,
  onPointsChange,
  onPositionChange,
  onCarModelChange
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
      <TableCell className="text-center">
        {isEditing ? (
          <div className="flex flex-col gap-1">
            <Select
              value={result?.carModel || driver.carModel || ''}
              onValueChange={(value) => onCarModelChange(driver.id, value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Modèle de voiture" />
              </SelectTrigger>
              <SelectContent>
                {driver.carModel && (
                  <SelectItem value={driver.carModel}>
                    {driver.carModel} (Habituel)
                  </SelectItem>
                )}
                <SelectItem value="Citroën C2 R2">Citroën C2 R2</SelectItem>
                <SelectItem value="Peugeot 106">Peugeot 106</SelectItem>
                <SelectItem value="Renault Clio">Renault Clio</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            {result?.carModel && result.carModel !== driver.carModel && (
              <Badge variant="outline" className="text-xs w-fit">
                ⚠️ Modèle différent
              </Badge>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1 items-center">
            <span>{result?.carModel || driver.carModel || '-'}</span>
            {result?.carModel && result.carModel !== driver.carModel && (
              <Badge variant="outline" className="text-xs">
                ⚠️ Modèle différent
              </Badge>
            )}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

export default DriverResultRow;
