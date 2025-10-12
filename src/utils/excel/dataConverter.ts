
import { Driver, Race, RaceResult } from '@/types/championship';
import { generateValidUUID } from './uuidUtils';
import { ExcelRaceData } from './excelParser';

const formatDate = (dateValue: any): string => {
  // Si la date est déjà une chaîne valide au format YYYY-MM-DD
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue.trim())) {
    return dateValue.trim();
  }
  
  // Si c'est un objet Date
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    return dateValue.toISOString().split('T')[0];
  }
  
  // Si c'est une chaîne qui peut être convertie en date
  if (typeof dateValue === 'string' && dateValue.trim()) {
    const parsedDate = new Date(dateValue.trim());
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
  }
  
  // Si c'est un nombre (timestamp Excel)
  if (typeof dateValue === 'number' && dateValue > 0) {
    // Excel utilise 1900-01-01 comme date de base (avec un bug pour 1900 qui n'est pas bissextile)
    const excelEpoch = new Date(1900, 0, 1);
    const daysOffset = dateValue - 2; // -1 pour base 0, -1 pour le bug Excel 1900
    const resultDate = new Date(excelEpoch.getTime() + (daysOffset * 24 * 60 * 60 * 1000));
    
    if (!isNaN(resultDate.getTime())) {
      return resultDate.toISOString().split('T')[0];
    }
  }
  
  // Par défaut, utiliser la date d'aujourd'hui
  console.warn('Date invalide détectée, utilisation de la date d\'aujourd\'hui:', dateValue);
  return new Date().toISOString().split('T')[0];
};

export const convertExcelDataToRaces = (
  excelData: ExcelRaceData[],
  existingDrivers: Driver[],
  championshipId?: string
): { races: Race[], newDrivers: Driver[] } => {
  const races: Race[] = [];
  const newDrivers: Driver[] = [...existingDrivers];
  
  // Find the highest existing driver number to avoid conflicts
  const maxDriverNumber = Math.max(
    ...existingDrivers.map(d => d.number || 0),
    0
  );
  let nextDriverNumber = maxDriverNumber + 1;
  
  console.log('📊 [CONVERTER] ===== DÉBUT DE CONVERSION =====');
  console.log('📊 [CONVERTER] Pilotes existants reçus:', existingDrivers.length);
  console.log('📊 [CONVERTER] Liste des pilotes existants:');
  existingDrivers.forEach((d, i) => {
    console.log(`  ${i + 1}. "${d.name}" (ID: ${d.id.substring(0, 8)}..., championshipId: ${d.championshipId?.substring(0, 8)}...)`);
  });
  console.log('📊 [CONVERTER] Courses à convertir:', excelData.length);
  console.log('📊 [CONVERTER] Championship ID cible:', championshipId?.substring(0, 8) + '...');
  console.log('📊 [CONVERTER] Numéro de pilote suivant:', nextDriverNumber);
  console.log('📊 [CONVERTER] ==============================');
  
  excelData.forEach((excelRace, raceIndex) => {
    // Ne pas générer d'ID ici - laisser saveRace() créer la course dans la DB
    const results: RaceResult[] = [];
    
    // Formater la date correctement
    const formattedDate = formatDate(excelRace.raceDate);
    console.log(`📅 [CONVERTER] Course ${raceIndex + 1}: "${excelRace.raceName}" (${formattedDate}) - Type: ${excelRace.raceType} - ChampionshipId: ${championshipId}`);
    
    excelRace.results.forEach((result, resultIndex) => {
      // Ensure driverName is a string and not empty
      const driverName = String(result.driverName || '').trim();
      if (!driverName) {
        console.log(`⚠️ [CONVERTER] Nom de pilote vide ignoré (résultat ${resultIndex + 1})`);
        return;
      }
      
      // Normaliser le nom pour la comparaison (insensible à la casse et espaces)
      const normalizedName = driverName.toLowerCase().trim();
      
      // Chercher le pilote dans newDrivers (qui contient déjà tous les existingDrivers)
      let driver = newDrivers.find(d => 
        d.name.toLowerCase().trim() === normalizedName
      );
      
      if (!driver) {
        // Créer un nouveau pilote uniquement s'il n'existe vraiment pas
        driver = {
          id: generateValidUUID(),
          name: driverName,
          number: nextDriverNumber,
          carModel: result.carModel || undefined,
          team: excelRace.kartingCategory || undefined,
          championshipId
        };
        newDrivers.push(driver);
        nextDriverNumber++;
        console.log(`➕ [CONVERTER] Nouveau pilote créé: "${driver.name}" (ID: ${driver.id.substring(0, 8)}..., Numéro: ${driver.number})`);
      } else {
        console.log(`✅ [CONVERTER] Pilote existant réutilisé: "${driver.name}" (ID: ${driver.id.substring(0, 8)}...)`);
        
        // Mettre à jour les informations optionnelles si nécessaire
        if (result.carModel && !driver.carModel) {
          driver.carModel = result.carModel;
          console.log(`  🔧 Modèle de voiture ajouté: ${driver.carModel}`);
        }
        if (excelRace.kartingCategory && !driver.team) {
          driver.team = excelRace.kartingCategory;
          console.log(`  🔧 Catégorie ajoutée: ${driver.team}`);
        }
      }
      
      // Inclure le carModel du résultat Excel ou celui du pilote
      const raceResult: RaceResult = {
        driverId: driver.id,
        position: result.position,
        points: result.points,
        carModel: result.carModel || driver.carModel,
        category: result.category,
        bonus: result.bonus || 0
      };
      
      // Log pour vérification C2R2
      if (result.carModel?.toLowerCase().includes('c2') && result.carModel?.toLowerCase().includes('r2')) {
        console.log(`✅ C2 R2 détecté pour ${driver.name}: ${result.carModel}`);
      } else if (result.carModel) {
        console.log(`ℹ️ Véhicule pour ${driver.name}: ${result.carModel} (non C2 R2)`);
      }
      
      results.push(raceResult);
    });
    
    // Créer une nouvelle course sans ID - il sera généré lors de l'insertion dans la DB
    races.push({
      name: excelRace.raceName,
      date: formattedDate,
      type: excelRace.raceType,
      championshipId,
      results: results.sort((a, b) => a.position - b.position)
    } as Race);
    
    console.log(`✅ [CONVERTER] Course préparée: "${excelRace.raceName}" avec ${results.length} résultats - ChampionshipId: ${championshipId}`);
  });
  
  console.log('📊 [CONVERTER] ===== FIN DE CONVERSION =====');
  console.log('📊 [CONVERTER] Courses créées:', races.length);
  console.log('📊 [CONVERTER] Total pilotes dans newDrivers:', newDrivers.length);
  console.log('📊 [CONVERTER] Nouveaux pilotes créés:', newDrivers.length - existingDrivers.length);
  console.log('📊 [CONVERTER] Liste finale des pilotes:');
  newDrivers.forEach((d, i) => {
    const isNew = !existingDrivers.find(ed => ed.id === d.id);
    console.log(`  ${i + 1}. "${d.name}" ${isNew ? '🆕 NOUVEAU' : '✅ EXISTANT'} (ID: ${d.id.substring(0, 8)}...)`);
  });
  console.log('📊 [CONVERTER] ============================');
  
  return { races, newDrivers };
};
