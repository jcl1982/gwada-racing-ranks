import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { History, RotateCcw, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StandingsSave {
  saved_at: string;
  save_name: string;
  standing_type: string;
  drivers_count: number;
}

type StandingType = 'general' | 'montagne' | 'rallye' | 'r2';

interface StandingsSavesManagementProps {
  championshipId?: string;
  standingType?: StandingType;
  onRestore: () => Promise<void>;
}

const StandingsSavesManagement = ({ 
  championshipId, 
  standingType,
  onRestore 
}: StandingsSavesManagementProps) => {
  const [saves, setSaves] = useState<StandingsSave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoreDialog, setRestoreDialog] = useState<{ open: boolean; save: StandingsSave | null }>({ open: false, save: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; save: StandingsSave | null }>({ open: false, save: null });
  const { toast } = useToast();

  const loadSaves = async () => {
    if (!championshipId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_standings_saves_by_type', {
        p_championship_id: championshipId,
        p_standing_type: standingType || null
      });

      if (error) throw error;

      setSaves(data || []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des sauvegardes:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les sauvegardes.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSaves();
  }, [championshipId, standingType]);

  const handleRestore = async (save: StandingsSave) => {
    try {
      const { error } = await supabase.rpc('restore_standings_by_type', {
        p_championship_id: championshipId,
        p_saved_at: save.saved_at,
        p_standing_type: save.standing_type
      });

      if (error) throw error;

      toast({
        title: 'Classements restaurés',
        description: `Le classement ${getTypeLabel(save.standing_type)} a été restauré à la date: ${new Date(save.saved_at).toLocaleString('fr-FR')}`,
      });

      await onRestore();
      await loadSaves();
      setRestoreDialog({ open: false, save: null });
    } catch (error) {
      console.error('❌ Erreur lors de la restauration:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de restaurer les classements.',
      });
    }
  };

  const handleDelete = async (save: StandingsSave) => {
    try {
      const { error } = await supabase.rpc('delete_standings_save_by_type', {
        p_championship_id: championshipId,
        p_saved_at: save.saved_at,
        p_standing_type: save.standing_type
      });

      if (error) throw error;

      toast({
        title: 'Sauvegarde supprimée',
        description: 'La sauvegarde a été supprimée avec succès.',
      });

      await loadSaves();
      setDeleteDialog({ open: false, save: null });
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer la sauvegarde.',
      });
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      general: 'Général',
      montagne: 'Montagne',
      rallye: 'Rallye',
      r2: 'R2'
    };
    return labels[type] || type;
  };

  return (
    <>
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historique des sauvegardes
            {standingType && ` - ${getTypeLabel(standingType)}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4 text-muted-foreground">Chargement...</p>
          ) : saves.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              Aucune sauvegarde disponible. Les sauvegardes sont créées automatiquement avant chaque import.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date de sauvegarde</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Pilotes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saves.map((save, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(save.saved_at).toLocaleString('fr-FR')}</TableCell>
                    <TableCell>{save.save_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeLabel(save.standing_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{save.drivers_count}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRestoreDialog({ open: true, save })}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restaurer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, save })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={restoreDialog.open} onOpenChange={(open) => setRestoreDialog({ open, save: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurer cette sauvegarde ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action va restaurer le classement <strong>{restoreDialog.save && getTypeLabel(restoreDialog.save.standing_type)}</strong> à l'état suivant:
              <br />
              <strong>{restoreDialog.save?.save_name}</strong>
              <br />
              ({new Date(restoreDialog.save?.saved_at || '').toLocaleString('fr-FR')})
              <br /><br />
              Les données actuelles de ce classement seront remplacées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => restoreDialog.save && handleRestore(restoreDialog.save)}>
              Restaurer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, save: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette sauvegarde ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la sauvegarde:
              <br />
              <strong>{deleteDialog.save?.save_name}</strong>
              <br />
              ({new Date(deleteDialog.save?.saved_at || '').toLocaleString('fr-FR')})
              <br /><br />
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteDialog.save && handleDelete(deleteDialog.save)} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StandingsSavesManagement;
