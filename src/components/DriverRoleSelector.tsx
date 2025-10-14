import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface DriverRoleSelectorProps {
  selectedRole: 'pilote' | 'copilote';
  onRoleChange: (role: 'pilote' | 'copilote') => void;
}

const DriverRoleSelector = ({ selectedRole, onRoleChange }: DriverRoleSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Rôle des participants</Label>
      <RadioGroup
        value={selectedRole}
        onValueChange={(value) => onRoleChange(value as 'pilote' | 'copilote')}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pilote" id="pilote" />
          <Label htmlFor="pilote" className="cursor-pointer">
            Pilote
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="copilote" id="copilote" />
          <Label htmlFor="copilote" className="cursor-pointer">
            Copilote
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default DriverRoleSelector;
