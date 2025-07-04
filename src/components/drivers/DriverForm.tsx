
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DriverFormProps {
  formData: { name: string; number: string };
  onFormDataChange: (data: { name: string; number: string }) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  submitText: string;
  title: string;
}

const DriverForm = ({ 
  formData, 
  onFormDataChange, 
  onSubmit, 
  onCancel, 
  isLoading, 
  submitText, 
  title 
}: DriverFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div>
        <Label htmlFor="name">Nom du pilote</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
          placeholder="Nom complet"
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="number">Numéro</Label>
        <Input
          id="number"
          type="number"
          value={formData.number}
          onChange={(e) => onFormDataChange({ ...formData, number: e.target.value })}
          placeholder="Numéro du pilote"
          disabled={isLoading}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={onSubmit} className="flex-1" disabled={isLoading}>
          {isLoading ? `${submitText} en cours...` : submitText}
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1" disabled={isLoading}>
          Annuler
        </Button>
      </div>
    </div>
  );
};

export default DriverForm;
