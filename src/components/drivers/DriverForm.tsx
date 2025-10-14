
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DriverRole } from '@/types/championship';

interface DriverFormProps {
  formData: { name: string; number: string; carModel: string; driverRole?: DriverRole };
  onFormDataChange: (data: { name: string; number: string; carModel: string; driverRole?: DriverRole }) => void;
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
      <div>
        <Label htmlFor="carModel">Marque et Modèle du véhicule</Label>
        <Input
          id="carModel"
          value={formData.carModel}
          onChange={(e) => onFormDataChange({ ...formData, carModel: e.target.value })}
          placeholder="Ex: Peugeot 208 R2, Citroën C2 R2"
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="driverRole">Rôle</Label>
        <Select 
          value={formData.driverRole || 'pilote'} 
          onValueChange={(value: DriverRole) => onFormDataChange({ ...formData, driverRole: value })}
          disabled={isLoading}
        >
          <SelectTrigger id="driverRole">
            <SelectValue placeholder="Sélectionner le rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pilote">Pilote</SelectItem>
            <SelectItem value="copilote">Copilote</SelectItem>
          </SelectContent>
        </Select>
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
