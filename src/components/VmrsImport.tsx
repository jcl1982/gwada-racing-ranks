
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useVmrsImport } from '@/hooks/useVmrsImport';
import ExcelFileUpload from '@/components/ExcelFileUpload';
import VmrsTemplateDownload from '@/components/VmrsTemplateDownload';

const VmrsImport = () => {
  const {
    isLoading, error, previewData, success,
    handleFileUpload, proceedWithImport, resetForm,
  } = useVmrsImport();

  const handleFileUploadWrapper = (files: File[]) => {
    const fileInput = document.getElementById('excel-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    handleFileUpload(files);
  };

  const handleReset = () => {
    resetForm();
    const fileInput = document.getElementById('excel-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-6">
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6" />
            Import VMRS depuis Excel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-medium mb-2 text-amber-900 dark:text-amber-100">Format du fichier VMRS :</h4>
            <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-200">
              <li>Chaque feuille = une course</li>
              <li>Ligne 1 : Nom de la course, Date (AAAA-MM-JJ)</li>
              <li><strong>En-têtes :</strong> Position, Nom, Rôle, Pts Participation, Pts Classement, Bonus, Abandon</li>
              <li>Les points de participation dépendent du niveau (Côte: 2, Régional: 10, National: 20)</li>
              <li>Points de classement : 15 à 1 selon la position</li>
              <li>Bonus partants : 3 à 6 pts</li>
              <li>En cas d'abandon, seuls participation + bonus comptent</li>
            </ul>
          </div>

          <ExcelFileUpload
            onFileUpload={handleFileUploadWrapper}
            isLoading={isLoading}
            error={error}
            success={success}
          />

          <VmrsTemplateDownload />
        </CardContent>
      </Card>

      {previewData && previewData.length > 0 && (
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-lg">Aperçu des données VMRS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewData.map((race, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{race.raceName} - {race.raceDate}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Pos</th>
                        <th className="text-left p-2">Nom</th>
                        <th className="text-left p-2">Rôle</th>
                        <th className="text-right p-2">Participation</th>
                        <th className="text-right p-2">Classement</th>
                        <th className="text-right p-2">Bonus</th>
                        <th className="text-right p-2">Total</th>
                        <th className="text-center p-2">DNF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {race.results.map((r, ri) => {
                        const total = r.dnf
                          ? r.participationPoints + r.bonusPoints
                          : r.participationPoints + r.classificationPoints + r.bonusPoints;
                        return (
                          <tr key={ri} className="border-b last:border-0">
                            <td className="p-2">{r.position}</td>
                            <td className="p-2">{r.driverName}</td>
                            <td className="p-2 capitalize">{r.driverRole}</td>
                            <td className="p-2 text-right">{r.participationPoints}</td>
                            <td className="p-2 text-right">{r.dnf ? '-' : r.classificationPoints}</td>
                            <td className="p-2 text-right">{r.bonusPoints}</td>
                            <td className="p-2 text-right font-semibold">{total}</td>
                            <td className="p-2 text-center">{r.dnf ? '⚠️' : ''}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleReset}>
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={proceedWithImport} disabled={isLoading}>
                <Upload className="w-4 h-4 mr-2" />
                {isLoading ? 'Import en cours...' : 'Importer les points VMRS'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VmrsImport;
