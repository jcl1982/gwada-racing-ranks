
import ExcelTemplateDownload from './ExcelTemplateDownload';

const ExcelImportInstructions = () => {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <h4 className="font-medium mb-2">Format attendu du fichier Excel :</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Chaque feuille = une course</li>
          <li>Ligne 1 : Nom de la course, Date (AAAA-MM-JJ)</li>
          <li>Ligne 2 : En-têtes (Position, Nom, Rôle, Marque et Modèle, Points)</li>
          <li>Lignes suivantes : Résultats des participants (pilotes et copilotes)</li>
          <li><strong>Note :</strong> Le type de course (montagne/rallye) est sélectionné ci-dessus</li>
          <li><strong>Rôle (optionnel) :</strong> Ajoutez une colonne "Rôle" pour distinguer pilotes et copilotes</li>
        </ul>
      </div>
      
      <ExcelTemplateDownload />
    </div>
  );
};

export default ExcelImportInstructions;
