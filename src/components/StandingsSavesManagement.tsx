import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { History, RotateCcw, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StandingsSave {
  saved_at: string;
  save_name: string;
  drivers_count: number;
}

interface StandingsSavesManagementProps {
  championshipId?: string;
  onRestore: () => Promise<void>;
}

const StandingsSavesManagement = ({ championshipId, onRestore }: StandingsSavesManagementProps) => {
  const [saves, setSaves] = useState<StandingsSave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoreDialog, setRestoreDialog] = useState<{ open: boolean; save: StandingsSave | null }>({ open: false, save: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; save: StandingsSave | null }>({ open: false, save: null });
  const { toast } = useToast();

  const loadSaves = async () => {
    if (!championshipId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_standings_saves', {
        p_championship_id: championshipId
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
  }, [championshipId]);

  const handleRestore = async (save: StandingsSave) => {
    try {
      const { error } = await supabase.rpc('restore_standings_by_timestamp', {
        p_championship_id: championshipId,
        p_saved_at: save.saved_at
      });

      if (error) throw error;

      toast({
        title: 'Classements restaurés',
        description: `Les classements ont été restaurés à la date: ${new Date(save.saved_at).toLocaleString('fr-FR')}`,
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
      const { error } = await supabase.rpc('delete_standings_save', {
        p_championship_id: championshipId,
        p_saved_at: save.saved_at
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

  return (
    <>
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historique des sauvegardes
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
                  <TableHead className="text-center">Pilotes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saves.map((save, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(save.saved_at).toLocaleString('fr-FR')}</TableCell>
                    <TableCell>{save.save_name}</TableCell>
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
              Cette action va restaurer les classements et les résultats de courses à l'état suivant:
              <br />
              <strong>{restoreDialog.save?.save_name}</strong>
              <br />
              ({new Date(restoreDialog.save?.saved_at || '').toLocaleString('fr-FR')})
              <br /><br />
              Les données actuelles seront remplacées par cette sauvegarde.
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
