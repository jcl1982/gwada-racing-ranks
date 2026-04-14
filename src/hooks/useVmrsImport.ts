
import { useState, useEffect } from 'react';
import { parseVmrsExcelFile, VmrsExcelData } from '@/utils/excel/vmrsParser';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { convertSupabaseDriver } from '@/hooks/supabase/converters';
import { Driver } from '@/types/championship';
import { generateValidUUID } from '@/utils/excel/uuidUtils';

export const useVmrsImport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<VmrsExcelData[] | null>(null);
  const [success, setSuccess] = useState(false);
  const [championshipId, setChampionshipId] = useState<string | undefined>();
  const [championshipDrivers, setChampionshipDrivers] = useState<Driver[]>([]);
  const { toast } = useToast();

  // Load rallye-montagne championship
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('championship_config')
        .select('id')
        .eq('type', 'rallye-montagne')
        .maybeSingle();

      if (data) {
        setChampionshipId(data.id);
        const { data: drivers } = await supabase
          .from('drivers')
          .select('*')
          .eq('championship_id', data.id)
          .order('name');
        setChampionshipDrivers(drivers?.map(convertSupabaseDriver) || []);
      }
    };
    load();
  }, []);

  const handleFileUpload = async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setPreviewData(null);

    try {
      const allData: VmrsExcelData[] = [];
      for (const file of files) {
        const parsed = await parseVmrsExcelFile(file);
        allData.push(...parsed);
      }
      setPreviewData(allData);
      toast({ title: "Fichiers VMRS analysés", description: `${allData.length} course(s) trouvée(s).` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la lecture';
      setError(msg);
      toast({ variant: "destructive", title: "Erreur", description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const proceedWithImport = async () => {
    if (!previewData || !championshipId) {
      toast({ variant: "destructive", title: "Erreur", description: "Données ou championnat manquant." });
      return;
    }

    setIsLoading(true);
    try {
      // Reload drivers fresh
      const { data: freshDrivers } = await supabase
        .from('drivers')
        .select('*')
        .eq('championship_id', championshipId)
        .order('name');
      const currentDrivers = freshDrivers?.map(convertSupabaseDriver) || [];

      for (const raceData of previewData) {
        // Find or create the race
        const { data: existingRace } = await supabase
          .from('races')
          .select('id')
          .eq('name', raceData.raceName)
          .eq('championship_id', championshipId)
          .maybeSingle();

        let raceId: string;
        if (existingRace) {
          raceId = existingRace.id;
        } else {
          // Get race level from races table if it exists
          const { data: raceInfo } = await supabase
            .from('races')
            .select('id, race_level')
            .eq('name', raceData.raceName)
            .maybeSingle();
          
          if (raceInfo) {
            raceId = raceInfo.id;
          } else {
            // Create the race
            const { data: newRace, error: raceError } = await supabase
              .from('races')
              .insert({
                name: raceData.raceName,
                date: raceData.raceDate,
                type: 'montagne', // Default, can be adjusted
                championship_id: championshipId,
              })
              .select('id')
              .single();
            
            if (raceError || !newRace) throw new Error(`Erreur création course: ${raceError?.message}`);
            raceId = newRace.id;
          }
        }

        // Process each result
        for (const result of raceData.results) {
          const normalizedName = result.driverName.toLowerCase().trim().replace(/\s+/g, ' ')
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

          let driver = currentDrivers.find(d => {
            const dn = d.name.toLowerCase().trim().replace(/\s+/g, ' ')
              .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return dn === normalizedName && d.driverRole === result.driverRole;
          });

          if (!driver) {
            // Create new driver
            const newDriverId = generateValidUUID();
            const maxNum = Math.max(...currentDrivers.map(d => d.number || 0), 0);
            const { error: driverError } = await supabase
              .from('drivers')
              .insert({
                id: newDriverId,
                name: result.driverName,
                championship_id: championshipId,
                driver_role: result.driverRole,
                number: maxNum + 1,
              });
            
            if (driverError) throw new Error(`Erreur création pilote: ${driverError.message}`);
            
            driver = {
              id: newDriverId,
              name: result.driverName,
              championshipId,
              driverRole: result.driverRole,
              number: maxNum + 1,
            };
            currentDrivers.push(driver);
          }

          // Upsert vmrs_results
          const { error: vmrsError } = await supabase
            .from('vmrs_results')
            .upsert({
              race_id: raceId,
              driver_id: driver.id,
              championship_id: championshipId,
              position: result.position,
              participation_points: result.participationPoints,
              classification_points: result.classificationPoints,
              bonus_points: result.bonusPoints,
              dnf: result.dnf,
            }, { onConflict: 'race_id,driver_id' });

          if (vmrsError) throw new Error(`Erreur VMRS: ${vmrsError.message}`);
        }
      }

      setSuccess(true);
      setPreviewData(null);
      toast({ title: "Import VMRS réussi !", description: `${previewData.length} course(s) importée(s).` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'import";
      setError(msg);
      toast({ variant: "destructive", title: "Erreur d'import VMRS", description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setError(null);
    setSuccess(false);
    setPreviewData(null);
  };

  return {
    isLoading, error, previewData, success,
    handleFileUpload, proceedWithImport, resetForm,
  };
};
