
import { Race } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import { validateRaceData } from './raceValidation';
import { deleteExistingResults, saveRaceResults } from './raceResultsOperations';
import { createRaceInDatabase, updateRaceInDatabase, deleteRaceFromDatabase } from './raceDatabaseOperations';

export const createRaceOperations = (toast: ReturnType<typeof useToast>['toast'], loadData: () => Promise<void>) => {
  const saveRace = async (race: Omit<Race, 'id' | 'results'> | Race) => {
    try {
      console.log('💾 Sauvegarde de la course:', race.name);
      
      // Validate race data
      validateRaceData(race);
      
      let raceId: string;
      
      // Toujours créer une nouvelle course (pas de mise à jour)
      console.log('🆕 Création d\'une nouvelle course:', race.name);
      raceId = await createRaceInDatabase({
        name: race.name,
        date: race.date,
        type: race.type
      });

      // Insert race results if they exist
      if ('results' in race && race.results.length > 0) {
        console.log('📊 Ajout des résultats à la course...');
        await saveRaceResults(raceId, race.results);
      }

      console.log('✅ Course et résultats sauvegardés avec succès');
      
      // Toujours recharger les données après une sauvegarde réussie
      await loadData();
      
      toast({
        title: "Course créée",
        description: "La course a été créée avec succès.",
      });
    } catch (error) {
      console.error('❌ Erreur lors de la création de la course:', error);
      toast({
        title: "Erreur de création",
        description: error instanceof Error ? error.message : "Impossible de créer la course.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteRace = async (raceId: string) => {
    try {
      console.log('🗑️ Suppression de la course avec ID:', raceId);

      await deleteRaceFromDatabase(raceId);

      await loadData();
      toast({
        title: "Course supprimée",
        description: "La course a été supprimée avec succès.",
      });
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la course:', error);
      toast({
        title: "Erreur de suppression",
        description: error instanceof Error ? error.message : "Impossible de supprimer la course.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return { saveRace, deleteRace };
};
