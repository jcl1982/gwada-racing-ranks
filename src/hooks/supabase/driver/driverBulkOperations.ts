
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const createDriverBulkOperations = (toast: ReturnType<typeof useToast>['toast'], loadData: () => Promise<void>) => {
  const deleteAllDrivers = async () => {
    try {
      console.log('🗑️ Starting bulk deletion of all drivers...');
      
      // Appeler la fonction SQL mise à jour qui gère correctement la suppression
      const { error } = await supabase.rpc('delete_all_drivers');

      if (error) {
        console.error('❌ Error deleting all drivers:', error);
        throw error;
      }

      console.log('✅ All drivers deleted successfully');
      
      // Force reload of data to ensure UI updates
      console.log('🔄 Reloading data after bulk deletion...');
      await loadData();
      
      // Add a small delay to ensure data propagation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast({
        title: "Suppression réussie",
        description: "Tous les pilotes et leurs données associées ont été supprimés avec succès.",
      });
    } catch (error) {
      console.error('❌ Error in bulk deletion:', error);
      toast({
        title: "Erreur de suppression",
        description: error instanceof Error ? error.message : "Impossible de supprimer tous les pilotes.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return { deleteAllDrivers };
};
