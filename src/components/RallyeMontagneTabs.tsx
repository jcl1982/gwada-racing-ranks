import { useEffect, useMemo, useState } from "react";
import { ChampionshipStanding, Race, Driver } from "@/types/championship";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Mountain, Car, Award, Users, Gauge } from "lucide-react";
import GeneralStandingsHeader from "@/components/GeneralStandingsHeader";
import GeneralStandingsTable from "@/components/GeneralStandingsTable";
import GeneralStandingsStats from "@/components/GeneralStandingsStats";
import CategoryHeader from "@/components/CategoryHeader";
import RaceCalendar from "@/components/RaceCalendar";
import StandingsTable from "@/components/StandingsTable";
import PodiumSection from "@/components/PodiumSection";
import { usePdfExport } from "@/hooks/usePdfExport";
import { useImageExport } from "@/hooks/useImageExport";
import { useWebPrint } from "@/hooks/useWebPrint";
import { useExcelExport } from "@/hooks/useExcelExport";
import { toSimplifiedStandings } from "@/utils/standingsConverter";
import PointsEditor from "@/components/PointsEditor";
import StandingsEvolutionChart from "@/components/StandingsEvolutionChart";
import DriverAdvancedStats from "@/components/DriverAdvancedStats";
import DriverComparator from "@/components/DriverComparator";
import { useUserRole } from "@/hooks/useUserRole";
import { StandingsTitles, DEFAULT_STANDINGS_TITLES } from "@/hooks/useChampionshipConfig";

interface RallyeMontagneTabsProps {
  generalStandings: ChampionshipStanding[];
  montagneStandings: ChampionshipStanding[];
  rallyeStandings: ChampionshipStanding[];
  r2Standings: ChampionshipStanding[];
  copiloteStandings: ChampionshipStanding[];
  vmrsStandings: ChampionshipStanding[];
  vmrsCopiloteStandings: ChampionshipStanding[];
  vmrsPiloteHaute?: ChampionshipStanding[];
  vmrsPiloteIntermediaire?: ChampionshipStanding[];
  vmrsPiloteBasse?: ChampionshipStanding[];
  vmrsCopiloteHaute?: ChampionshipStanding[];
  vmrsCopiloteIntermediaire?: ChampionshipStanding[];
  vmrsCopiloteBasse?: ChampionshipStanding[];
  vmrsByType?: {
    montagne: {
      piloteByMoyenne: { haute: ChampionshipStanding[]; intermediaire: ChampionshipStanding[]; basse: ChampionshipStanding[] };
      copiloteByMoyenne: { haute: ChampionshipStanding[]; intermediaire: ChampionshipStanding[]; basse: ChampionshipStanding[] };
      raceIds: Set<string>;
      races: Race[];
    };
    rallye: {
      piloteByMoyenne: { haute: ChampionshipStanding[]; intermediaire: ChampionshipStanding[]; basse: ChampionshipStanding[] };
      copiloteByMoyenne: { haute: ChampionshipStanding[]; intermediaire: ChampionshipStanding[]; basse: ChampionshipStanding[] };
      raceIds: Set<string>;
      races: Race[];
    };
  };
  championshipTitle: string;
  championshipYear: string;
  championshipId: string;
  standingsTitles?: StandingsTitles;
  montagneRaces: Race[];
  rallyeRaces: Race[];
  drivers: Driver[];
  onRaceUpdate?: (raceId: string, results: any[]) => Promise<void>;
}

