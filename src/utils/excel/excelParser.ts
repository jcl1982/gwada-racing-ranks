
import * as XLSX from 'xlsx';

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

export const parseExcelFile = (file: File, selectedRaceType: 'montagne' | 'rallye'): Promise<ExcelRaceData[]> => {
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
          
          // First row contains race info: [Race Name, Date] - Type is now selected by user
          const raceInfo = jsonData[0];
          const raceName = String(raceInfo[0] || sheetName);
          const raceDate = String(raceInfo[1] || new Date().toISOString().split('T')[0]);
          // Use the selected race type instead of reading from file
          const raceType = selectedRaceType;
          
          // Second row contains headers: [Position, Pilote, Points]
          // Log headers for debugging
          console.log('Headers found:', jsonData[1]);
          
          // Process results starting from row 3 (index 2)
          const results = jsonData.slice(2).map((row, index) => {
            // Log raw row data for debugging
            console.log('Processing row:', row);
            
            // Format should be: [Position, Pilote, Points]
            const position = parseInt(String(row[0])) || index + 1; // Column 0 = Position
            const driverName = String(row[1] || '').trim(); // Column 1 = Pilote
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
