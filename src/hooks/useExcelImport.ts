
import { useState, useEffect } from 'react';
import { parseExcelFile, convertExcelDataToRaces, type ExcelRaceData } from '@/utils/excel';
import { Driver, Race } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Mapping des types de course vers les titres de championnats
const RACE_TYPE_TO_CHAMPIONSHIP: Record<string, string> = {
  'montagne': 'Championnat Rallye-Montagne',
  'rallye': 'Championnat Rallye-Montagne',
  'karting': 'Championnat Karting',
  'acceleration': 'Championnat Accélération',
};

export const useExcelImport = (drivers: Driver[], onImport: (races: Race[], newDrivers: Driver[]) => Promise<void>, defaultChampionshipId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ExcelRaceData[] | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedRaceType, setSelectedRaceType] = useState<'montagne' | 'rallye' | 'karting'>('montagne');
  const [selectedKartingCategory, setSelectedKartingCategory] = useState<'MINI 60' | 'SENIOR MASTER GENTLEMAN' | 'KZ2'>('MINI 60');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [championshipId, setChampionshipId] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  // Charger le championshipId approprié basé sur le type de course sélectionné
  useEffect(() => {
    const loadChampionshipId = async () => {
      const championshipTitle = RACE_TYPE_TO_CHAMPIONSHIP[selectedRaceType];
      
      if (!championshipTitle) {
        console.warn('⚠️ [IMPORT] Aucun titre de championnat trouvé pour le type:', selectedRaceType);
        return;
      }

      console.log('🔧 [IMPORT] Chargement du championshipId pour:', championshipTitle);

      const { data, error } = await supabase
        .from('championship_config')
        .select('id')
        .eq('title', championshipTitle)
        .maybeSingle();

      if (error) {
        console.error('❌ [IMPORT] Erreur lors du chargement du championshipId:', error);
        return;
      }

      if (data) {
        console.log('✅ [IMPORT] ChampionshipId chargé:', data.id, 'pour', championshipTitle);
        setChampionshipId(data.id);
      } else {
        console.warn('⚠️ [IMPORT] Aucun championnat trouvé pour:', championshipTitle);
      }
    };

    loadChampionshipId();
  }, [selectedRaceType]);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setPreviewData(null);

    console.log('📤 [IMPORT] handleFileUpload - Type sélectionné:', selectedRaceType);
    console.log('📤 [IMPORT] Catégorie karting sélectionnée:', selectedKartingCategory);

    try {
      const excelData = await parseExcelFile(
        file, 
        selectedRaceType,
        selectedRaceType === 'karting' ? selectedKartingCategory : undefined
      );
      
      console.log('📥 [IMPORT] Données Excel parsées:', excelData.map(r => ({
        name: r.raceName,
        type: r.raceType,
        category: r.kartingCategory
      })));
      
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
    
    if (!championshipId) {
      console.error('❌ [IMPORT] Pas de championshipId disponible');
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le championnat n'a pas été chargé correctement. Veuillez réessayer.",
      });
      return;
    }

    try {
      const championshipTitle = RACE_TYPE_TO_CHAMPIONSHIP[selectedRaceType];
      console.log('🚀 [IMPORT] Début de l\'import:', {
        raceType: selectedRaceType,
        championshipTitle,
        championshipId,
        racesCount: previewData.length
      });
      
      // Extraire les noms des courses depuis previewData
      const racesNames = previewData.map(race => race.raceName);
      
      if (shouldSave) {
        const saved = await saveCurrentStandings(racesNames, selectedRaceType);
        if (!saved) return;
      }

      console.log('📦 [IMPORT] Conversion des données Excel avec championshipId:', championshipId);
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
