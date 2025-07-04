
import { Driver, Race, RaceResult } from '@/types/championship';
import { generateValidUUID } from './uuidUtils';
import { ExcelRaceData } from './excelParser';

export const convertExcelDataToRaces = (
  excelData: ExcelRaceData[],
  existingDrivers: Driver[]
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
  
  excelData.forEach((excelRace, raceIndex) => {
    // Générer un nouvel UUID pour chaque course (création systématique)
    const raceId = generateValidUUID();
    const results: RaceResult[] = [];
    
    console.log(`Processing race ${raceIndex + 1}: ${excelRace.raceName} (creating new race with ID: ${raceId})`);
    
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
        // Create new driver with valid UUID and number
        driver = {
          id: generateValidUUID(),
          name: driverName,
          number: nextDriverNumber
        };
        newDrivers.push(driver);
        nextDriverNumber++;
        console.log(`Created new driver: ${driver.name} (ID: ${driver.id}, Number: ${driver.number})`);
      } else {
        console.log(`Found existing driver: ${driver.name} (ID: ${driver.id})`);
      }
      
      results.push({
        driverId: driver.id,
        position: result.position,
        points: result.points
      });
    });
    
    // Créer une nouvelle course avec un nouvel ID
    races.push({
      id: raceId,
      name: excelRace.raceName,
      date: excelRace.raceDate,
      type: excelRace.raceType,
      results: results.sort((a, b) => a.position - b.position)
    });
    
    console.log(`Created new race: ${excelRace.raceName} (ID: ${raceId}) with ${results.length} results`);
  });
  
  console.log('Conversion completed:');
  console.log('- New races created:', races.length);
  console.log('- Total drivers:', newDrivers.length);
  console.log('- New drivers added:', newDrivers.length - existingDrivers.length);
  
  return { races, newDrivers };
};
