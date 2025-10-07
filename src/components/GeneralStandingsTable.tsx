import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Mountain, Car } from 'lucide-react';
import { ChampionshipStanding } from '@/types/championship';
import { getPositionBadgeColor } from '@/utils/championship';
import PositionChange from '@/components/PositionChange';
import PrintButton from '@/components/PrintButton';
import Logo from '@/components/Logo';
interface GeneralStandingsTableProps {
  standings: ChampionshipStanding[];
  championshipTitle: string;
  championshipYear: string;
  onPrintPdf: () => void;
  onPrintImage: () => void;
  onPrintWeb: () => void;
  onPrintUnicode: () => void;
}
const GeneralStandingsTable = ({
  standings,
  championshipTitle,
  championshipYear,
  onPrintPdf,
  onPrintImage,
  onPrintWeb,
  onPrintUnicode
}: GeneralStandingsTableProps) => {
  return <Card className="card-glass overflow-hidden" id="general-standings-table">
      <div className="gradient-ocean p-6 text-white relative">
        {/* Logo de la ligue (haut gauche) */}
        <Logo src="/lovable-uploads/a51e24a3-77b9-4a08-a1b1-c446ea39eb10.png" alt="Logo Ligue Sport Automobile Guadeloupe" className="absolute top-4 left-4 w-12 h-12 object-contain" removeBackground={false} />
        
        {/* Logo de la fédération (haut droite) */}
        <Logo src="/lovable-uploads/b4f87f86-04ce-4966-aca2-cd5ab7745508.png" alt="Logo FFSA" className="absolute top-4 right-4 w-12 h-12 object-contain" removeBackground={false} />

        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Trophy size={32} />
            <h2 className="text-2xl font-bold mx-0 text-center px-0">Classement Général de la LSAG 
Pilote</h2>
          </div>
        </div>
        
        <div className="absolute top-6 right-20">
          <PrintButton onPrintPdf={onPrintPdf} onPrintImage={onPrintImage} onPrintWeb={onPrintWeb} onPrintUnicode={onPrintUnicode} variant="outline" className="bg-white/20 hover:bg-white/30 border-white/30 no-print" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-1 px-1 font-semibold">Position</th>
              <th className="text-left py-1 px-1 font-semibold">Évolution</th>
              <th className="text-left py-1 px-1 font-semibold">Pilote</th>
              <th className="text-center py-1 px-1 font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <Mountain size={16} />
                  <span>Montagne</span>
                </div>
              </th>
              <th className="text-center py-1 px-1 font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <Car size={16} />
                  <span>Rallye</span>
                </div>
              </th>
              <th className="text-center py-1 px-1 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => <tr key={standing.driver.id} className={`border-b transition-colors hover:bg-blue-50/50 ${index % 2 === 0 ? 'bg-white/50' : 'bg-white/30'} ${standing.position === 1 ? 'champion-row' : ''}`}>
                <td className="py-1 px-1">
                  <Badge className={`${getPositionBadgeColor(standing.position)} font-bold`}>
                    {standing.position}
                  </Badge>
                </td>
                <td className="py-1 px-1">
                  <PositionChange change={standing.positionChange} />
                </td>
                <td className="py-1 px-1">
                  <div className="font-semibold text-gray-900 unicode-enhanced">
                    {standing.driver.name}
                  </div>
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
              </tr>)}
          </tbody>
        </table>
      </div>

      {/* Pied de page avec texte d'affiliation */}
      <div className="bg-gray-50 px-4 py-3 border-t">
        <div className="text-center text-xs text-gray-600 leading-relaxed">
          <div className="font-semibold">Affilié à la Fédération Française du Sport Automobile sous le code 21</div>
          <div>Déclaré au J.O N°Y0046 DU 15/11/2014 sous le n°01987</div>
          <div>Agréée par le Ministère de la Ville, de la Jeunesse et des Sports sous Je N° RNA: W9G2003313</div>
        </div>
      </div>
    </Card>;
};
export default GeneralStandingsTable;