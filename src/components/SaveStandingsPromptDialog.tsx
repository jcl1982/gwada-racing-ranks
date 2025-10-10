import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, AlertCircle } from 'lucide-react';

interface SaveStandingsPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (saveName?: string) => Promise<void>;
  raceName?: string;
}

const SaveStandingsPromptDialog = ({ 
  open, 
  onOpenChange, 
  onSave, 
  raceName 
}: SaveStandingsPromptDialogProps) => {
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const name = saveName.trim() || (raceName ? `Après ${raceName}` : undefined);
      await onSave(name);
      onOpenChange(false);
      setSaveName('');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    setSaveName('');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            Sauvegarder le classement ?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500 flex-shrink-0" />
              <p>
                Il est recommandé de créer une sauvegarde après chaque import de course. 
                Cela vous permettra de revenir à cet état en cas d'erreur.
              </p>
            </div>
            
            <div className="space-y-2 pt-2">
              <Label htmlFor="prompt-save-name" className="text-foreground">
                Nom de la sauvegarde <span className="text-muted-foreground">(optionnel)</span>
              </Label>
              <Input
                id="prompt-save-name"
                placeholder={raceName ? `Après ${raceName}` : "Ex: Après import du 15/01"}
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Si vide, un nom par défaut sera généré avec la date et l'heure.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleSkip} disabled={saving}>
            Plus tard
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleSave} disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder maintenant'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SaveStandingsPromptDialog;
