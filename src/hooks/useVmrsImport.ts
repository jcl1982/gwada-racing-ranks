
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
  const [selectedRaceType, setSelectedRaceType] = useState<'montagne' | 'rallye'>('montagne');
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
          .eq('scope', 'vmrs')
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
        .eq('scope', 'vmrs')
        .order('name');
      const currentDrivers = freshDrivers?.map(convertSupabaseDriver) || [];

      // Helper: normalize race names for fuzzy matching
      const normalizeName = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      // Pre-fetch races of the VMRS championship only to avoid cross-championship matching
      const { data: allRaces } = await supabase
        .from('races')
        .select('id, name, date, championship_id')
        .eq('championship_id', championshipId);

      const racesCache: any[] = allRaces || [];

      for (const raceData of previewData) {
        const targetName = normalizeName(raceData.raceName);

        // Match by normalized name + date in the VMRS championship; fallback by name only
        const existing = racesCache.find(
          (r: any) => normalizeName(r.name) === targetName && r.date === raceData.raceDate
        ) || racesCache.find(
          (r: any) => normalizeName(r.name) === targetName
        );

        let raceId: string;
        if (existing) {
          raceId = existing.id;
        } else {
          const { data: newRace, error: raceError } = await supabase
            .from('races')
            .insert({
              name: raceData.raceName,
              date: raceData.raceDate,
              type: selectedRaceType,
              championship_id: championshipId,
            })
            .select('id')
            .single();

          if (raceError || !newRace) throw new Error(`Erreur création course: ${raceError?.message}`);
          raceId = newRace.id;
          racesCache.push({ id: raceId, name: raceData.raceName, date: raceData.raceDate, championship_id: championshipId });
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
                scope: 'vmrs',
              } as any);
            
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
              moyenne: result.moyenne,
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
    selectedRaceType, setSelectedRaceType,
    handleFileUpload, proceedWithImport, resetForm,
  };
};
