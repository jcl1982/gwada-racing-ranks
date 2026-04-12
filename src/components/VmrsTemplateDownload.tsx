
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const VmrsTemplateDownload = () => {
  const generateTemplate = () => {
    const workbook = XLSX.utils.book_new();

    const course1 = [
      ['Course de Côte de Bouillante', '2024-12-15'],
      ['Position', 'Nom', 'Rôle', 'Pts Participation', 'Pts Classement', 'Bonus', 'Abandon'],
      [1, 'Jean Dupont', 'Pilote', 2, 15, 5, ''],
      [2, 'Marie Martin', 'Pilote', 2, 12, 5, ''],
      [3, 'Pierre Durand', 'Copilote', 2, 10, 4, ''],
      [4, 'Sophie Moreau', 'Pilote', 2, 8, 4, ''],
      [5, 'Michel Leroy', 'Copilote', 2, 6, 3, ''],
      [6, 'Claude Petit', 'Pilote', 2, 0, 3, 'Oui'],
    ];

    const course2 = [
      ['Rallye de Basse-Terre', '2024-12-22'],
      ['Position', 'Nom', 'Rôle', 'Pts Participation', 'Pts Classement', 'Bonus', 'Abandon'],
      [1, 'Marie Martin', 'Pilote', 10, 15, 6, ''],
      [2, 'Jean Dupont', 'Pilote', 10, 12, 6, ''],
      [3, 'Pierre Durand', 'Copilote', 10, 10, 5, ''],
      [4, 'Sophie Moreau', 'Pilote', 10, 8, 5, ''],
      [5, 'Michel Leroy', 'Copilote', 10, 6, 4, ''],
    ];

    const sheet1 = XLSX.utils.aoa_to_sheet(course1);
    const sheet2 = XLSX.utils.aoa_to_sheet(course2);

    const cols = [
      { width: 12 }, { width: 25 }, { width: 12 },
      { width: 18 }, { width: 18 }, { width: 10 }, { width: 12 },
    ];
    sheet1['!cols'] = cols;
    sheet2['!cols'] = cols;

    XLSX.utils.book_append_sheet(workbook, sheet1, 'Course 1');
    XLSX.utils.book_append_sheet(workbook, sheet2, 'Course 2');
    XLSX.writeFile(workbook, 'modele_vmrs.xlsx');
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
      <h4 className="font-medium text-amber-800 dark:text-amber-100 mb-2">
        Modèle VMRS (Trophée de la Guadeloupe)
      </h4>
      <p className="text-sm text-amber-700 dark:text-amber-200 mb-3">
        Téléchargez ce modèle pour importer les points VMRS avec les 3 composantes : participation, classement et bonus.
      </p>
      <ul className="text-xs text-amber-600 dark:text-amber-300 mb-3 list-disc list-inside space-y-1">
        <li><strong>Pts Participation :</strong> Côte = 2 pts, Régional = 10 pts, National = 20 pts</li>
        <li><strong>Pts Classement :</strong> 15, 12, 10, 8, 6, 5, 4, 3, 2, 1</li>
        <li><strong>Bonus :</strong> 6 à 20 partants = 3 pts, 21-30 = 4 pts, 31-40 = 5 pts, 41+ = 6 pts</li>
        <li><strong>Abandon :</strong> "Oui" si abandon (seuls participation + bonus comptent)</li>
      </ul>
      <Button onClick={generateTemplate} variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
        <Download className="w-4 h-4 mr-2" />
        Télécharger le modèle VMRS
      </Button>
    </div>
  );
};

export default VmrsTemplateDownload;
