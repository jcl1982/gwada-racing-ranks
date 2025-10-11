
import { Race } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import { validateRaceData } from './raceValidation';
import { deleteExistingResults, saveRaceResults } from './raceResultsOperations';
import { createRaceInDatabase, updateRaceInDatabase, deleteRaceFromDatabase, findExistingRace } from './raceDatabaseOperations';

export const createRaceOperations = (toast: ReturnType<typeof useToast>['toast'], loadData: () => Promise<void>, championshipId?: string) => {
  const saveRace = async (race: Omit<Race, 'id' | 'results'> | Race) => {
    try {
      console.log('💾 Sauvegarde de la course:', race.name, { championshipId });
      
      // Validate race data
      validateRaceData(race);
      
      let raceId: string;
      
      // Si la course a un ID, c'est une mise à jour
      if ('id' in race && race.id) {
        console.log('🔄 Mise à jour de la course existante:', race.id);
        await updateRaceInDatabase(race, championshipId);
        raceId = race.id;
        
        // Supprimer les anciens résultats avant d'ajouter les nouveaux
        if ('results' in race && race.results.length > 0) {
          console.log('🗑️ Suppression des anciens résultats...');
          await deleteExistingResults(raceId);
        }
      } else {
        // Sinon, vérifier si une course avec le même nom et date existe déjà
        const existingRace = await findExistingRace(race.name, race.date);
        
        if (existingRace) {
          console.log('🔄 Course existante trouvée, mise à jour:', existingRace.id);
          raceId = existingRace.id;
          
          // Supprimer les anciens résultats avant d'ajouter les nouveaux
          if ('results' in race && race.results.length > 0) {
            console.log('🗑️ Suppression des anciens résultats...');
            await deleteExistingResults(raceId);
          }
        } else {
          console.log('🆕 Création d\'une nouvelle course:', race.name);
          raceId = await createRaceInDatabase({
            name: race.name,
            date: race.date,
            endDate: race.endDate,
            organizer: race.organizer,
            type: race.type,
            championshipId: championshipId || race.championshipId
          }, championshipId);
        }
      }

      // Insert race results if they exist
      if ('results' in race && race.results.length > 0) {
        console.log('📊 Ajout des résultats à la course...');
        await saveRaceResults(raceId, race.results);
      }

      console.log('✅ Course et résultats sauvegardés avec succès');
      
      // Toujours recharger les données après une sauvegarde réussie
      console.log('🔄 Appel de loadData() pour rafraîchir les données...');
      await loadData();
      console.log('✅ loadData() terminé, données rafraîchies');
      
      toast({
        title: 'id' in race && race.id ? "Course mise à jour" : "Course créée",
        description: 'id' in race && race.id ? "La course a été mise à jour avec succès." : "La course a été créée avec succès.",
      });
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la course:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error instanceof Error ? error.message : "Impossible de sauvegarder la course.",
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
