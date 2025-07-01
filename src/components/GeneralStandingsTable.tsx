
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
  return (
    <Card className="card-glass overflow-hidden" id="general-standings-table">
      <div className="gradient-ocean p-6 text-white relative">
        {/* Logo de la ligue (haut gauche) */}
        <Logo 
          src="/lovable-uploads/9fcde9f0-2732-40e7-a37d-2bf3981cefaf.png" 
          alt="Logo Ligue" 
          className="absolute top-4 left-4 w-12 h-12 object-contain"
          removeBackground={true}
        />
        
        {/* Logo de la fédération (haut droite) */}
        <Logo 
          src="/lovable-uploads/1bf8922d-c9c0-423c-93bd-29ddb120e512.png" 
          alt="Logo Fédération" 
          className="absolute top-4 right-20 w-12 h-12 object-contain"
          removeBackground={true}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 ml-16">
            <Trophy size={32} />
            <h2 className="text-2xl font-bold">Classement Général</h2>
          </div>
          <PrintButton 
            onPrintPdf={onPrintPdf} 
            onPrintImage={onPrintImage}
            onPrintWeb={onPrintWeb}
            onPrintUnicode={onPrintUnicode}
            variant="outline" 
            className="bg-white/20 hover:bg-white/30 border-white/30 no-print" 
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 font-semibold">Position</th>
              <th className="text-left p-2 font-semibold">Évolution</th>
              <th className="text-left p-2 font-semibold">Pilote</th>
              <th className="text-center p-2 font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <Mountain size={16} />
                  <span>Montagne</span>
                </div>
              </th>
              <th className="text-center p-2 font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <Car size={16} />
                  <span>Rallye</span>
                </div>
              </th>
              <th className="text-center p-2 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => (
              <tr
                key={standing.driver.id}
                className={`border-b transition-colors hover:bg-blue-50/50 ${
                  index % 2 === 0 ? 'bg-white/50' : 'bg-white/30'
                } ${standing.position === 1 ? 'champion-row' : ''}`}
              >
                <td className="p-2">
                  <Badge className={`${getPositionBadgeColor(standing.position)} font-bold`}>
                    {standing.position}
                  </Badge>
                </td>
                <td className="p-2">
                  <PositionChange change={standing.positionChange} />
                </td>
                <td className="p-2">
                  <div className="font-semibold text-gray-900 unicode-enhanced">
                    {standing.driver.name}
                  </div>
                </td>
                <td className="p-2 text-center">
                  <Badge variant="outline" className="bg-green-50 border-green-200">
                    {standing.montagnePoints} pts
                  </Badge>
                </td>
                <td className="p-2 text-center">
                  <Badge variant="outline" className="bg-blue-50 border-blue-200">
                    {standing.rallyePoints} pts
                  </Badge>
                </td>
                <td className="p-2 text-center">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold">
                    {standing.totalPoints} pts
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default GeneralStandingsTable;
