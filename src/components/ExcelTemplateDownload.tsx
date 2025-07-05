
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const ExcelTemplateDownload = () => {
  const generateTemplate = () => {
    // Créer un nouveau classeur
    const workbook = XLSX.utils.book_new();
    
    // Données d'exemple pour Course 1
    const course1Data = [
      ['Course de Côte de Bouillante', '2024-12-15'], // Ligne 1: Nom de la course, Date
      ['Position', 'Pilote', 'Points'], // Ligne 2: En-têtes
      [1, 'Jean Dupont', 25],
      [2, 'Marie Martin', 18],
      [3, 'Pierre Durand', 15],
      [4, 'Sophie Moreau', 12],
      [5, 'Michel Leroy', 10],
      [6, 'Annie Bernard', 8],
      [7, 'Claude Petit', 6],
      [8, 'Sylvie Roux', 4],
      [9, 'Paul Blanc', 2],
      [10, 'Julie Noir', 1]
    ];
    
    // Données d'exemple pour Course 2
    const course2Data = [
      ['Rallye de Basse-Terre', '2024-12-22'], // Ligne 1: Nom de la course, Date
      ['Position', 'Pilote', 'Points'], // Ligne 2: En-têtes
      [1, 'Marie Martin', 25],
      [2, 'Pierre Durand', 18],
      [3, 'Jean Dupont', 15],
      [4, 'Michel Leroy', 12],
      [5, 'Sophie Moreau', 10],
      [6, 'Claude Petit', 8],
      [7, 'Annie Bernard', 6],
      [8, 'Paul Blanc', 4],
      [9, 'Sylvie Roux', 2],
      [10, 'Julie Noir', 1]
    ];
    
    // Créer les feuilles
    const sheet1 = XLSX.utils.aoa_to_sheet(course1Data);
    const sheet2 = XLSX.utils.aoa_to_sheet(course2Data);
    
    // Définir la largeur des colonnes
    sheet1['!cols'] = [
      { width: 25 }, // Colonne Position/Nom de course
      { width: 20 }, // Colonne Pilote/Date
      { width: 10 }  // Colonne Points
    ];
    
    sheet2['!cols'] = [
      { width: 25 }, // Colonne Position/Nom de course
      { width: 20 }, // Colonne Pilote/Date
      { width: 10 }  // Colonne Points
    ];
    
    // Ajouter les feuilles au classeur
    XLSX.utils.book_append_sheet(workbook, sheet1, 'Course 1');
    XLSX.utils.book_append_sheet(workbook, sheet2, 'Course 2');
    
    // Générer le fichier et le télécharger
    XLSX.writeFile(workbook, 'modele_import_courses.xlsx');
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h4 className="font-medium text-green-800 mb-2">
            Télécharger le modèle Excel
          </h4>
          <p className="text-sm text-green-700 mb-3">
            Téléchargez ce fichier modèle pour voir la structure exacte attendue. 
            Il contient deux courses d'exemple avec les bons formats.
          </p>
          <ul className="text-xs text-green-600 mb-3 list-disc list-inside space-y-1">
            <li>Chaque feuille = une course</li>
            <li>Ligne 1 : Nom de la course, Date (AAAA-MM-JJ)</li>
            <li>Ligne 2 : En-têtes (Position, Pilote, Points)</li>
            <li>Lignes suivantes : Résultats des pilotes</li>
          </ul>
        </div>
      </div>
      <Button
        onClick={generateTemplate}
        variant="outline"
        size="sm"
        className="border-green-300 text-green-700 hover:bg-green-100"
      >
        <Download className="w-4 h-4 mr-2" />
        Télécharger le modèle
      </Button>
    </div>
  );
};

export default ExcelTemplateDownload;
