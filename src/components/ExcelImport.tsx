
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileSpreadsheet } from 'lucide-react';
import { Driver, Race } from '@/types/championship';
import { useExcelImport } from '@/hooks/useExcelImport';
import ExcelFileUpload from '@/components/ExcelFileUpload';
import ExcelPreview from '@/components/ExcelPreview';
import ExcelImportInstructions from '@/components/ExcelImportInstructions';
import RaceTypeSelector from '@/components/RaceTypeSelector';

interface ExcelImportProps {
  drivers: Driver[];
  onImport: (races: Race[], newDrivers: Driver[]) => void;
  championshipId?: string;
}

const ExcelImport = ({ drivers, onImport, championshipId }: ExcelImportProps) => {
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
    handleFileUpload(file);
  };

  const handleImportWrapper = () => {
    handleImport();
    // Reset file input after import
    const fileInput = document.getElementById('excel-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
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
  );
};

export default ExcelImport;
