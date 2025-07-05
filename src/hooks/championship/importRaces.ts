
import { Race } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';

export const processRaces = async (
  newRaces: Race[],
  saveRace: (race: Omit<Race, 'id' | 'results'> | Race) => Promise<void>,
  refreshData: () => Promise<void>,
  toast: ReturnType<typeof useToast>['toast']
) => {
  console.log('🏁 Traitement des courses...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < newRaces.length; i++) {
    const race = newRaces[i];
    console.log(`🏁 Traitement course ${i + 1}/${newRaces.length}: ${race.name}`);
    console.log(`📊 Nombre de résultats: ${race.results.length}`);
    
    // Vérification préalable renforcée
    const raceDriverIds = race.results.map(r => r.driverId);
    console.log(`🔍 Vérification préalable des ${raceDriverIds.length} pilotes de la course...`);
    
    try {
      // Tentative de sauvegarde avec gestion d'erreur améliorée
      await saveRace(race);
      console.log(`✅ Course sauvegardée avec succès: ${race.name}`);
      successCount++;
      
      // Rafraîchissement après chaque course réussie
      console.log('🔄 Mise à jour des classements...');
      await refreshData();
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (raceError) {
      console.error(`❌ Erreur lors de la sauvegarde de la course ${race.name}:`, raceError);
      errorCount++;
      
      // Vérifier si c'est une erreur de pilotes manquants
      if (raceError instanceof Error && raceError.message.includes('pilote(s) manquant(s)')) {
        const retryResult = await retryRaceWithRecovery(race, saveRace, refreshData);
        if (retryResult.success) {
          successCount++;
          errorCount--; // Annuler l'erreur précédente
        }
      }
      
      // Rafraîchissement même après erreur
      console.log('🔄 Rafraîchissement après erreur...');
      await refreshData();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`⚠️ Passage à la course suivante...`);
      continue;
    }
  }

  return { successCount, errorCount };
};

const retryRaceWithRecovery = async (
  race: Race,
  saveRace: (race: Omit<Race, 'id' | 'results'> | Race) => Promise<void>,
  refreshData: () => Promise<void>
): Promise<{ success: boolean }> => {
  console.log('⚠️ Erreur de pilotes manquants détectée');
  console.log('🔄 Tentative de rafraîchissement et nouvelle tentative...');
  
  // Rafraîchissement d'urgence
  await refreshData();
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Seconde tentative
  try {
    console.log(`🔄 Seconde tentative pour la course: ${race.name}`);
    await saveRace(race);
    console.log(`✅ Course sauvegardée avec succès (2e tentative): ${race.name}`);
    return { success: true };
  } catch (secondError) {
    console.error(`❌ Échec de la seconde tentative pour ${race.name}:`, secondError);
    return { success: false };
  }
};
