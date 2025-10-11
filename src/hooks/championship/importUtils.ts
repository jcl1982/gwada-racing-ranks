
import { useToast } from '@/hooks/use-toast';

export const generateSuccessMessage = (
  successCount: number,
  errorCount: number,
  driversCreated: number
): { title: string; description: string; variant?: "destructive" } => {
  const totalDriversMessage = driversCreated > 0 ? ` et ${driversCreated} nouveau(x) pilote(s) créé(s)` : '';
  
  if (errorCount === 0) {
    return {
      title: "Import réussi",
      description: `${successCount} course(s) importée(s) avec succès${totalDriversMessage}. Les classements ont été mis à jour.`,
    };
  } else {
    return {
      title: "Import partiellement réussi", 
      description: `${successCount} course(s) importée(s) avec succès, ${errorCount} erreur(s)${totalDriversMessage}. Les classements ont été mis à jour.`,
      variant: "destructive"
    };
  }
};

export const generateErrorMessage = (error: unknown): { title: string; description: string; variant: "destructive" } => {
  return {
    title: "Erreur d'import",
    description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'import. Les classements ont été partiellement mis à jour.",
    variant: "destructive"
  };
};

export const performFinalRefresh = async (refreshData: () => Promise<void>) => {
  console.log('🔄 Rafraîchissement final des données...');
  await refreshData();
  // Double refresh pour garantir la synchronisation complète
  await new Promise(resolve => setTimeout(resolve, 300));
  await refreshData();
  console.log('✅ Rafraîchissement final terminé - données synchronisées');
};
