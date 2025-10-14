import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileSpreadsheet } from 'lucide-react';
import { Driver, Race } from '@/types/championship';
import { useExcelImport } from '@/hooks/useExcelImport';
import ExcelFileUpload from '@/components/ExcelFileUpload';
import ExcelPreview from '@/components/ExcelPreview';
import ExcelImportInstructions from '@/components/ExcelImportInstructions';
import RaceTypeSelector from '@/components/RaceTypeSelector';
import KartingCategorySelector from '@/components/KartingCategorySelector';
import DriverRoleSelector from '@/components/DriverRoleSelector';
import SaveBeforeImportDialog from '@/components/SaveBeforeImportDialog';


interface ExcelImportProps {
  drivers: Driver[];
  races?: Race[];
  onImport: (races: Race[], newDrivers: Driver[]) => Promise<void>;
  championshipId?: string;
  
}

const ExcelImport = ({ drivers, races, onImport, championshipId }: ExcelImportProps) => {
  
  const {
    isLoading,
    error,
    previewData,
    success,
    selectedRaceType,
    selectedKartingCategory,
    selectedDriverRole,
    showSaveDialog,
    setSelectedRaceType,
    setSelectedKartingCategory,
    setSelectedDriverRole,
    setShowSaveDialog,
    handleFileUpload,
    handleImportClick,
    proceedWithImport,
    resetForm,
  } = useExcelImport(drivers, onImport, championshipId);


  const handleFileUploadWrapper = (files: File[]) => {
    // Reset file input after processing
    const fileInput = document.getElementById('excel-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    handleFileUpload(files);
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
            {(selectedRaceType === 'montagne' || selectedRaceType === 'rallye') && (
              <DriverRoleSelector
                selectedRole={selectedDriverRole}
                onRoleChange={setSelectedDriverRole}
              />
            )}
            {selectedRaceType === 'karting' && (
              <KartingCategorySelector
                selectedCategory={selectedKartingCategory}
                onCategoryChange={setSelectedKartingCategory}
              />
            )}
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
            onImport={handleImportClick}
            onCancel={handleResetForm}
          />
        )}
      </div>

      <SaveBeforeImportDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSaveAndImport={() => proceedWithImport(true)}
        onImportWithoutSave={() => proceedWithImport(false)}
      />
    </>
  );
};

export default ExcelImport;
