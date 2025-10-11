import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SaveBeforeImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveAndImport: () => void;
  onImportWithoutSave: () => void;
}

const SaveBeforeImportDialog = ({ 
  open, 
  onOpenChange, 
  onSaveAndImport, 
  onImportWithoutSave 
}: SaveBeforeImportDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sauvegarder avant l'import ?</AlertDialogTitle>
          <AlertDialogDescription>
            Voulez-vous sauvegarder l'état actuel des classements avant d'importer cette nouvelle course ?
            Cela vous permettra de conserver l'évolution des positions des pilotes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onImportWithoutSave}>
            Non, importer sans sauvegarder
          </AlertDialogCancel>
          <AlertDialogAction onClick={onSaveAndImport}>
            Oui, sauvegarder puis importer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SaveBeforeImportDialog;
