
import { useState } from 'react';
import { parseExcelFile, convertExcelDataToRaces, type ExcelRaceData } from '@/utils/excel';
import { Driver, Race } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useExcelImport = (drivers: Driver[], onImport: (races: Race[], newDrivers: Driver[]) => Promise<void>, championshipId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ExcelRaceData[] | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedRaceType, setSelectedRaceType] = useState<'montagne' | 'rallye' | 'karting'>('montagne');
  const [selectedKartingCategory, setSelectedKartingCategory] = useState<'MINI 60' | 'SENIOR MASTER GENTLEMAN' | 'KZ2'>('MINI 60');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setPreviewData(null);

    try {
      const excelData = await parseExcelFile(
        file, 
        selectedRaceType,
        selectedRaceType === 'karting' ? selectedKartingCategory : undefined
      );
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

  const handleImportClick = () => {
    setShowSaveDialog(true);
  };

  const saveCurrentStandings = async (racesNames: string[], raceType: 'montagne' | 'rallye' | 'karting') => {
    if (!championshipId) return false;
    
    try {
      console.log('💾 Sauvegarde des classements avant import...');
      
      // Construire le nom de la sauvegarde avec les noms des courses
      const saveName = racesNames.length > 0 
        ? `Avant import: ${racesNames.join(', ')}`
        : `Avant import - ${new Date().toLocaleString('fr-FR')}`;
      
      // Sauvegarder le classement correspondant au type de course importé
      // Pour karting, on ne sauvegarde pas car c'est un classement par catégorie
      if (raceType === 'karting') {
        return true; // Pas de sauvegarde pour le karting
      }
      const standingType = raceType;
      
      const { error } = await supabase.rpc('save_standings_by_type', {
        p_championship_id: championshipId,
        p_standing_type: standingType,
        p_save_name: saveName
      });
      
      if (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        toast({
          variant: "destructive",
          title: "Erreur de sauvegarde",
          description: "Impossible de sauvegarder les classements avant l'import.",
        });
        return false;
      }
      
      console.log(`✅ Classement ${standingType} sauvegardé`);
      toast({
        title: "Classements sauvegardés",
        description: `L'état actuel du classement ${standingType} a été sauvegardé.`,
      });
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      return false;
    }
  };

  const proceedWithImport = async (shouldSave: boolean) => {
    if (!previewData) return;

    try {
      // Extraire les noms des courses depuis previewData
      const racesNames = previewData.map(race => race.raceName);
      
      if (shouldSave) {
        const saved = await saveCurrentStandings(racesNames, selectedRaceType);
        if (!saved) return;
      }

      const { races, newDrivers } = convertExcelDataToRaces(previewData, drivers, championshipId);
      
      const newDriversCount = newDrivers.length - drivers.length;
      const racesCount = races.length;
      
      await onImport(races, newDrivers);
      setSuccess(true);
      setPreviewData(null);
      setShowSaveDialog(false);
      
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
    selectedKartingCategory,
    showSaveDialog,
    setSelectedRaceType,
    setSelectedKartingCategory,
    setShowSaveDialog,
    handleFileUpload,
    handleImportClick,
    proceedWithImport,
    resetForm,
  };
};
