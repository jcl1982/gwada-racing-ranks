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
  onImport: (races: Race[], newDrivers: Driver[]) => Promise<void>;
  championshipId?: string;
  onSaveStandings?: (saveName?: string) => Promise<void>;
}

const ExcelImport = ({ drivers, races, onImport, championshipId, onSaveStandings }: ExcelImportProps) => {
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [lastImportedRaceName, setLastImportedRaceName] = useState<string>();
  const [isImporting, setIsImporting] = useState(false);
  
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

  const handleImportWrapper = async () => {
    // Capturer le nom de la course avant l'import
    const raceName = previewData?.[0]?.raceName;
    setLastImportedRaceName(raceName);
    
    console.log('🔄 Début import Excel...');
    setIsImporting(true);
    try {
      await handleImport();
      console.log('✅ Import Excel réussi - attente de synchronisation complète');
      
      // Attendre un délai pour s'assurer que tous les refresh sont terminés
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Synchronisation terminée');
      
      // Afficher le dialog de sauvegarde
      if (onSaveStandings) {
        console.log('📝 Affichage du dialog de sauvegarde');
        setShowSavePrompt(true);
        console.log('📝 showSavePrompt mis à true');
      } else {
        console.warn('⚠️ onSaveStandings n\'est pas défini');
      }
    } catch (error) {
      console.error('❌ Erreur import Excel:', error);
    } finally {
      setIsImporting(false);
      // Reset file input after import
      const fileInput = document.getElementById('excel-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
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
