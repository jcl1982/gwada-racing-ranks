
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { parseExcelFile, convertExcelDataToRaces, ExcelRaceData } from '@/utils/excelImport';
import { Driver, Race } from '@/types/championship';

interface ExcelImportProps {
  drivers: Driver[];
  onImport: (races: Race[], newDrivers: Driver[]) => void;
}

const ExcelImport = ({ drivers, onImport }: ExcelImportProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ExcelRaceData[] | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setPreviewData(null);

    try {
      const excelData = await parseExcelFile(file);
      setPreviewData(excelData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la lecture du fichier');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (!previewData) return;

    const { races, newDrivers } = convertExcelDataToRaces(previewData, drivers);
    onImport(races, newDrivers);
    setSuccess(true);
    setPreviewData(null);
  };

  const resetForm = () => {
    setError(null);
    setSuccess(false);
    setPreviewData(null);
  };

  return (
    <div className="space-y-6">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6" />
            Import depuis Excel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="excel-file" className="text-sm font-medium">
              Sélectionner un fichier Excel (.xlsx, .xls)
            </label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </div>

          {isLoading && (
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                Traitement du fichier en cours...
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                Import réussi ! Les données ont été ajoutées aux classements.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2">Format attendu du fichier Excel :</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Chaque feuille = une course</li>
              <li>Ligne 1 : Nom de la course, Date (AAAA-MM-JJ), Type (montagne/rallye)</li>
              <li>Ligne 2 : En-têtes (Pilote, Position, Points, Temps, DNF)</li>
              <li>Lignes suivantes : Résultats des pilotes</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {previewData && previewData.length > 0 && (
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Aperçu des données ({previewData.length} course(s))</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {previewData.map((race, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-semibold text-lg">{race.raceName}</h3>
                <p className="text-sm text-gray-600">
                  Date: {race.raceDate} | Type: {race.raceType === 'montagne' ? 'Course de Côte' : 'Rallye'}
                </p>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Pilote</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Temps</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {race.results.slice(0, 5).map((result, resultIndex) => (
                      <TableRow key={resultIndex}>
                        <TableCell>{result.position}</TableCell>
                        <TableCell>{result.driverName}</TableCell>
                        <TableCell>{result.points}</TableCell>
                        <TableCell>{result.time || '-'}</TableCell>
                        <TableCell>{result.dnf ? 'DNF' : 'Terminé'}</TableCell>
                      </TableRow>
                    ))}
                    {race.results.length > 5 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          ... et {race.results.length - 5} autres résultats
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ))}
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleImport} className="gradient-caribbean text-white">
                Confirmer l'import
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExcelImport;
