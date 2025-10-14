
import { Trophy } from 'lucide-react';
import { DriverRole } from '@/types/championship';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PointsEditorHeaderProps {
  selectedRole: DriverRole;
  onRoleChange: (role: DriverRole) => void;
}

const PointsEditorHeader = ({ selectedRole, onRoleChange }: PointsEditorHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-600" />
        <h2 className="text-2xl font-bold">Édition des Points</h2>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Rôle:</span>
        <Select value={selectedRole} onValueChange={(value) => onRoleChange(value as DriverRole)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pilote">Pilotes</SelectItem>
            <SelectItem value="copilote">Copilotes</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PointsEditorHeader;
