import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileSpreadsheet } from 'lucide-react';
import { Driver, Race } from '@/types/championship';
import { useExcelImport } from '@/hooks/useExcelImport';
import ExcelFileUpload from '@/components/ExcelFileUpload';
import ExcelPreview from '@/components/ExcelPreview';
import ExcelImportInstructions from '@/components/ExcelImportInstructions';
import RaceTypeSelector from '@/components/RaceTypeSelector';
import SaveStandingsPromptDialog from '@/components/SaveStandingsPromptDialog';

interface ExcelImportProps {
  drivers: Driver[];
  races?: Race[];
  onImport: (races: Race[], newDrivers: Driver[]) => void;
  championshipId?: string;
  onSaveStandings?: (saveName?: string) => Promise<void>;
}

const ExcelImport = ({ drivers, races, onImport, championshipId, onSaveStandings }: ExcelImportProps) => {
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [lastImportedRaceName, setLastImportedRaceName] = useState<string>();
  
  const {
    isLoading,
    error,
    previewData,
    success,
    selectedRaceType,
    setSelectedRaceType,
    handleFileUpload,
    handleImport,
    resetForm,
  } = useExcelImport(drivers, onImport, championshipId);

  const handleFileUploadWrapper = (file: File) => {
    // Reset file input after processing
    const fileInput = document.getElementById('excel-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    // Reset save prompt state
    setShowSavePrompt(false);
    handleFileUpload(file);
  };

  const handleImportWrapper = () => {
    // Capturer le nom de la course avant l'import
    const raceName = previewData?.[0]?.raceName;
    
    handleImport();
    
    // Reset file input after import
    const fileInput = document.getElementById('excel-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Afficher la demande de sauvegarde seulement si ce n'est pas la première course
    // et si la fonction est disponible
    if (onSaveStandings && races && races.length > 0) {
      setLastImportedRaceName(raceName);
      setShowSavePrompt(true);
    }
  };

  const handleResetForm = () => {
    resetForm();
    // Reset file input
    const fileInput = document.getElementById('excel-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6" />
              Import depuis Excel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RaceTypeSelector
              selectedType={selectedRaceType}
              onTypeChange={setSelectedRaceType}
            />
            <ExcelFileUpload
              onFileUpload={handleFileUploadWrapper}
              isLoading={isLoading}
              error={error}
              success={success}
            />
            <ExcelImportInstructions />
          </CardContent>
        </Card>

        {previewData && previewData.length > 0 && (
          <ExcelPreview
            previewData={previewData}
            onImport={handleImportWrapper}
            onCancel={handleResetForm}
          />
        )}
      </div>

      {onSaveStandings && (
        <SaveStandingsPromptDialog
          open={showSavePrompt}
          onOpenChange={setShowSavePrompt}
          onSave={onSaveStandings}
          raceName={lastImportedRaceName}
        />
      )}
    </>
  );
};

export default ExcelImport;
