
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Driver } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import DriverForm from './DriverForm';

interface EditDriverDialogProps {
  editingDriver: Driver | null;
  onDriverUpdate: (driver: Driver) => Promise<void>;
  onDriversChange: (drivers: Driver[]) => void;
  drivers: Driver[];
  onClose: () => void;
}

const EditDriverDialog = ({ 
  editingDriver, 
  onDriverUpdate, 
  onDriversChange, 
  drivers, 
  onClose 
}: EditDriverDialogProps) => {
  const [formData, setFormData] = useState({ name: '', number: '', carModel: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingDriver) {
      setFormData({ 
        name: editingDriver.name, 
        number: editingDriver.number?.toString() || '',
        carModel: editingDriver.carModel || ''
      });
    }
  }, [editingDriver]);

  const handleSubmit = async () => {
    if (!editingDriver || !formData.name.trim() || !formData.number.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const updatedDriver = {
        ...editingDriver,
        name: formData.name.trim(),
        number: parseInt(formData.number),
        carModel: formData.carModel.trim() || undefined
      };
      
      console.log('Updating driver:', updatedDriver);
      await onDriverUpdate(updatedDriver);
      
      onClose();
      setFormData({ name: '', number: '', carModel: '' });
      
      // Trigger refresh of drivers list
      onDriversChange([...drivers]);
      
      toast({
        title: "Succès",
        description: "Pilote mis à jour avec succès.",
      });
    } catch (error) {
      console.error('Error updating driver:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le pilote.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', number: '', carModel: '' });
    onClose();
  };

  return (
    <Dialog open={!!editingDriver} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le pilote</DialogTitle>
        </DialogHeader>
        <DriverForm
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          submitText="Mettre à jour"
          title=""
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditDriverDialog;
