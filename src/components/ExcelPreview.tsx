
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExcelRaceData } from '@/utils/excelImport';

interface ExcelPreviewProps {
  previewData: ExcelRaceData[];
  onImport: () => void;
  onCancel: () => void;
}

const ExcelPreview = ({ previewData, onImport, onCancel }: ExcelPreviewProps) => {
  return (
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {race.results.slice(0, 5).map((result, resultIndex) => (
                  <TableRow key={resultIndex}>
                    <TableCell>{result.position}</TableCell>
                    <TableCell>{result.driverName}</TableCell>
                    <TableCell>{result.points}</TableCell>
                  </TableRow>
                ))}
                {race.results.length > 5 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      ... et {race.results.length - 5} autres résultats
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ))}
        
        <div className="flex gap-2 pt-4">
          <Button onClick={onImport} className="gradient-caribbean text-white">
            Confirmer l'import
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExcelPreview;
