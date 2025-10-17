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
import { toSimplifiedStandings } from "@/utils/standingsConverter";
import PointsEditor from "@/components/PointsEditor";
import { useUserRole } from "@/hooks/useUserRole";

interface RallyeMontagneTabsProps {
  generalStandings: ChampionshipStanding[];
  montagneStandings: ChampionshipStanding[];
  rallyeStandings: ChampionshipStanding[];
  r2Standings: ChampionshipStanding[];
  copiloteStandings: ChampionshipStanding[];
  championshipTitle: string;
  championshipYear: string;
  championshipId: string;
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
  montagneRaces,
  rallyeRaces,
  drivers,
  onRaceUpdate,
}: RallyeMontagneTabsProps) => {
  const { exportGeneralStandings, exportCategoryStandings } = usePdfExport();
  const { isAdmin } = useUserRole();

  // Séparer les pilotes et copilotes
  const pilotes = drivers.filter((d) => d.driverRole === "pilote");
  const copilotes = drivers.filter((d) => d.driverRole === "copilote");
  const piloteIds = pilotes.map((d) => d.id);
  const copiloteIds = copilotes.map((d) => d.id);

  // Handlers pour le classement général
  const handleGeneralPrintPdf = () => {
    exportGeneralStandings(
      generalStandings,
      championshipTitle,
      "Classement Général Provisoire de la LSAG",
      championshipYear,
    );
  };

  // Handlers pour les catégories
  const handleMontagnePrintPdf = () => {
    const simplifiedStandings = toSimplifiedStandings(montagneStandings, "montagne");
    exportCategoryStandings("Trophée de la Montagne", montagneRaces, drivers, championshipYear, simplifiedStandings);
  };

  const handleRallyePrintPdf = () => {
    const simplifiedStandings = toSimplifiedStandings(rallyeStandings, "rallye");
    exportCategoryStandings("Trophée des Rallyes", rallyeRaces, drivers, championshipYear, simplifiedStandings);
  };

  const handleR2PrintPdf = () => {
    const simplifiedStandings = toSimplifiedStandings(r2Standings, "r2");
    const allRaces = [...montagneRaces, ...rallyeRaces];
    exportCategoryStandings("Trophée R2", allRaces, drivers, championshipYear, simplifiedStandings);
  };

  const handleCopiPrintPdf = () => {
    const simplifiedStandings = toSimplifiedStandings(copiloteStandings, "copilote");
    exportCategoryStandings("Trophée Copilote", rallyeRaces, drivers, championshipYear, simplifiedStandings);
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
          <CategoryHeader displayTitle="Trophée de la Montagne" championshipYear={championshipYear} />
          <RaceCalendar races={montagneRaces} driverIds={piloteIds} />
          <StandingsTable
            displayTitle="Trophée de la Montagne"
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
          <CategoryHeader displayTitle="Trophée des Rallyes" championshipYear={championshipYear} />
          <RaceCalendar races={rallyeRaces} driverIds={piloteIds} />
          <StandingsTable
            displayTitle="Trophée des Rallyes"
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
          <CategoryHeader displayTitle="Trophée R2" championshipYear={championshipYear} />
          <RaceCalendar races={[...montagneRaces, ...rallyeRaces]} driverIds={piloteIds} />
          <StandingsTable
            displayTitle="Trophée R2"
            races={[...montagneRaces, ...rallyeRaces]}
            type="r2"
            standings={toSimplifiedStandings(r2Standings, "r2")}
            onPrintPdf={handleR2PrintPdf}
          />
          <PodiumSection standings={toSimplifiedStandings(r2Standings, "r2")} />
        </TabsContent>

        {/* Trophée Copilote */}
        <TabsContent value="copilote" className="space-y-6">
          <CategoryHeader displayTitle="Trophée Copilote" championshipYear={championshipYear} />
          <RaceCalendar races={rallyeRaces} driverIds={copiloteIds} />
          <StandingsTable
            displayTitle="Trophée Copilote"
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
