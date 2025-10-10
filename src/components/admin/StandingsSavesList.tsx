import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RotateCcw, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StandingsSave {
  saved_at: string;
  save_name: string;
  drivers_count: number;
}

interface StandingsSavesListProps {
  championshipId?: string;
  onRestore: () => Promise<void>;
}

const StandingsSavesList = ({ championshipId, onRestore }: StandingsSavesListProps) => {
  const [saves, setSaves] = useState<StandingsSave[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSaves = async () => {
    if (!championshipId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_standings_saves', {
        p_championship_id: championshipId
      });

      if (error) throw error;

      setSaves(data || []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des sauvegardes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les sauvegardes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaves();
  }, [championshipId]);

  const handleRestore = async (savedAt: string) => {
    if (!championshipId) return;

    const confirmRestore = window.confirm(
      '⚠️ Êtes-vous sûr de vouloir restaurer cette sauvegarde ?\n\n' +
      'Cette action va supprimer TOUS les résultats de course actuels et les remplacer par ceux de la sauvegarde.\n\n' +
      'Cette action est IRRÉVERSIBLE.'
    );

    if (!confirmRestore) return;

    try {
      const { error } = await supabase.rpc('restore_standings_by_timestamp', {
        p_championship_id: championshipId,
        p_saved_at: savedAt
      });

      if (error) throw error;

      toast({
        title: "Sauvegarde restaurée",
        description: "Le classement a été restauré avec succès.",
      });

      await onRestore();
    } catch (error: any) {
      console.error('❌ Erreur lors de la restauration:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de restaurer cette sauvegarde.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (savedAt: string) => {
    if (!championshipId) return;

    const confirmDelete = window.confirm(
      '⚠️ Êtes-vous sûr de vouloir supprimer cette sauvegarde ?\n\n' +
      'Cette action est IRRÉVERSIBLE.'
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase.rpc('delete_standings_save', {
        p_championship_id: championshipId,
        p_saved_at: savedAt
      });

      if (error) throw error;

      toast({
        title: "Sauvegarde supprimée",
        description: "La sauvegarde a été supprimée avec succès.",
      });

      await loadSaves();
    } catch (error: any) {
      console.error('❌ Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer cette sauvegarde.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Chargement des sauvegardes...</p>
        </CardContent>
      </Card>
    );
  }

  if (saves.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Historique des Sauvegardes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucune sauvegarde disponible. Sauvegardez d'abord le classement actuel pour créer un point de restauration.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock size={20} />
          Historique des Sauvegardes ({saves.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {saves.map((save) => (
          <div
            key={save.saved_at}
            className="flex items-center justify-between p-4 border rounded-lg bg-muted/50"
          >
            <div className="flex-1">
              <p className="font-medium">{save.save_name}</p>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {format(new Date(save.saved_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                </span>
                <Badge variant="secondary" className="text-xs">
                  <Users size={12} className="mr-1" />
                  {save.drivers_count} pilotes
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRestore(save.saved_at)}
                className="gap-2"
              >
                <RotateCcw size={16} />
                Restaurer
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(save.saved_at)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default StandingsSavesList;
