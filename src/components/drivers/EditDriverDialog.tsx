
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Driver, DriverRole } from '@/types/championship';
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
  const [formData, setFormData] = useState({ name: '', number: '', carModel: '', driverRole: 'pilote' as DriverRole });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingDriver) {
      setFormData({ 
        name: editingDriver.name, 
        number: editingDriver.number?.toString() || '',
        carModel: editingDriver.carModel || '',
        driverRole: editingDriver.driverRole || 'pilote'
      });
    }
  }, [editingDriver]);

  const handleFormDataChange = (data: { name: string; number: string; carModel: string; driverRole?: DriverRole }) => {
    setFormData({
      name: data.name,
      number: data.number,
      carModel: data.carModel,
      driverRole: data.driverRole || 'pilote'
    });
  };

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
        carModel: formData.carModel.trim() || undefined,
        driverRole: formData.driverRole || 'pilote'
      };
      
      console.log('Updating driver:', updatedDriver);
      await onDriverUpdate(updatedDriver);
      
      onClose();
      setFormData({ name: '', number: '', carModel: '', driverRole: 'pilote' });
      
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
    setFormData({ name: '', number: '', carModel: '', driverRole: 'pilote' });
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
          onFormDataChange={handleFormDataChange}
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
