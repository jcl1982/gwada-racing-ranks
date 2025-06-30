
const ExcelImportInstructions = () => {
  return (
    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
      <h4 className="font-medium mb-2">Format attendu du fichier Excel :</h4>
      <ul className="list-disc list-inside space-y-1">
        <li>Chaque feuille = une course</li>
        <li>Ligne 1 : Nom de la course, Date (AAAA-MM-JJ)</li>
        <li>Ligne 2 : En-têtes (Position, Pilote, Points)</li>
        <li>Lignes suivantes : Résultats des pilotes</li>
        <li><strong>Note :</strong> Le type de course (montagne/rallye) est sélectionné ci-dessus</li>
      </ul>
    </div>
  );
};

export default ExcelImportInstructions;
