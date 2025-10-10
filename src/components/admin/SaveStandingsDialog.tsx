import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface SaveStandingsDialogProps {
  onSave: (saveName?: string) => Promise<void>;
}

const SaveStandingsDialog = ({ onSave }: SaveStandingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(saveName || undefined);
      setOpen(false);
      setSaveName('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Créer une Sauvegarde
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sauvegarder le Classement Actuel</DialogTitle>
          <DialogDescription>
            Créez un point de restauration du classement actuel. Vous pourrez revenir à cet état à tout moment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="save-name">
              Nom de la sauvegarde <span className="text-muted-foreground">(optionnel)</span>
            </Label>
            <Input
              id="save-name"
              placeholder="Ex: Avant la course de Capesterre"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Si vous ne renseignez pas de nom, la date et l'heure seront utilisées automatiquement.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveStandingsDialog;
