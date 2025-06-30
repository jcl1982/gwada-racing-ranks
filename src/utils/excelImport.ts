
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
          
          if (jsonData.length < 2) return; // Skip empty sheets
          
          // Assume first row contains race info: [Race Name, Date, Type]
          const raceInfo = jsonData[0];
          const raceName = raceInfo[0] || sheetName;
          const raceDate = raceInfo[1] || new Date().toISOString().split('T')[0];
          const raceType = (raceInfo[2] === 'rallye' ? 'rallye' : 'montagne') as 'montagne' | 'rallye';
          
          // Skip header rows and process results
          const results = jsonData.slice(2).map((row, index) => ({
            driverName: row[0] || `Pilote ${index + 1}`,
            position: parseInt(row[1]) || index + 1,
            points: parseInt(row[2]) || 0
          })).filter(result => result.driverName && result.driverName !== '');
          
          races.push({
            raceName,
            raceDate,
            raceType,
            results
          });
        });
        
        resolve(races);
      } catch (error) {
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
  let nextDriverId = Math.max(...existingDrivers.map(d => parseInt(d.id))) + 1;
  
  excelData.forEach((excelRace, raceIndex) => {
    const raceId = `imported_${Date.now()}_${raceIndex}`;
    const results: RaceResult[] = [];
    
    excelRace.results.forEach(result => {
      // Find or create driver
      let driver = newDrivers.find(d => 
        d.name.toLowerCase() === result.driverName.toLowerCase()
      );
      
      if (!driver) {
        driver = {
          id: nextDriverId.toString(),
          name: result.driverName,
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