const RallyeMontagneTabs = ({
  generalStandings,
  montagneStandings,
  rallyeStandings,
  r2Standings,
  copiloteStandings,
  vmrsStandings,
  vmrsCopiloteStandings,
  vmrsPiloteHaute = [],
  vmrsPiloteIntermediaire = [],
  vmrsPiloteBasse = [],
  vmrsCopiloteHaute = [],
  vmrsCopiloteIntermediaire = [],
  vmrsCopiloteBasse = [],
  vmrsByType,
  championshipTitle,
  championshipYear,
  championshipId,
  standingsTitles,
  montagneRaces,
  rallyeRaces,
  drivers,
  onRaceUpdate,
}: RallyeMontagneTabsProps) => {
  const { exportGeneralStandings, exportCategoryStandings } = usePdfExport();
  const { exportToImage } = useImageExport();
  const { printWebPage, printWithUnicodeSupport } = useWebPrint();
  const { exportGeneralToExcel, exportCategoryToExcel } = useExcelExport();
  const { isAdmin } = useUserRole();

  const titles = standingsTitles || DEFAULT_STANDINGS_TITLES;

  // VMRS : ne garder que les courses ayant au moins un résultat VMRS
  const [vmrsRaceIds, setVmrsRaceIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!championshipId) return;
    const fetchIds = () => {
      supabase
        .from("vmrs_results")
        .select("race_id")
        .eq("championship_id", championshipId)
        .then(({ data }) => {
          setVmrsRaceIds(new Set((data || []).map((r: any) => r.race_id)));
        });
    };
    fetchIds();
    const channel = supabase
      .channel(`vmrs_race_ids_${championshipId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vmrs_results', filter: `championship_id=eq.${championshipId}` },
        fetchIds
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [championshipId]);
  const vmrsRaces = useMemo(
    () => [...montagneRaces, ...rallyeRaces].filter((r) => vmrsRaceIds.has(r.id)),
    [montagneRaces, rallyeRaces, vmrsRaceIds]
  );

  const pilotes = drivers.filter((d) => d.driverRole === "pilote");
  const copilotes = drivers.filter((d) => d.driverRole === "copilote");
  const piloteIds = pilotes.map((d) => d.id);
  const copiloteIds = copilotes.map((d) => d.id);

  // Handlers pour le classement général
  const handleGeneralPrintPdf = () => {
    exportGeneralStandings(
      generalStandings,
      championshipTitle,
      `${titles.general} de la LSAG`,
      championshipYear,
    );
  };

  const handleGeneralPrintImage = () => {
    exportToImage(
      "general-standings-table",
      `classement-general-provisoire-${championshipYear}`,
      `${championshipTitle} - ${titles.general} ${championshipYear}`,
    );
  };

  const handleGeneralPrintWeb = () => {
    printWebPage("general-standings-table", `${championshipTitle} - ${titles.general} ${championshipYear}`);
  };

  const handleGeneralPrintUnicode = () => {
    printWithUnicodeSupport(
      "general-standings-table",
      `${championshipTitle} • ${titles.general} ${championshipYear} ★`,
      `
        .unicode-enhanced {
          font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1;
          text-rendering: optimizeLegibility;
        }
        .champion-row {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #1a1a1a;
          font-weight: 700;
        }
      `,
    );
  };

  const handleGeneralExportExcel = () => {
    exportGeneralToExcel(generalStandings, championshipTitle, championshipYear);
  };

  // Handlers pour les catégories
  const handleMontagnePrintPdf = () => {
    const simplifiedStandings = toSimplifiedStandings(montagneStandings, "montagne");
    exportCategoryStandings(titles.montagne, montagneRaces, drivers, championshipYear, simplifiedStandings);
  };

  const handleRallyePrintPdf = () => {
    const simplifiedStandings = toSimplifiedStandings(rallyeStandings, "rallye");
    exportCategoryStandings(titles.rallye, rallyeRaces, drivers, championshipYear, simplifiedStandings);
  };

  const handleR2PrintPdf = () => {
    const simplifiedStandings = toSimplifiedStandings(r2Standings, "r2");
    const allRaces = [...montagneRaces, ...rallyeRaces];
    exportCategoryStandings(titles.r2, allRaces, drivers, championshipYear, simplifiedStandings);
  };

  const handleCopiPrintPdf = () => {
    const simplifiedStandings = toSimplifiedStandings(copiloteStandings, "copilote");
    exportCategoryStandings(titles.copilote, rallyeRaces, drivers, championshipYear, simplifiedStandings);
  };

  // Handlers Excel pour les catégories
  const handleMontagneExportExcel = () => {
    const simplifiedStandings = toSimplifiedStandings(montagneStandings, "montagne");
    exportCategoryToExcel(simplifiedStandings, montagneRaces, titles.montagne, "montagne");
  };

  const handleRallyeExportExcel = () => {
    const simplifiedStandings = toSimplifiedStandings(rallyeStandings, "rallye");
    exportCategoryToExcel(simplifiedStandings, rallyeRaces, titles.rallye, "rallye");
  };

  const handleR2ExportExcel = () => {
    const simplifiedStandings = toSimplifiedStandings(r2Standings, "r2");
    const allRaces = [...montagneRaces, ...rallyeRaces];
    exportCategoryToExcel(simplifiedStandings, allRaces, titles.r2, "r2");
  };

  const handleCopiExportExcel = () => {
    const simplifiedStandings = toSimplifiedStandings(copiloteStandings, "copilote");
    exportCategoryToExcel(simplifiedStandings, rallyeRaces, titles.copilote, "rallye");
  };

  // VMRS handlers
  const handleVmrsPrintPdf = () => {
    const simplifiedStandings = toSimplifiedStandings(vmrsStandings, "rallye");
    exportCategoryStandings(titles.vmrs, vmrsRaces, drivers, championshipYear, simplifiedStandings);
  };

  const handleVmrsExportExcel = () => {
    const simplifiedStandings = toSimplifiedStandings(vmrsStandings, "rallye");
    exportCategoryToExcel(simplifiedStandings, vmrsRaces, titles.vmrs, "rallye");
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">{titles.general_tab || 'Général'}</span>
          </TabsTrigger>
          <TabsTrigger value="montagne" className="flex items-center gap-2">
            <Mountain className="w-4 h-4" />
            <span className="hidden sm:inline">{titles.montagne_tab || 'Montagne'}</span>
          </TabsTrigger>
          <TabsTrigger value="rallye" className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">{titles.rallye_tab || 'Rallye'}</span>
          </TabsTrigger>
          <TabsTrigger value="r2" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">{titles.r2_tab || 'R2'}</span>
          </TabsTrigger>
          <TabsTrigger value="copilote" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">{titles.copilote_tab || 'Copilote'}</span>
          </TabsTrigger>
          <TabsTrigger value="vmrs" className="flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            <span className="hidden sm:inline">{titles.vmrs_tab || 'VMRS'}</span>
          </TabsTrigger>
        </TabsList>

        {/* Classement Général */}
        <TabsContent value="general" className="space-y-6">
          <GeneralStandingsHeader championshipTitle={championshipTitle} championshipYear={championshipYear} subtitle={titles.general_subtitle || undefined} />
          <GeneralStandingsTable
            standings={generalStandings}
            championshipTitle={championshipTitle}
            championshipYear={championshipYear}
            onPrintPdf={handleGeneralPrintPdf}
            onPrintImage={handleGeneralPrintImage}
            onPrintWeb={handleGeneralPrintWeb}
            onPrintUnicode={handleGeneralPrintUnicode}
            onPrintExcel={handleGeneralExportExcel}
          />
          <GeneralStandingsStats standings={generalStandings} />
          <StandingsEvolutionChart
            races={[...montagneRaces, ...rallyeRaces]}
            drivers={drivers}
            title="Évolution des points - Classement Général"
            type="all"
          />
          {isAdmin && (
            <DriverAdvancedStats
              races={[...montagneRaces, ...rallyeRaces]}
              drivers={drivers}
              title="Statistiques détaillées - Classement Général"
              type="all"
            />
          )}
          {isAdmin && (
            <DriverComparator
              races={[...montagneRaces, ...rallyeRaces]}
              drivers={pilotes}
              title="Comparateur de pilotes - Général"
            />
          )}

          {onRaceUpdate && isAdmin && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Résultats par Course</h2>
              <PointsEditor
                races={[...montagneRaces, ...rallyeRaces]}
                drivers={drivers}
                onRaceUpdate={onRaceUpdate}
                showRoleSelector={true}
              />
            </div>
          )}
        </TabsContent>

        {/* Trophée de la Montagne */}
        <TabsContent value="montagne" className="space-y-6">
          <CategoryHeader displayTitle={titles.montagne} championshipYear={championshipYear} subtitle={titles.montagne_subtitle || undefined} />
          <RaceCalendar races={montagneRaces} driverIds={piloteIds} />
          <StandingsTable
            displayTitle={titles.montagne}
            races={montagneRaces}
            type="montagne"
            standings={toSimplifiedStandings(montagneStandings, "montagne")}
            onPrintPdf={handleMontagnePrintPdf}
          />
          <PodiumSection standings={toSimplifiedStandings(montagneStandings, "montagne")} />
          <StandingsEvolutionChart
            races={montagneRaces}
            drivers={drivers}
            title={`Évolution des points - ${titles.montagne}`}
            type="montagne"
          />
          {isAdmin && (
            <DriverAdvancedStats
              races={montagneRaces}
              drivers={pilotes}
              title={`Statistiques détaillées - ${titles.montagne}`}
              type="montagne"
              championshipId={championshipId}
              overrideStandingType="montagne"
            />
          )}
          {isAdmin && (
            <DriverComparator
              races={montagneRaces}
              drivers={pilotes}
              title={`Comparateur de pilotes - ${titles.montagne}`}
            />
          )}

          {onRaceUpdate && isAdmin && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Résultats par Course Montagne</h2>
              <PointsEditor
                races={montagneRaces}
                drivers={drivers}
                onRaceUpdate={onRaceUpdate}
                showRoleSelector={true}
              />
            </div>
          )}
        </TabsContent>

        {/* Trophée des Rallyes */}
        <TabsContent value="rallye" className="space-y-6">
          <CategoryHeader displayTitle={titles.rallye} championshipYear={championshipYear} subtitle={titles.rallye_subtitle || undefined} />
          <RaceCalendar races={rallyeRaces} driverIds={piloteIds} />
          <StandingsTable
            displayTitle={titles.rallye}
            races={rallyeRaces}
            type="rallye"
            standings={toSimplifiedStandings(rallyeStandings, "rallye")}
            onPrintPdf={handleRallyePrintPdf}
          />
          <PodiumSection standings={toSimplifiedStandings(rallyeStandings, "rallye")} />
          <StandingsEvolutionChart
            races={rallyeRaces}
            drivers={drivers}
            title={`Évolution des points - ${titles.rallye}`}
            type="rallye"
          />
          {isAdmin && (
            <DriverAdvancedStats
              races={rallyeRaces}
              drivers={pilotes}
              title={`Statistiques détaillées - ${titles.rallye}`}
              type="rallye"
              championshipId={championshipId}
              overrideStandingType="rallye"
            />
          )}
          {isAdmin && (
            <DriverComparator
              races={rallyeRaces}
              drivers={pilotes}
              title={`Comparateur de pilotes - ${titles.rallye}`}
            />
          )}

          {onRaceUpdate && isAdmin && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Résultats par Course Rallye</h2>
              <PointsEditor races={rallyeRaces} drivers={drivers} onRaceUpdate={onRaceUpdate} showRoleSelector={true} />
            </div>
          )}
        </TabsContent>

        {/* Trophée R2 */}
        <TabsContent value="r2" className="space-y-6">
          <CategoryHeader displayTitle={titles.r2} championshipYear={championshipYear} subtitle={titles.r2_subtitle || undefined} />
          <RaceCalendar races={[...montagneRaces, ...rallyeRaces]} driverIds={piloteIds} />
          <StandingsTable
            displayTitle={titles.r2}
            races={[...montagneRaces, ...rallyeRaces]}
            type="r2"
            standings={toSimplifiedStandings(r2Standings, "r2")}
            onPrintPdf={handleR2PrintPdf}
          />
          <PodiumSection standings={toSimplifiedStandings(r2Standings, "r2")} />
          <StandingsEvolutionChart
            races={[...montagneRaces, ...rallyeRaces]}
            drivers={drivers}
            title={`Évolution des points - ${titles.r2}`}
            type="all"
          />
          {isAdmin && (
            <DriverAdvancedStats
              races={[...montagneRaces, ...rallyeRaces]}
              drivers={pilotes}
              title={`Statistiques détaillées - ${titles.r2}`}
              type="all"
            />
          )}
          {isAdmin && (
            <DriverComparator
              races={[...montagneRaces, ...rallyeRaces]}
              drivers={pilotes}
              title={`Comparateur de pilotes - ${titles.r2}`}
            />
          )}
        </TabsContent>

        {/* Trophée Copilote */}
        <TabsContent value="copilote" className="space-y-6">
          <CategoryHeader displayTitle={titles.copilote} championshipYear={championshipYear} subtitle={titles.copilote_subtitle || undefined} />
          <RaceCalendar races={rallyeRaces} driverIds={copiloteIds} />
          <StandingsTable
            displayTitle={titles.copilote}
            races={rallyeRaces}
            type="rallye"
            standings={toSimplifiedStandings(copiloteStandings, "copilote")}
            onPrintPdf={handleCopiPrintPdf}
          />
          <PodiumSection standings={toSimplifiedStandings(copiloteStandings, "copilote")} />
          <StandingsEvolutionChart
            races={rallyeRaces}
            drivers={copilotes}
            title={`Évolution des points - ${titles.copilote}`}
            type="rallye"
          />
          {isAdmin && (
            <DriverAdvancedStats
              races={rallyeRaces}
              drivers={copilotes}
              title={`Statistiques détaillées - ${titles.copilote}`}
              type="rallye"
            />
          )}
          {isAdmin && (
            <DriverComparator
              races={rallyeRaces}
              drivers={copilotes}
              title={`Comparateur de copilotes - ${titles.copilote}`}
            />
          )}

          {onRaceUpdate && isAdmin && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Résultats par Course Copilote</h2>
              <PointsEditor
                races={rallyeRaces}
                drivers={drivers.filter((d) => d.driverRole === "copilote")}
                onRaceUpdate={onRaceUpdate}
                showRoleSelector={false}
                defaultRole="copilote"
              />
            </div>
          )}
        </TabsContent>

        {/* Trophée VMRS - séparé en Montagne / Rallye, chacun avec 3 moyennes (art. 7.2) */}
        <TabsContent value="vmrs" className="space-y-6">
          <CategoryHeader displayTitle={titles.vmrs} championshipYear={championshipYear} subtitle={titles.vmrs_subtitle || undefined} />

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>Général VMRS</span>
              </TabsTrigger>
              <TabsTrigger value="montagne" className="flex items-center gap-2">
                <Mountain className="w-4 h-4" />
                <span>Trophée Montagne VMRS</span>
              </TabsTrigger>
              <TabsTrigger value="rallye" className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                <span>Trophée Rallye VMRS</span>
              </TabsTrigger>
            </TabsList>

            {/* Général VMRS = Montagne + Rallye agrégés par moyenne */}
            <TabsContent value="general" className="space-y-6 mt-6">
              <RaceCalendar races={vmrsRaces} driverIds={piloteIds} />
              {vmrsRaces.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune course avec résultats VMRS pour le moment.
                </p>
              ) : (
                <Tabs defaultValue="haute" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="haute">Moyenne Haute</TabsTrigger>
                    <TabsTrigger value="intermediaire">Moyenne Intermédiaire</TabsTrigger>
                    <TabsTrigger value="basse">Moyenne Basse</TabsTrigger>
                  </TabsList>

                  {([
                    { key: 'haute', label: 'Haute', pilotes: vmrsPiloteHaute, copilotes: vmrsCopiloteHaute },
                    { key: 'intermediaire', label: 'Intermédiaire', pilotes: vmrsPiloteIntermediaire, copilotes: vmrsCopiloteIntermediaire },
                    { key: 'basse', label: 'Basse', pilotes: vmrsPiloteBasse, copilotes: vmrsCopiloteBasse },
                  ] as const).map(({ key, label, pilotes: piloteList, copilotes: copiloteList }) => (
                    <TabsContent key={key} value={key} className="space-y-6 mt-6">
                      {piloteList.length > 0 ? (
                        <>
                          <StandingsTable
                            displayTitle={`${titles.vmrs} Général - Moyenne ${label} - Pilotes`}
                            races={vmrsRaces}
                            type="rallye"
                            standings={toSimplifiedStandings(piloteList, "rallye")}
                            onPrintPdf={() => {
                              const s = toSimplifiedStandings(piloteList, "rallye");
                              exportCategoryStandings(`${titles.vmrs} Général - Moyenne ${label} - Pilotes`, vmrsRaces, drivers, championshipYear, s);
                            }}
                          />
                          <PodiumSection standings={toSimplifiedStandings(piloteList, "rallye")} />
                        </>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">Aucun pilote en moyenne {label.toLowerCase()} pour le moment.</p>
                      )}

                      {copiloteList.length > 0 && (
                        <>
                          <StandingsTable
                            displayTitle={`${titles.vmrs} Général - Moyenne ${label} - Copilotes`}
                            races={vmrsRaces}
                            type="rallye"
                            standings={toSimplifiedStandings(copiloteList, "copilote")}
                            onPrintPdf={() => {
                              const s = toSimplifiedStandings(copiloteList, "copilote");
                              exportCategoryStandings(`${titles.vmrs} Général - Moyenne ${label} - Copilotes`, vmrsRaces, drivers, championshipYear, s);
                            }}
                          />
                          <PodiumSection standings={toSimplifiedStandings(copiloteList, "copilote")} />
                        </>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </TabsContent>

            {(['montagne', 'rallye'] as const).map((raceType) => {
              const bucket = vmrsByType?.[raceType];
              const piloteByM = bucket?.piloteByMoyenne || { haute: [], intermediaire: [], basse: [] };
              const copiloteByM = bucket?.copiloteByMoyenne || { haute: [], intermediaire: [], basse: [] };
              const raceIdsForType = bucket?.raceIds || new Set<string>();
              const sourceRaces = raceType === 'montagne' ? montagneRaces : rallyeRaces;
              const sourceFiltered = sourceRaces.filter((r) => raceIdsForType.has(r.id));
              // Use races from VMRS bucket (fetched without championship filter) if local list is missing entries
              const filteredRaces: Race[] = sourceFiltered.length >= (bucket?.races.length || 0)
                ? sourceFiltered
                : (bucket?.races as any as Race[]) || sourceFiltered;
              const typeLabel = raceType === 'montagne' ? 'Montagne' : 'Rallye';

              return (
                <TabsContent key={raceType} value={raceType} className="space-y-6 mt-6">
                  <RaceCalendar races={filteredRaces} driverIds={piloteIds} />

                  {filteredRaces.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Aucune course {typeLabel.toLowerCase()} avec résultats VMRS pour le moment.
                    </p>
                  ) : (
                    <Tabs defaultValue="haute" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="haute">Moyenne Haute</TabsTrigger>
                        <TabsTrigger value="intermediaire">Moyenne Intermédiaire</TabsTrigger>
                        <TabsTrigger value="basse">Moyenne Basse</TabsTrigger>
                      </TabsList>

                      {([
                        { key: 'haute', label: 'Haute', pilotes: piloteByM.haute, copilotes: copiloteByM.haute },
                        { key: 'intermediaire', label: 'Intermédiaire', pilotes: piloteByM.intermediaire, copilotes: copiloteByM.intermediaire },
                        { key: 'basse', label: 'Basse', pilotes: piloteByM.basse, copilotes: copiloteByM.basse },
                      ] as const).map(({ key, label, pilotes: piloteList, copilotes: copiloteList }) => (
                        <TabsContent key={key} value={key} className="space-y-6 mt-6">
                          {piloteList.length > 0 ? (
                            <>
                              <StandingsTable
                                displayTitle={`${titles.vmrs} ${typeLabel} - Moyenne ${label} - Pilotes`}
                                races={filteredRaces}
                                type="rallye"
                                standings={toSimplifiedStandings(piloteList, "rallye")}
                                onPrintPdf={() => {
                                  const s = toSimplifiedStandings(piloteList, "rallye");
                                  exportCategoryStandings(`${titles.vmrs} ${typeLabel} - Moyenne ${label} - Pilotes`, filteredRaces, drivers, championshipYear, s);
                                }}
                              />
                              <PodiumSection standings={toSimplifiedStandings(piloteList, "rallye")} />
                            </>
                          ) : (
                            <p className="text-muted-foreground text-center py-8">Aucun pilote en moyenne {label.toLowerCase()} pour le moment.</p>
                          )}

                          {copiloteList.length > 0 && (
                            <>
                              <StandingsTable
                                displayTitle={`${titles.vmrs} ${typeLabel} - Moyenne ${label} - Copilotes`}
                                races={filteredRaces}
                                type="rallye"
                                standings={toSimplifiedStandings(copiloteList, "copilote")}
                                onPrintPdf={() => {
                                  const s = toSimplifiedStandings(copiloteList, "copilote");
                                  exportCategoryStandings(`${titles.vmrs} ${typeLabel} - Moyenne ${label} - Copilotes`, filteredRaces, drivers, championshipYear, s);
                                }}
                              />
                              <PodiumSection standings={toSimplifiedStandings(copiloteList, "copilote")} />
                            </>
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RallyeMontagneTabs;
