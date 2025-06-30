
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertCircle, Check } from 'lucide-react';

interface ExcelFileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const ExcelFileUpload = ({ onFileUpload, isLoading, error, success }: ExcelFileUploadProps) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="excel-file" className="text-sm font-medium">
          Sélectionner un fichier Excel (.xlsx, .xls)
        </label>
        <Input
          id="excel-file"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
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
    </div>
  );
};

export default ExcelFileUpload;
