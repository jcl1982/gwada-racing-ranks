import * as XLSX from 'xlsx';
import { Driver, Race, RaceResult } from '@/types/championship';

export interface ExcelRaceData {
  raceName: string;
  raceDate: string;
  raceType: 'montagne' | 'rallye';
  results: Array<{
    driverName: string;
    position: number;
    points: number;
  }>;
}

export const parseExcelFile = (file: File): Promise<ExcelRaceData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const races: ExcelRaceData[] = [];
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (jsonData.length < 3) return; // Skip sheets with insufficient data
          
          // First row contains race info: [Race Name, Date, Type]
          const raceInfo = jsonData[0];
          const raceName = String(raceInfo[0] || sheetName);
          const raceDate = String(raceInfo[1] || new Date().toISOString().split('T')[0]);
          const raceType = (String(raceInfo[2]).toLowerCase() === 'rallye' ? 'rallye' : 'montagne') as 'montagne' | 'rallye';
          
          // Second row contains headers: [Pilote, Position, Points]
          // Log headers for debugging
          console.log('Headers found:', jsonData[1]);
          
          // Process results starting from row 3 (index 2)
          const results = jsonData.slice(2).map((row, index) => {
            // Log raw row data for debugging
            console.log('Processing row:', row);
            
            // Format should be: [Pilote, Position, Points]
            const driverName = String(row[0] || '').trim(); // Column 0 = Pilote
            const position = parseInt(String(row[1])) || index + 1; // Column 1 = Position
            const points = parseInt(String(row[2])) || 0; // Column 2 = Points
            
            console.log('Mapped data:', { driverName, position, points });
            
            return {
              driverName,
              position,
              points
            };
          }).filter(result => result.driverName && result.driverName !== '');
          
          console.log('Race results:', results);
          
          races.push({
            raceName,
            raceDate,
            raceType,
            results
          });
        });
        
        resolve(races);
      } catch (error) {
        console.error('Excel parsing error:', error);
        reject(new Error('Erreur lors de la lecture du fichier Excel'));
      }
    };
    
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    reader.readAsBinaryString(file);
  });
};

export const convertExcelDataToRaces = (
  excelData: ExcelRaceData[],
  existingDrivers: Driver[]
): { races: Race[], newDrivers: Driver[] } => {
  const races: Race[] = [];
  const newDrivers: Driver[] = [...existingDrivers];
  let nextDriverId = Math.max(...existingDrivers.map(d => parseInt(d.id)), 0) + 1;
  
  excelData.forEach((excelRace, raceIndex) => {
    const raceId = `imported_${Date.now()}_${raceIndex}`;
    const results: RaceResult[] = [];
    
    excelRace.results.forEach(result => {
      // Ensure driverName is a string and not empty
      const driverName = String(result.driverName || '').trim();
      if (!driverName) return;
      
      // Find or create driver
      let driver = newDrivers.find(d => 
        String(d.name).toLowerCase() === driverName.toLowerCase()
      );
      
      if (!driver) {
        driver = {
          id: nextDriverId.toString(),
          name: driverName,
          number: nextDriverId
        };
        newDrivers.push(driver);
        nextDriverId++;
      }
      
      results.push({
        driverId: driver.id,
        position: result.position,
        points: result.points
      });
    });
    
    races.push({
      id: raceId,
      name: excelRace.raceName,
      date: excelRace.raceDate,
      type: excelRace.raceType,
      results: results.sort((a, b) => a.position - b.position)
    });
  });
  
  return { races, newDrivers };
};
