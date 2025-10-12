
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
  
  console.log('Converting Excel data to races...');
  console.log('Starting with', existingDrivers.length, 'existing drivers');
  console.log('Max driver number:', maxDriverNumber);
  console.log('Championship ID:', championshipId);
  
  excelData.forEach((excelRace, raceIndex) => {
    // Ne pas générer d'ID ici - laisser saveRace() créer la course dans la DB
    const results: RaceResult[] = [];
    
    // Formater la date correctement
    const formattedDate = formatDate(excelRace.raceDate);
    console.log(`Processing race ${raceIndex + 1}: ${excelRace.raceName} (date: ${formattedDate})`);
    
    excelRace.results.forEach((result, resultIndex) => {
      // Ensure driverName is a string and not empty
      const driverName = String(result.driverName || '').trim();
      if (!driverName) {
        console.log(`Skipping empty driver name in result ${resultIndex + 1}`);
        return;
      }
      
      // Find or create driver
      let driver = newDrivers.find(d => 
        String(d.name).toLowerCase() === driverName.toLowerCase()
      );
      
      if (!driver) {
        // Create new driver with valid UUID, number, and car model from Excel
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
        console.log(`Created new driver: ${driver.name} (ID: ${driver.id}, Number: ${driver.number}, Car: ${driver.carModel || 'N/A'}, Team: ${driver.team || 'N/A'}, Championship: ${championshipId})`);
      } else {
        // Update car model if provided in Excel and not already set
        if (result.carModel && !driver.carModel) {
          driver.carModel = result.carModel;
          console.log(`Updated car model for existing driver: ${driver.name} -> ${driver.carModel}`);
        }
        // Update team if karting category is provided and not already set
        if (excelRace.kartingCategory && !driver.team) {
          driver.team = excelRace.kartingCategory;
          console.log(`Updated team/category for existing driver: ${driver.name} -> ${driver.team}`);
        }
        console.log(`Found existing driver: ${driver.name} (ID: ${driver.id})`);
      }
      
      // Inclure le carModel du résultat Excel ou celui du pilote
      const raceResult: RaceResult = {
        driverId: driver.id,
        position: result.position,
        points: result.points,
        carModel: result.carModel || driver.carModel
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
      results: results.sort((a, b) => a.position - b.position)
    } as Race);
    
    console.log(`Prepared new race: ${excelRace.raceName} (date: ${formattedDate}) with ${results.length} results`);
  });
  
  console.log('Conversion completed:');
  console.log('- New races created:', races.length);
  console.log('- Total drivers:', newDrivers.length);
  console.log('- New drivers added:', newDrivers.length - existingDrivers.length);
  
  return { races, newDrivers };
};
