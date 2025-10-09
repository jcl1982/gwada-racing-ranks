
import * as XLSX from 'xlsx';
import { generateValidUUID } from './uuidUtils';

export interface ExcelRaceData {
  raceName: string;
  raceDate: string;
  raceType: 'montagne' | 'rallye';
  results: Array<{
    position: number;
    driverName: string;
    points: number;
    time?: string;
    dnf?: boolean;
  }>;
}

export const parseExcelFile = async (file: File, raceType: 'montagne' | 'rallye'): Promise<ExcelRaceData[]> => {
  console.log('📊 Début de l\'analyse du fichier Excel...');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        console.log('📋 Feuilles disponibles:', workbook.SheetNames);
        
        const races: ExcelRaceData[] = [];
        
        // Traiter chaque feuille comme une course potentielle
        workbook.SheetNames.forEach((sheetName, index) => {
          console.log(`📄 Traitement de la feuille: ${sheetName}`);
          
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (jsonData.length < 2) {
            console.log(`⚠️ Feuille ${sheetName} ignorée: pas assez de données`);
            return;
          }
          
          // Rechercher la ligne d'en-têtes
          let headerRowIndex = -1;
          let headers: string[] = [];
          
          for (let i = 0; i < Math.min(5, jsonData.length); i++) {
            const row = jsonData[i];
            if (row && Array.isArray(row)) {
              const rowStr = row.map(cell => String(cell || '').toLowerCase().trim());
              console.log(`🔍 Ligne ${i}:`, rowStr);
              
              // Rechercher les colonnes essentielles avec une approche plus flexible
              const hasPosition = rowStr.some(cell => 
                cell.includes('position') || 
                cell.includes('pos') || 
                cell.includes('classement') ||
                cell === 'p' ||
                cell === '#'
              );
              
              const hasPilote = rowStr.some(cell => 
                cell.includes('pilote') || 
                cell.includes('conducteur') || 
                cell.includes('driver') ||
                cell.includes('nom') ||
                cell.includes('name')
              );
              
              const hasPoints = rowStr.some(cell => 
                cell.includes('point') || 
                cell.includes('pts') ||
                cell.includes('score')
              );
              
              console.log(`🔍 Analyse ligne ${i}:`, { hasPosition, hasPilote, hasPoints });
              
              if (hasPosition && hasPilote) {
                headerRowIndex = i;
                headers = row.map(cell => String(cell || '').trim());
                console.log(`✅ En-têtes trouvés à la ligne ${i}:`, headers);
                break;
              }
            }
          }
          
          if (headerRowIndex === -1) {
            console.log(`❌ Impossible de trouver les en-têtes dans ${sheetName}`);
            return;
          }
          
          // Identifier les indices des colonnes importantes
          const columnIndices = findColumnIndices(headers);
          console.log('📊 Indices des colonnes:', columnIndices);
          
          if (columnIndices.position === -1 || columnIndices.pilote === -1) {
            console.log(`❌ Colonnes essentielles manquantes dans ${sheetName}`);
            console.log('Position trouvée:', columnIndices.position !== -1);
            console.log('Pilote trouvé:', columnIndices.pilote !== -1);
            return;
          }
          
          // Extraire les résultats
          const results: ExcelRaceData['results'] = [];
          
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || !Array.isArray(row)) continue;
            
            const position = parsePosition(row[columnIndices.position]);
            const pilote = parsePilote(row[columnIndices.pilote]);
            
            console.log(`🏁 Ligne ${i}:`, {
              raw: row,
              position,
              pilote,
              positionRaw: row[columnIndices.position],
              piloteRaw: row[columnIndices.pilote]
            });
            
            // Ignorer les lignes sans position ou pilote valides
            if (position === null || !pilote || pilote.trim() === '') {
              console.log(`⚠️ Ligne ${i} ignorée: position=${position}, pilote="${pilote}"`);
              continue;
            }
            
            const points = columnIndices.points !== -1 ? 
              parsePoints(row[columnIndices.points]) : 
              calculatePointsByPosition(position);
            
            const time = columnIndices.time !== -1 ? 
              parseTime(row[columnIndices.time]) : 
              undefined;
            
            const dnf = columnIndices.dnf !== -1 ? 
              parseDNF(row[columnIndices.dnf]) : 
              false;
            
            results.push({
              position,
              driverName: pilote.trim(),
              points,
              time,
              dnf
            });
          }
          
          if (results.length === 0) {
            console.log(`⚠️ Aucun résultat valide trouvé dans ${sheetName}`);
            return;
          }
          
          // Trier par position
          results.sort((a, b) => a.position - b.position);
          
          // Déterminer le nom et la date de la course
          const raceName = extractRaceName(sheetName, jsonData, headerRowIndex);
          const raceDate = extractRaceDate(jsonData, headerRowIndex);
          
          console.log(`✅ Course extraite: ${raceName} (${results.length} résultats)`);
          
          races.push({
            raceName,
            raceDate,
            raceType,
            results
          });
        });
        
        if (races.length === 0) {
          throw new Error('Aucune course valide trouvée dans le fichier Excel');
        }
        
        console.log(`🎉 Extraction terminée: ${races.length} course(s) trouvée(s)`);
        resolve(races);
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'analyse:', error);
        reject(new Error(`Erreur lors de la lecture du fichier Excel: ${error instanceof Error ? error.message : 'Erreur inconnue'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    reader.readAsBinaryString(file);
  });
};

const findColumnIndices = (headers: string[]) => {
  const indices = {
    position: -1,
    pilote: -1,
    points: -1,
    time: -1,
    dnf: -1
  };
  
  headers.forEach((header, index) => {
    const headerLower = header.toLowerCase().trim();
    
    // Position
    if (indices.position === -1 && (
      headerLower.includes('position') ||
      headerLower.includes('pos') ||
      headerLower.includes('classement') ||
      headerLower === 'p' ||
      headerLower === '#' ||
      headerLower === 'rang'
    )) {
      indices.position = index;
    }
    
    // Pilote - recherche plus exhaustive
    if (indices.pilote === -1 && (
      headerLower.includes('pilote') ||
      headerLower.includes('conducteur') ||
      headerLower.includes('driver') ||
      headerLower.includes('nom') ||
      headerLower.includes('name') ||
      headerLower.includes('participant') ||
      headerLower === 'pilote' ||
      headerLower === 'nom' ||
      headerLower === 'conducteur'
    )) {
      indices.pilote = index;
    }
    
    // Points
    if (indices.points === -1 && (
      headerLower.includes('point') ||
      headerLower.includes('pts') ||
      headerLower.includes('score')
    )) {
      indices.points = index;
    }
    
    // Temps
    if (indices.time === -1 && (
      headerLower.includes('temps') ||
      headerLower.includes('time') ||
      headerLower.includes('chrono')
    )) {
      indices.time = index;
    }
    
    // DNF
    if (indices.dnf === -1 && (
      headerLower.includes('dnf') ||
      headerLower.includes('abandon') ||
      headerLower.includes('statut')
    )) {
      indices.dnf = index;
    }
  });
  
  return indices;
};

const parsePosition = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  
  const str = String(value).trim();
  if (str === '') return null;
  
  // Extraire le nombre de la chaîne
  const match = str.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    return num > 0 ? num : null;
  }
  
  return null;
};

const parsePilote = (value: any): string => {
  if (value === null || value === undefined) return '';
  
  const str = String(value).trim();
  
  // Nettoyer le nom du pilote en préservant les caractères accentués
  return str
    .replace(/[^\p{L}\p{N}\s\-\.]/gu, ' ') // Préserver les lettres Unicode (avec accents), chiffres, espaces, tirets et points
    .replace(/\s+/g, ' ') // Normaliser les espaces multiples
    .trim();
};

const parsePoints = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  
  const num = parseFloat(String(value));
  return isNaN(num) ? 0 : Math.max(0, num);
};

const parseTime = (value: any): string | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  
  const str = String(value).trim();
  return str || undefined;
};

const parseDNF = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  
  const str = String(value).toLowerCase().trim();
  return str.includes('dnf') || str.includes('abandon') || str.includes('nc');
};

const calculatePointsByPosition = (position: number): number => {
  // Système de points par défaut basé sur la position
  const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  return position <= pointsSystem.length ? pointsSystem[position - 1] : 0;
};

const extractRaceName = (sheetName: string, data: any[][], headerRowIndex: number): string => {
  // Essayer de trouver le nom de la course dans les premières lignes
  for (let i = 0; i < Math.min(headerRowIndex, 3); i++) {
    const row = data[i];
    if (row && row[0] && String(row[0]).trim().length > 0) {
      const potential = String(row[0]).trim();
      if (potential.length > 3 && !potential.toLowerCase().includes('position')) {
        return potential;
      }
    }
  }
  
  // Utiliser le nom de la feuille par défaut
  return sheetName || 'Course sans nom';
};

const extractRaceDate = (data: any[][], headerRowIndex: number): string => {
  // Essayer de trouver une date dans les premières lignes
  for (let i = 0; i < Math.min(headerRowIndex + 1, 5); i++) {
    const row = data[i];
    if (row) {
      for (const cell of row) {
        if (cell instanceof Date) {
          return cell.toISOString().split('T')[0];
        }
        
        const str = String(cell || '').trim();
        // Rechercher des patterns de date
        const datePatterns = [
          /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
          /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
          /(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/i
        ];
        
        for (const pattern of datePatterns) {
          const match = str.match(pattern);
          if (match) {
            return formatDate(match);
          }
        }
      }
    }
  }
  
  // Date par défaut
  return new Date().toISOString().split('T')[0];
};

const formatDate = (match: RegExpMatchArray): string => {
  const [, part1, part2, part3] = match;
  
  // Essayer différents formats
  if (part3 && part3.length === 4) {
    // Format jour/mois/année ou mois/jour/année
    const year = part3;
    const month = part2.padStart(2, '0');
    const day = part1.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return new Date().toISOString().split('T')[0];
};
