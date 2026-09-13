import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

interface DeleteStandingPointsButtonProps {
  /** Titre du classement concerné (affiché dans la confirmation) */
  standingTitle: string;
  /** Courses concernées par ce classement */
  raceIds: string[];
  /** Pilotes/copilotes concernés par ce classement (ignoré si source = vmrs) */
  driverIds?: string[];
  /** Table source des points */
  source?: 'classic' | 'vmrs';
  /** Championnat (requis pour la source VMRS) */
  championshipId?: string;
  /** Ciblage précis (course + pilote [+ catégorie]) — prioritaire sur raceIds/driverIds */
  pairs?: Array<{ raceId: string; driverId: string; category?: string }>;
  /** Rafraîchissement après suppression */
  onDeleted?: () => void | Promise<void>;
}

const CHUNK = 100;

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const DeleteStandingPointsButton = ({
  standingTitle,
  raceIds,
  driverIds,
  source = 'classic',
  championshipId,
  pairs,
  onDeleted,
}: DeleteStandingPointsButtonProps) => {
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isAdmin) return null;

  const usePairs = Array.isArray(pairs);
  const nothingToDelete = usePairs ? pairs!.length === 0 : raceIds.length === 0;

  const handleDelete = async () => {
    if (nothingToDelete) {
      toast({ title: 'Aucun point à supprimer', description: `Aucun résultat dans « ${standingTitle} ».` });
      setOpen(false);
      return;
    }

    setDeleting(true);
    try {
      if (usePairs) {
        for (const pair of pairs!) {
          let query = supabase
            .from('race_results')
            .delete()
            .eq('race_id', pair.raceId)
            .eq('driver_id', pair.driverId);
          if (pair.category) query = query.eq('category', pair.category);
          const { error } = await query;
          if (error) throw error;
        }
      } else
      for (const raceChunk of chunk(raceIds, CHUNK)) {
        if (source === 'vmrs') {
          let query = supabase.from('vmrs_results').delete().in('race_id', raceChunk);
          if (championshipId) query = query.eq('championship_id', championshipId);
          const { error } = await query;
          if (error) throw error;
        } else {
          if (driverIds && driverIds.length === 0) continue;
          if (driverIds) {
            for (const driverChunk of chunk(driverIds, CHUNK)) {
              const { error } = await supabase
                .from('race_results')
                .delete()
                .in('race_id', raceChunk)
                .in('driver_id', driverChunk);
              if (error) throw error;
            }
          } else {
            const { error } = await supabase.from('race_results').delete().in('race_id', raceChunk);
            if (error) throw error;
          }
        }
      }

      toast({
        title: 'Points supprimés',
        description: `Les points du classement « ${standingTitle} » ont été supprimés.`,
      });
      setOpen(false);
      await onDeleted?.();
    } catch (error: any) {
      console.error('Erreur suppression des points du classement:', error);
      toast({
        title: 'Suppression impossible',
        description: error?.message || 'Une erreur est survenue.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="no-print no-export gap-2">
          <Trash2 className="w-4 h-4" />
          Supprimer les points de ce classement
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer les points de « {standingTitle} » ?</AlertDialogTitle>
          <AlertDialogDescription>
            Tous les points enregistrés pour ce classement seront définitivement effacés
            {usePairs
              ? ` (${pairs!.length} résultat${pairs!.length > 1 ? 's' : ''} concerné${pairs!.length > 1 ? 's' : ''})`
              : ` (${raceIds.length} course${raceIds.length > 1 ? 's' : ''} concernée${raceIds.length > 1 ? 's' : ''})`}.
            Les pilotes et les courses sont conservés. Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteStandingPointsButton;
