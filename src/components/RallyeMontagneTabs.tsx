import { ChampionshipStanding, Race, Driver } from "@/types/championship";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Mountain, Car, Award, Users } from "lucide-react";
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
import { useUserRole } from "@/hooks/useUserRole";
import { StandingsTitles, DEFAULT_STANDINGS_TITLES } from "@/hooks/useChampionshipConfig";

interface RallyeMontagneTabsProps {
  generalStandings: ChampionshipStanding[];
  montagneStandings: ChampionshipStanding[];
  rallyeStandings: ChampionshipStanding[];
  r2Standings: ChampionshipStanding[];
  copiloteStandings: ChampionshipStanding[];
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Général</span>
          </TabsTrigger>
          <TabsTrigger value="montagne" className="flex items-center gap-2">
            <Mountain className="w-4 h-4" />
            <span className="hidden sm:inline">Montagne</span>
          </TabsTrigger>
          <TabsTrigger value="rallye" className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            <span className="hidden sm:inline">Rallye</span>
          </TabsTrigger>
          <TabsTrigger value="r2" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">R2</span>
          </TabsTrigger>
          <TabsTrigger value="copilote" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Copilote</span>
          </TabsTrigger>
        </TabsList>

        {/* Classement Général */}
        <TabsContent value="general" className="space-y-6">
          <GeneralStandingsHeader championshipTitle={championshipTitle} championshipYear={championshipYear} />
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
          <CategoryHeader displayTitle={titles.montagne} championshipYear={championshipYear} />
          <RaceCalendar races={montagneRaces} driverIds={piloteIds} />
          <StandingsTable
            displayTitle={titles.montagne}
            races={montagneRaces}
            type="montagne"
            standings={toSimplifiedStandings(montagneStandings, "montagne")}
            onPrintPdf={handleMontagnePrintPdf}
          />
          <PodiumSection standings={toSimplifiedStandings(montagneStandings, "montagne")} />

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
          <CategoryHeader displayTitle={titles.rallye} championshipYear={championshipYear} />
          <RaceCalendar races={rallyeRaces} driverIds={piloteIds} />
          <StandingsTable
            displayTitle={titles.rallye}
            races={rallyeRaces}
            type="rallye"
            standings={toSimplifiedStandings(rallyeStandings, "rallye")}
            onPrintPdf={handleRallyePrintPdf}
          />
          <PodiumSection standings={toSimplifiedStandings(rallyeStandings, "rallye")} />

          {onRaceUpdate && isAdmin && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Résultats par Course Rallye</h2>
              <PointsEditor races={rallyeRaces} drivers={drivers} onRaceUpdate={onRaceUpdate} showRoleSelector={true} />
            </div>
          )}
        </TabsContent>

        {/* Trophée R2 */}
        <TabsContent value="r2" className="space-y-6">
          <CategoryHeader displayTitle={titles.r2} championshipYear={championshipYear} />
          <RaceCalendar races={[...montagneRaces, ...rallyeRaces]} driverIds={piloteIds} />
          <StandingsTable
            displayTitle={titles.r2}
            races={[...montagneRaces, ...rallyeRaces]}
            type="r2"
            standings={toSimplifiedStandings(r2Standings, "r2")}
            onPrintPdf={handleR2PrintPdf}
          />
          <PodiumSection standings={toSimplifiedStandings(r2Standings, "r2")} />
        </TabsContent>

        {/* Trophée Copilote */}
        <TabsContent value="copilote" className="space-y-6">
          <CategoryHeader displayTitle={titles.copilote} championshipYear={championshipYear} />
          <RaceCalendar races={rallyeRaces} driverIds={copiloteIds} />
          <StandingsTable
            displayTitle={titles.copilote}
            races={rallyeRaces}
            type="rallye"
            standings={toSimplifiedStandings(copiloteStandings, "copilote")}
            onPrintPdf={handleCopiPrintPdf}
          />
          <PodiumSection standings={toSimplifiedStandings(copiloteStandings, "copilote")} />

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
      </Tabs>
    </div>
  );
};

export default RallyeMontagneTabs;
