
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Driver } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import DriverForm from './DriverForm';

interface AddDriverDialogProps {
  onDriverAdd: (driver: Omit<Driver, 'id'>) => Promise<void>;
  onDriversChange: (drivers: Driver[]) => void;
  drivers: Driver[];
  isLoading: boolean;
  championshipId?: string;
}

const AddDriverDialog = ({ onDriverAdd, onDriversChange, drivers, isLoading, championshipId }: AddDriverDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', number: '', carModel: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.number.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const newDriver = {
        name: formData.name.trim(),
        number: parseInt(formData.number),
        carModel: formData.carModel.trim() || undefined,
        championshipId: championshipId
      };
      
      console.log('Adding driver:', newDriver);
      await onDriverAdd(newDriver);
      
      setFormData({ name: '', number: '', carModel: '' });
      setIsOpen(false);
      
      // Trigger refresh of drivers list
      onDriversChange([...drivers]);
      
      toast({
        title: "Succès",
        description: "Pilote ajouté avec succès.",
      });
    } catch (error) {
      console.error('Error adding driver:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le pilote.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', number: '', carModel: '' });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" disabled={isLoading}>
          <Plus size={16} />
          Ajouter un pilote
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau pilote</DialogTitle>
        </DialogHeader>
        <DriverForm
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          submitText="Ajouter"
          title=""
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddDriverDialog;
