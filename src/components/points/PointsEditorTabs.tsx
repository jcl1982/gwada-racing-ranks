
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mountain, Car, Trophy } from 'lucide-react';
import { Driver, Race, RaceResult } from '@/types/championship';
import RaceTypeTab from './RaceTypeTab';
import { useMemo } from 'react';

interface PointsEditorTabsProps {
  drivers: Driver[];
  races: Race[];
  onRaceUpdate: (raceId: string, results: RaceResult[]) => Promise<void>;
}

const PointsEditorTabs = ({
  drivers,
  races,
  onRaceUpdate
}: PointsEditorTabsProps) => {
  // Grouper les courses par type
  const racesByType = useMemo(() => {
    const grouped: Record<string, Race[]> = {};
    races.forEach(race => {
      if (!grouped[race.type]) {
        grouped[race.type] = [];
      }
      grouped[race.type].push(race);
    });
    
    // Trier chaque groupe par date
    Object.keys(grouped).forEach(type => {
      grouped[type].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });
    
    return grouped;
  }, [races]);

  const raceTypes = Object.keys(racesByType);

  // Configuration des icônes et labels par type
  const typeConfig: Record<string, { icon: typeof Trophy, label: string }> = {
    montagne: { icon: Mountain, label: 'Courses de Montagne' },
    rallye: { icon: Car, label: 'Courses de Rallye' },
    karting: { icon: Trophy, label: 'Courses de Karting' },
    acceleration: { icon: Trophy, label: 'Courses d\'Accélération' }
  };

  if (raceTypes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune course disponible. Ajoutez des courses pour gérer les points.
      </div>
    );
  }

  return (
    <Tabs defaultValue={raceTypes[0]} className="w-full">
      <TabsList className={`grid w-full grid-cols-${raceTypes.length}`}>
        {raceTypes.map(type => {
          const config = typeConfig[type] || { icon: Trophy, label: type };
          const Icon = config.icon;
          return (
            <TabsTrigger key={type} value={type} className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {config.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {raceTypes.map(type => (
        <TabsContent key={type} value={type} className="mt-6">
          <RaceTypeTab
            races={racesByType[type]}
            drivers={drivers}
            raceType={type}
            onRaceUpdate={onRaceUpdate}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default PointsEditorTabs;
