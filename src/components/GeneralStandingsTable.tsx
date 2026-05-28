import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Mountain, Car } from "lucide-react";
import { ChampionshipStanding } from "@/types/championship";
import { getPositionBadgeColor } from "@/utils/championship";
import PrintButton from "@/components/PrintButton";
import Logo from "@/components/Logo";
interface GeneralStandingsTableProps {
  standings: ChampionshipStanding[];
  championshipTitle: string;
  championshipYear: string;
  onPrintPdf: () => void;
  onPrintImage: () => void;
  onPrintWeb: () => void;
  onPrintUnicode: () => void;
  onPrintExcel: () => void;
}
const GeneralStandingsTable = ({
  standings,
  championshipTitle,
  championshipYear,
  onPrintPdf,
  onPrintImage,
  onPrintWeb,
  onPrintUnicode,
  onPrintExcel,
}: GeneralStandingsTableProps) => {
  return (
    <Card className="card-glass overflow-hidden" id="general-standings-table">
      <div className="gradient-ocean p-3 sm:p-6 text-white relative">
        {/* Logo de la ligue (haut gauche) */}
        <Logo
          src="/images/lsag-logo.jpg"
          alt="Logo Ligue Sport Automobile Guadeloupe"
          className="absolute top-2 left-2 sm:top-4 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 object-contain"
          removeBackground={false}
        />

        {/* Logo de la fédération (haut droite) */}
        <Logo
          src="/lovable-uploads/b4f87f86-04ce-4966-aca2-cd5ab7745508.png"
          alt="Logo FFSA"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 object-contain"
          removeBackground={false}
        />

        <div className="flex items-center justify-center px-12 sm:px-20">
          <div className="flex items-center gap-2 sm:gap-3">
            <Trophy className="w-5 h-5 sm:w-8 sm:h-8 shrink-0" />
            <h2 className="text-sm sm:text-2xl font-bold text-center leading-tight">Classement Général - Pilote</h2>
          </div>
        </div>

        <div className="absolute bottom-1 right-1 sm:top-6 sm:right-20 sm:bottom-auto">
          <PrintButton
            onPrintPdf={onPrintPdf}
            onPrintImage={onPrintImage}
            onPrintWeb={onPrintWeb}
            onPrintUnicode={onPrintUnicode}
            onPrintExcel={onPrintExcel}
            variant="outline"
            className="bg-white/20 hover:bg-white/30 border-white/30 no-print h-7 sm:h-9 text-[10px] sm:text-sm px-2 sm:px-3"
            adminOnly={true}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px] sm:text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left py-1 px-1 font-semibold">Pos</th>
              <th className="text-left py-1 px-1 font-semibold">Pilote</th>
              <th className="text-center py-1 px-1 font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <Mountain className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Montagne</span>
                  <span className="sm:hidden">Mtg</span>
                </div>
              </th>
              <th className="text-center py-1 px-1 font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <Car className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Rallye</span>
                  <span className="sm:hidden">Ral</span>
                </div>
              </th>
              <th className="text-center py-1 px-1 font-semibold">Total</th>
              <th className="text-center py-1 px-1 font-semibold">Écart</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => {
              const leaderPoints = standings[0]?.totalPoints || 0;
              const gap = leaderPoints - standing.totalPoints;
              return (
              <tr
                key={standing.driver.id}
                className={`border-b transition-colors table-row-hover ${index % 2 === 0 ? "table-row-even" : "table-row-odd"} ${standing.position === 1 ? "champion-row" : ""}`}
              >
                <td className="py-1 px-1">
                  <Badge className={`${getPositionBadgeColor(standing.position)} font-bold`}>{standing.position}</Badge>
                </td>
                <td className="py-1 px-1">
                  <div className="font-semibold text-foreground unicode-enhanced">{standing.driver.name}</div>
                </td>
                <td className="py-1 px-1 text-center">
                  <Badge variant="outline" className="bg-green-50 border-green-200">
                    {standing.montagnePoints} pts
                  </Badge>
                </td>
                <td className="py-1 px-1 text-center">
                  <Badge variant="outline" className="bg-blue-50 border-blue-200">
                    {standing.rallyePoints} pts
                  </Badge>
                </td>
                <td className="py-1 px-1 text-center">
                  <Badge className="bg-slate-400 hover:bg-slate-500 text-white font-bold">
                    {standing.totalPoints} pts
                  </Badge>
                </td>
                <td className="py-1 px-1 text-center">
                  <Badge variant="outline" className={`${gap === 0 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {gap === 0 ? '—' : `-${gap}`}
                  </Badge>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      {/* Pied de page avec texte d'affiliation */}
      <div className="bg-muted px-4 py-3 border-t">
        <div className="text-center text-xs text-muted-foreground leading-relaxed">
          <div className="font-semibold">Affilié à la Fédération Française du Sport Automobile sous le code 21</div>
          <div>Déclaré au J.O N°Y0046 DU 15/11/2014 sous le n°01987</div>
          <div>Agréée par le Ministère de la Ville, de la Jeunesse et des Sports sous Je N° RNA: W9G2003313</div>
        </div>
      </div>
    </Card>
  );
};
export default GeneralStandingsTable;
