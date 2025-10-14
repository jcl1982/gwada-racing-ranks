import { ChampionshipStanding, Race, Driver } from '@/types/championship';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Mountain, Car, Award, Users } from 'lucide-react';
import GeneralStandingsHeader from '@/components/GeneralStandingsHeader';
import GeneralStandingsTable from '@/components/GeneralStandingsTable';
import GeneralStandingsStats from '@/components/GeneralStandingsStats';
import CategoryHeader from '@/components/CategoryHeader';
import RaceCalendar from '@/components/RaceCalendar';
import StandingsTable from '@/components/StandingsTable';
import PodiumSection from '@/components/PodiumSection';
import { usePdfExport } from '@/hooks/usePdfExport';
import { useImageExport } from '@/hooks/useImageExport';
import { useWebPrint } from '@/hooks/useWebPrint';
import { toSimplifiedStandings } from '@/utils/standingsConverter';
import PointsEditor from '@/components/PointsEditor';

interface RallyeMontagneTabsProps {
  generalStandings: ChampionshipStanding[];
  montagneStandings: ChampionshipStanding[];
  rallyeStandings: ChampionshipStanding[];
  c2r2Standings: ChampionshipStanding[];
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
  c2r2Standings,
  copiloteStandings,
  championshipTitle,
  championshipYear,
  championshipId,
  montagneRaces,
  rallyeRaces,
  drivers,
  onRaceUpdate
}: RallyeMontagneTabsProps) => {
  const { exportGeneralStandings, exportCategoryStandings } = usePdfExport();
  const { exportToImage } = useImageExport();
  const { printWebPage, printWithUnicodeSupport } = useWebPrint();

  // Handlers pour le classement général
  const handleGeneralPrintPdf = () => {
    exportGeneralStandings(generalStandings, championshipTitle, "Classement Général Provisoire de la LSAG", championshipYear);
  };

  const handleGeneralPrintImage = () => {
    exportToImage(
      'general-standings-table',
      `classement-general-provisoire-${championshipYear}`,
      `${championshipTitle} - Classement Général Provisoire ${championshipYear}`
    );
  };

  const handleGeneralPrintWeb = () => {
    printWebPage(
      'general-standings-table',
      `${championshipTitle} - Classement Général Provisoire ${championshipYear}`
    );
  };

  const handleGeneralPrintUnicode = () => {
    printWithUnicodeSupport(
      'general-standings-table',
      `${championshipTitle} • Classement Général Provisoire ${championshipYear} ★`,
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
      `
    );
  };

  // Handlers pour les catégories
  const handleMontagnePrintPdf = () => {
    const simplifiedStandings = toSimplifiedStandings(montagneStandings, 'montagne');
    exportCategoryStandings('Trophée de la Montagne', montagneRaces, drivers, championshipYear, simplifiedStandings);
  };

  const handleRallyePrintPdf = () => {
    const simplifiedStandings = toSimplifiedStandings(rallyeStandings, 'rallye');
    exportCategoryStandings('Trophée des Rallyes', rallyeRaces, drivers, championshipYear, simplifiedStandings);
  };

  const handleC2R2PrintPdf = () => {
    const simplifiedStandings = toSimplifiedStandings(c2r2Standings, 'c2r2');
    const allRaces = [...montagneRaces, ...rallyeRaces];
    exportCategoryStandings('Trophée C2 R2', allRaces, drivers, championshipYear, simplifiedStandings);
  };

  const handleCopiPrintPdf = () => {
    const simplifiedStandings = toSimplifiedStandings(copiloteStandings, 'copilote');
    exportCategoryStandings('Trophée Copilote', rallyeRaces, drivers, championshipYear, simplifiedStandings);
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
          <TabsTrigger value="c2r2" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">C2 R2</span>
          </TabsTrigger>
          <TabsTrigger value="copilote" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Copilote</span>
          </TabsTrigger>
        </TabsList>

        {/* Classement Général */}
        <TabsContent value="general" className="space-y-6">
          <GeneralStandingsHeader 
            championshipTitle={championshipTitle}
            championshipYear={championshipYear}
          />
          <GeneralStandingsTable
            standings={generalStandings}
            championshipTitle={championshipTitle}
            championshipYear={championshipYear}
            onPrintPdf={handleGeneralPrintPdf}
            onPrintImage={handleGeneralPrintImage}
            onPrintWeb={handleGeneralPrintWeb}
            onPrintUnicode={handleGeneralPrintUnicode}
          />
          <GeneralStandingsStats standings={generalStandings} />
          
          {onRaceUpdate && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Résultats par Course</h2>
              <PointsEditor
                races={[...montagneRaces, ...rallyeRaces]}
                drivers={drivers}
                onRaceUpdate={onRaceUpdate}
              />
            </div>
          )}
        </TabsContent>

        {/* Trophée de la Montagne */}
        <TabsContent value="montagne" className="space-y-6">
          <CategoryHeader 
            displayTitle="Trophée de la Montagne" 
            championshipYear={championshipYear} 
          />
          <RaceCalendar races={montagneRaces} />
          <StandingsTable
            displayTitle="Trophée de la Montagne"
            races={montagneRaces}
            type="montagne"
            standings={toSimplifiedStandings(montagneStandings, 'montagne')}
            onPrintPdf={handleMontagnePrintPdf}
          />
          <PodiumSection standings={toSimplifiedStandings(montagneStandings, 'montagne')} />
          
          {onRaceUpdate && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Résultats par Course Montagne</h2>
              <PointsEditor
                races={montagneRaces}
                drivers={drivers}
                onRaceUpdate={onRaceUpdate}
              />
            </div>
          )}
        </TabsContent>

        {/* Trophée des Rallyes */}
        <TabsContent value="rallye" className="space-y-6">
          <CategoryHeader 
            displayTitle="Trophée des Rallyes" 
            championshipYear={championshipYear} 
          />
          <RaceCalendar races={rallyeRaces} />
          <StandingsTable
            displayTitle="Trophée des Rallyes"
            races={rallyeRaces}
            type="rallye"
            standings={toSimplifiedStandings(rallyeStandings, 'rallye')}
            onPrintPdf={handleRallyePrintPdf}
          />
          <PodiumSection standings={toSimplifiedStandings(rallyeStandings, 'rallye')} />
          
          {onRaceUpdate && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Résultats par Course Rallye</h2>
              <PointsEditor
                races={rallyeRaces}
                drivers={drivers}
                onRaceUpdate={onRaceUpdate}
              />
            </div>
          )}
        </TabsContent>

        {/* Trophée C2 R2 */}
        <TabsContent value="c2r2" className="space-y-6">
          <CategoryHeader 
            displayTitle="Trophée C2 R2" 
            championshipYear={championshipYear} 
          />
          <RaceCalendar races={[...montagneRaces, ...rallyeRaces]} />
          <StandingsTable
            displayTitle="Trophée C2 R2"
            races={[...montagneRaces, ...rallyeRaces]}
            type="c2r2"
            standings={toSimplifiedStandings(c2r2Standings, 'c2r2')}
            onPrintPdf={handleC2R2PrintPdf}
          />
          <PodiumSection standings={toSimplifiedStandings(c2r2Standings, 'c2r2')} />
        </TabsContent>

        {/* Trophée Copilote */}
        <TabsContent value="copilote" className="space-y-6">
          <CategoryHeader 
            displayTitle="Trophée Copilote" 
            championshipYear={championshipYear} 
          />
          <RaceCalendar races={rallyeRaces} />
          <StandingsTable
            displayTitle="Trophée Copilote"
            races={rallyeRaces}
            type="rallye"
            standings={toSimplifiedStandings(copiloteStandings, 'copilote')}
            onPrintPdf={handleCopiPrintPdf}
          />
          <PodiumSection standings={toSimplifiedStandings(copiloteStandings, 'copilote')} />
          
          {onRaceUpdate && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Résultats par Course Rallye</h2>
              <PointsEditor
                races={rallyeRaces}
                drivers={drivers}
                onRaceUpdate={onRaceUpdate}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RallyeMontagneTabs;
