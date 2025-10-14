
import ExcelTemplateDownload from './ExcelTemplateDownload';

const ExcelImportInstructions = () => {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
        <h4 className="font-medium mb-2">Format attendu du fichier Excel :</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Chaque feuille = une course</li>
          <li>Ligne 1 : Nom de la course, Date (AAAA-MM-JJ)</li>
          <li>Ligne 2 : En-têtes (Position, Pilote, Rôle, Marque et Modèle, Points)</li>
          <li>Lignes suivantes : Résultats des participants (pilotes et copilotes)</li>
          <li><strong>Note :</strong> Le type de course (montagne/rallye) est sélectionné ci-dessus</li>
        </ul>
      </div>
      
      <div className="bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-4">
        <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <span>IMPORTANT : Colonne "Rôle" pour les copilotes</span>
        </h4>
        <p className="text-sm text-orange-800 dark:text-orange-200 mb-2">
          Pour que les copilotes soient correctement identifiés et apparaissent dans le classement Trophée Copilote, 
          votre fichier Excel <strong>DOIT absolument</strong> contenir une colonne nommée <strong>"Rôle"</strong> 
          avec les valeurs suivantes :
        </p>
        <ul className="list-disc list-inside text-sm text-orange-800 dark:text-orange-200 ml-4 space-y-1">
          <li><strong>"pilote"</strong> pour les pilotes</li>
          <li><strong>"copilote"</strong> pour les copilotes</li>
        </ul>
        <p className="text-sm text-orange-900 dark:text-orange-100 font-semibold mt-3">
          ⚠️ Sans cette colonne, TOUS les conducteurs seront créés comme pilotes dans le championnat Rallye-Montagne !
        </p>
      </div>
      
      <ExcelTemplateDownload />
    </div>
  );
};

export default ExcelImportInstructions;
