
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const ExcelTemplateDownload = () => {
  const generateRallyeMontagne = () => {
    // Créer un nouveau classeur
    const workbook = XLSX.utils.book_new();
    
    // Données d'exemple pour Course 1
    const course1Data = [
      ['Course de Côte de Bouillante', '2024-12-15'], // Ligne 1: Nom de la course, Date
      ['Position', 'Nom', 'Rôle', 'Marque et Modèle', 'Points'], // Ligne 2: En-têtes
      [1, 'Jean Dupont', 'Pilote', 'Subaru WRX', 25],
      [2, 'Marie Martin', 'Pilote', 'Mitsubishi Lancer Evo', 18],
      [3, 'Pierre Durand', 'Pilote', 'Peugeot 206 RC', 15],
      [4, 'Sophie Moreau', 'Copilote', 'Citroën C2 VTS', 12],
      [5, 'Michel Leroy', 'Pilote', 'Renault Clio RS', 10],
      [6, 'Annie Bernard', 'Copilote', 'Ford Fiesta ST', 8],
      [7, 'Claude Petit', 'Pilote', 'Honda Civic Type R', 6],
      [8, 'Sylvie Roux', 'Copilote', 'Volkswagen Golf GTI', 4],
      [9, 'Paul Blanc', 'Pilote', 'Toyota Yaris GR', 2],
      [10, 'Julie Noir', 'Copilote', 'Mini Cooper S', 1]
    ];
    
    // Données d'exemple pour Course 2
    const course2Data = [
      ['Rallye de Basse-Terre', '2024-12-22'], // Ligne 1: Nom de la course, Date
      ['Position', 'Nom', 'Rôle', 'Marque et Modèle', 'Points'], // Ligne 2: En-têtes
      [1, 'Marie Martin', 'Pilote', 'Mitsubishi Lancer Evo', 25],
      [2, 'Pierre Durand', 'Pilote', 'Peugeot 206 RC', 18],
      [3, 'Jean Dupont', 'Copilote', 'Subaru WRX', 15],
      [4, 'Michel Leroy', 'Pilote', 'Renault Clio RS', 12],
      [5, 'Sophie Moreau', 'Copilote', 'Citroën C2 VTS', 10],
      [6, 'Claude Petit', 'Pilote', 'Honda Civic Type R', 8],
      [7, 'Annie Bernard', 'Copilote', 'Ford Fiesta ST', 6],
      [8, 'Paul Blanc', 'Pilote', 'Toyota Yaris GR', 4],
      [9, 'Sylvie Roux', 'Copilote', 'Volkswagen Golf GTI', 2],
      [10, 'Julie Noir', 'Copilote', 'Mini Cooper S', 1]
    ];
    
    // Créer les feuilles
    const sheet1 = XLSX.utils.aoa_to_sheet(course1Data);
    const sheet2 = XLSX.utils.aoa_to_sheet(course2Data);
    
    // Définir la largeur des colonnes
    sheet1['!cols'] = [
      { width: 12 }, // Colonne Position
      { width: 25 }, // Colonne Nom
      { width: 15 }, // Colonne Rôle
      { width: 25 }, // Colonne Marque et Modèle
      { width: 10 }  // Colonne Points
    ];
    
    sheet2['!cols'] = [
      { width: 12 }, // Colonne Position
      { width: 25 }, // Colonne Nom
      { width: 15 }, // Colonne Rôle
      { width: 25 }, // Colonne Marque et Modèle
      { width: 10 }  // Colonne Points
    ];
    
    // Ajouter les feuilles au classeur
    XLSX.utils.book_append_sheet(workbook, sheet1, 'Course 1');
    XLSX.utils.book_append_sheet(workbook, sheet2, 'Course 2');
    
    // Générer le fichier et le télécharger
    XLSX.writeFile(workbook, 'modele_rallye_montagne.xlsx');
  };

  const generateKarting = () => {
    // Créer un nouveau classeur
    const workbook = XLSX.utils.book_new();
    
    // Données d'exemple pour Manche 1
    const manche1Data = [
      ['Manche 1 - MINI 60', '2024-12-15'], // Ligne 1: Nom de la course, Date
      ['Position', 'Pilote', 'Catégorie', 'Bonus', 'Points'], // Ligne 2: En-têtes
      [1, 'FERDINAND Mathieu', 'MINI 60', 0, 100],
      [2, 'DE MITRI Laurent', 'MINI 60', 0, 66],
      [3, 'BHIKI Wilfried', 'MINI 60', 5, 66],
      [4, 'BORGIA Steeve', 'MINI 60', 0, 54],
      [5, 'MERI Ruddy', 'MINI 60', 0, 39],
      [6, 'GUSTAVE DI DUFLO Antonio', 'MINI 60', 0, 32],
      [7, 'BUNET Steven', 'MINI 60', 0, 22],
      [8, 'RAMBOJAN Pascal', 'MINI 60', 0, 20]
    ];
    
    // Données d'exemple pour Manche 2
    const manche2Data = [
      ['Manche 2 - SENIOR MASTER GENTLEMAN', '2024-12-22'], // Ligne 1: Nom de la course, Date
      ['Position', 'Pilote', 'Catégorie', 'Bonus', 'Points'], // Ligne 2: En-têtes
      [1, 'MARTIN Paul', 'SENIOR', 0, 100],
      [2, 'DURAND Michel', 'MASTER', 0, 66],
      [3, 'BERNARD Sophie', 'SENIOR', 10, 66],
      [4, 'PETIT Claude', 'GENTLEMAN', 0, 54],
      [5, 'ROUX Sylvie', 'SENIOR', 0, 39],
      [6, 'BLANC Jean', 'MASTER', 0, 32],
      [7, 'NOIR Julie', 'GENTLEMAN', 0, 22],
      [8, 'LEROY Annie', 'SENIOR', 0, 20]
    ];
    
    // Données d'exemple pour Manche 3
    const manche3Data = [
      ['Manche 3 - KZ2', '2024-12-29'], // Ligne 1: Nom de la course, Date
      ['Position', 'Pilote', 'Catégorie', 'Bonus', 'Points'], // Ligne 2: En-têtes
      [1, 'DUPONT Alexandre', 'KZ2', 0, 100],
      [2, 'GARCIA Lucas', 'KZ2', 0, 66],
      [3, 'BERNARD Thomas', 'KZ2', 15, 66],
      [4, 'MOREAU Nicolas', 'KZ2', 0, 54],
      [5, 'SIMON Antoine', 'KZ2', 0, 39],
      [6, 'LAURENT Maxime', 'KZ2', 0, 32]
    ];
    
    // Créer les feuilles
    const sheet1 = XLSX.utils.aoa_to_sheet(manche1Data);
    const sheet2 = XLSX.utils.aoa_to_sheet(manche2Data);
    const sheet3 = XLSX.utils.aoa_to_sheet(manche3Data);
    
    // Définir la largeur des colonnes
    sheet1['!cols'] = [
      { width: 12 }, // Colonne Position
      { width: 30 }, // Colonne Pilote
      { width: 15 }, // Colonne Catégorie
      { width: 10 }, // Colonne Bonus
      { width: 10 }  // Colonne Points
    ];
    
    sheet2['!cols'] = [
      { width: 12 }, // Colonne Position
      { width: 30 }, // Colonne Pilote
      { width: 15 }, // Colonne Catégorie
      { width: 10 }, // Colonne Bonus
      { width: 10 }  // Colonne Points
    ];
    
    sheet3['!cols'] = [
      { width: 12 }, // Colonne Position
      { width: 30 }, // Colonne Pilote
      { width: 15 }, // Colonne Catégorie
      { width: 10 }, // Colonne Bonus
      { width: 10 }  // Colonne Points
    ];
    
    // Ajouter les feuilles au classeur
    XLSX.utils.book_append_sheet(workbook, sheet1, 'Manche 1');
    XLSX.utils.book_append_sheet(workbook, sheet2, 'Manche 2');
    XLSX.utils.book_append_sheet(workbook, sheet3, 'Manche 3');
    
    // Générer le fichier et le télécharger
    XLSX.writeFile(workbook, 'modele_karting.xlsx');
  };

  return (
    <div className="space-y-4">
      {/* Modèle Rallye/Montagne */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h4 className="font-medium text-blue-800 mb-2">
              Modèle Rallye / Montagne
            </h4>
            <p className="text-sm text-blue-700 mb-3">
              Téléchargez ce modèle pour les courses de rallye et de montagne.
            </p>
            <ul className="text-xs text-blue-600 mb-3 list-disc list-inside space-y-1">
              <li>Chaque feuille = une course</li>
              <li>Ligne 1 : Nom de la course, Date (AAAA-MM-JJ)</li>
              <li>Ligne 2 : En-têtes (Position, Nom, Rôle, Marque et Modèle, Points)</li>
              <li>Lignes suivantes : Résultats des pilotes et copilotes</li>
              <li><strong>Rôle :</strong> "Pilote" ou "Copilote" (si vide = Pilote par défaut)</li>
            </ul>
          </div>
        </div>
        <Button
          onClick={generateRallyeMontagne}
          variant="outline"
          size="sm"
          className="border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <Download className="w-4 h-4 mr-2" />
          Télécharger le modèle Rallye/Montagne
        </Button>
      </div>

      {/* Modèle Karting */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h4 className="font-medium text-green-800 mb-2">
              Modèle Karting
            </h4>
            <p className="text-sm text-green-700 mb-3">
              Téléchargez ce modèle pour les courses de karting.
            </p>
            <ul className="text-xs text-green-600 mb-3 list-disc list-inside space-y-1">
              <li>Chaque feuille = une manche</li>
              <li>Ligne 1 : Nom de la manche, Date (AAAA-MM-JJ)</li>
              <li>Ligne 2 : En-têtes (Position, Pilote, Catégorie, Bonus, Points)</li>
              <li>Lignes suivantes : Résultats des pilotes</li>
              <li><strong>Catégorie :</strong> MINI 60, SENIOR, MASTER, GENTLEMAN, KZ2, etc.</li>
              <li><strong>Bonus :</strong> Points bonus (0 si aucun)</li>
              <li><strong>Important :</strong> Sélectionnez la catégorie principale avant l'import</li>
            </ul>
          </div>
        </div>
        <Button
          onClick={generateKarting}
          variant="outline"
          size="sm"
          className="border-green-300 text-green-700 hover:bg-green-100"
        >
          <Download className="w-4 h-4 mr-2" />
          Télécharger le modèle Karting
        </Button>
      </div>
    </div>
  );
};

export default ExcelTemplateDownload;
