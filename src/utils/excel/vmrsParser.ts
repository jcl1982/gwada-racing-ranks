
import * as XLSX from 'xlsx';

export interface VmrsExcelData {
  raceName: string;
  raceDate: string;
  results: Array<{
    position: number;
    driverName: string;
    driverRole: 'pilote' | 'copilote';
    participationPoints: number;
    classificationPoints: number;
    bonusPoints: number;
    dnf: boolean;
  }>;
}

export const parseVmrsExcelFile = async (file: File): Promise<VmrsExcelData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const races: VmrsExcelData[] = [];
        
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (jsonData.length < 2) return;
          
          // Find header row
          let headerRowIndex = -1;
          let headers: string[] = [];
          
          for (let i = 0; i < Math.min(5, jsonData.length); i++) {
            const row = jsonData[i];
            if (!row || !Array.isArray(row)) continue;
            const rowStr = row.map(cell => String(cell || '').toLowerCase().trim());
            
            const hasPosition = rowStr.some(cell => cell.includes('position') || cell.includes('pos') || cell === '#');
            const hasName = rowStr.some(cell => cell.includes('nom') || cell.includes('pilote') || cell.includes('name'));
            const hasParticipation = rowStr.some(cell => cell.includes('participation'));
            
            if (hasPosition && hasName && hasParticipation) {
              headerRowIndex = i;
              headers = row.map(cell => String(cell || '').trim());
              break;
            }
          }
          
          if (headerRowIndex === -1) {
            console.warn(`⚠️ [VMRS] En-têtes non trouvés dans ${sheetName}`);
            return;
          }
          
          const indices = findVmrsColumnIndices(headers);
          if (indices.position === -1 || indices.name === -1) return;
          
          const results: VmrsExcelData['results'] = [];
          
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || !Array.isArray(row)) continue;
            
            const posVal = row[indices.position];
            const position = posVal ? parseInt(String(posVal)) : null;
            const name = String(row[indices.name] || '').trim();
            
            if (!position || !name) continue;
            
            const roleStr = indices.role !== -1 ? String(row[indices.role] || '').toLowerCase().trim() : 'pilote';
            const driverRole: 'pilote' | 'copilote' = roleStr.includes('copilote') || roleStr.includes('co-pilote') || roleStr === 'c' ? 'copilote' : 'pilote';
            
            const participationPoints = indices.participation !== -1 ? parseNum(row[indices.participation]) : 0;
            const classificationPoints = indices.classification !== -1 ? parseNum(row[indices.classification]) : 0;
            const bonusPoints = indices.bonus !== -1 ? parseNum(row[indices.bonus]) : 0;
            const dnf = indices.dnf !== -1 ? parseDnfValue(row[indices.dnf]) : false;
            
            results.push({ position, driverName: name, driverRole, participationPoints, classificationPoints, bonusPoints, dnf });
          }
          
          if (results.length === 0) return;
          results.sort((a, b) => a.position - b.position);
          
          const raceName = extractName(sheetName, jsonData, headerRowIndex);
          const raceDate = extractDate(jsonData, headerRowIndex);
          
          races.push({ raceName, raceDate, results });
        });
        
        if (races.length === 0) throw new Error('Aucune course VMRS valide trouvée dans le fichier');
        resolve(races);
      } catch (error) {
        reject(new Error(`Erreur lors de la lecture du fichier VMRS: ${error instanceof Error ? error.message : 'Erreur inconnue'}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    reader.readAsBinaryString(file);
  });
};

const findVmrsColumnIndices = (headers: string[]) => {
  const indices = { position: -1, name: -1, role: -1, participation: -1, classification: -1, bonus: -1, dnf: -1 };
  
  headers.forEach((header, index) => {
    const h = header.toLowerCase().trim();
    if (indices.position === -1 && (h.includes('position') || h.includes('pos') || h === '#')) indices.position = index;
    if (indices.name === -1 && (h.includes('nom') || h.includes('pilote') || h.includes('name'))) indices.name = index;
    if (indices.role === -1 && (h.includes('rôle') || h.includes('role'))) indices.role = index;
    if (indices.participation === -1 && h.includes('participation')) indices.participation = index;
    if (indices.classification === -1 && (h.includes('classement') || h.includes('classification'))) indices.classification = index;
    if (indices.bonus === -1 && h.includes('bonus')) indices.bonus = index;
    if (indices.dnf === -1 && (h.includes('dnf') || h.includes('abandon'))) indices.dnf = index;
  });
  
  return indices;
};

const parseNum = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  const num = parseFloat(String(value));
  return isNaN(num) ? 0 : Math.max(0, num);
};

const parseDnfValue = (value: any): boolean => {
  if (!value) return false;
  const str = String(value).toLowerCase().trim();
  return str === 'oui' || str === 'yes' || str === 'true' || str === '1' || str.includes('abandon') || str.includes('dnf');
};

const extractName = (sheetName: string, data: any[][], headerRowIndex: number): string => {
  for (let i = 0; i < Math.min(headerRowIndex, 3); i++) {
    const row = data[i];
    if (row && row[0] && String(row[0]).trim().length > 3) {
      const potential = String(row[0]).trim();
      if (!potential.toLowerCase().includes('position')) return potential;
    }
  }
  return sheetName || 'Course VMRS';
};

const extractDate = (data: any[][], headerRowIndex: number): string => {
  for (let i = 0; i < Math.min(headerRowIndex + 1, 5); i++) {
    const row = data[i];
    if (!row) continue;
    for (const cell of row) {
      if (cell instanceof Date) return cell.toISOString().split('T')[0];
      const str = String(cell || '').trim();
      const match = str.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
      if (match) return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
      const match2 = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
      if (match2) return `${match2[3]}-${match2[2].padStart(2, '0')}-${match2[1].padStart(2, '0')}`;
    }
  }
  return new Date().toISOString().split('T')[0];
};
