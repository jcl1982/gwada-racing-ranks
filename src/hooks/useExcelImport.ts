
import { useState } from 'react';
import { parseExcelFile, convertExcelDataToRaces, type ExcelRaceData } from '@/utils/excel';
import { Driver, Race } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';

export const useExcelImport = (drivers: Driver[], onImport: (races: Race[], newDrivers: Driver[]) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ExcelRaceData[] | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedRaceType, setSelectedRaceType] = useState<'montagne' | 'rallye' | 'karting' | 'acceleration'>('montagne');
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setPreviewData(null);

    try {
      const excelData = await parseExcelFile(file, selectedRaceType);
      setPreviewData(excelData);
      toast({
        title: "Fichier analysé",
        description: `${excelData.length} course(s) trouvée(s) dans le fichier Excel.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la lecture du fichier';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (!previewData) return;

    try {
      const { races, newDrivers } = convertExcelDataToRaces(previewData, drivers);
      
      const newDriversCount = newDrivers.length - drivers.length;
      const racesCount = races.length;
      
      onImport(races, newDrivers);
      setSuccess(true);
      setPreviewData(null);
      
      toast({
        title: "Import réussi !",
        description: `${racesCount} course(s) et ${newDriversCount} nouveau(x) pilote(s) ajouté(s) aux classements.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'import';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur d'import",
        description: errorMessage,
      });
    }
  };

  const resetForm = () => {
    setError(null);
    setSuccess(false);
    setPreviewData(null);
  };

  return {
    isLoading,
    error,
    previewData,
    success,
    selectedRaceType,
    setSelectedRaceType,
    handleFileUpload,
    handleImport,
    resetForm,
  };
};
