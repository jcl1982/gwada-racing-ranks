
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Trophy, BarChart3, Trash2, Settings, Edit } from 'lucide-react';
import { Driver, Race, ChampionshipStanding, RaceResult } from '@/types/championship';
import DriversManagement from './DriversManagement';
import RacesManagement from './RacesManagement';
import AdminStats from './AdminStats';
import ChampionshipSettings from './ChampionshipSettings';
import PointsEditor from './PointsEditor';

interface AdminPanelProps {
  drivers: Driver[];
  montagneRaces: Race[];
  rallyeRaces: Race[];
  standings: ChampionshipStanding[];
  championshipTitle: string;
  championshipYear: string;
  onDriversChange: (drivers: Driver[]) => void;
  onRacesChange: (montagneRaces: Race[], rallyeRaces: Race[]) => void;
  onReset: () => void;
  onTitleChange: (title: string, year: string) => void;
  saveDriver: (driver: Omit<Driver, 'id'> | Driver) => Promise<void>;
  deleteDriver: (driverId: string) => Promise<void>;
  saveRace: (race: Omit<Race, 'id' | 'results'> | Race) => Promise<void>;
  deleteRace: (raceId: string) => Promise<void>;
}

const AdminPanel = ({
  drivers,
  montagneRaces,
  rallyeRaces,
  standings,
  championshipTitle,
  championshipYear,
  onDriversChange,
  onRacesChange,
  onReset,
  onTitleChange,
  saveDriver,
  deleteDriver,
  saveRace,
  deleteRace
}: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState('drivers');

  const handleRaceUpdate = async (raceId: string, results: RaceResult[]) => {
    // Trouver la course à mettre à jour
    const allRaces = [...montagneRaces, ...rallyeRaces];
    const raceToUpdate = allRaces.find(race => race.id === raceId);
    
    if (!raceToUpdate) {
      throw new Error('Course introuvable');
    }

    // Créer une nouvelle course avec les résultats mis à jour
    const updatedRace: Race = {
      ...raceToUpdate,
      results
    };

    // Sauvegarder la course mise à jour
    await saveRace(updatedRace);
  };

  return (
    <div className="space-y-6">
      <Card className="card-glass p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold gradient-text">Administration</h1>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 size={18} />
                Réinitialiser
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la réinitialisation</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action supprimera tous les pilotes et courses. Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={onReset} className="bg-red-600 hover:bg-red-700">
                  Réinitialiser
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="drivers" className="flex items-center gap-2">
              <Users size={16} />
              Pilotes
            </TabsTrigger>
            <TabsTrigger value="races" className="flex items-center gap-2">
              <Trophy size={16} />
              Courses
            </TabsTrigger>
            <TabsTrigger value="points" className="flex items-center gap-2">
              <Edit size={16} />
              Points
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 size={16} />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings size={16} />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drivers" className="mt-6">
            <DriversManagement
              drivers={drivers}
              onDriversChange={onDriversChange}
              saveDriver={saveDriver}
              deleteDriver={deleteDriver}
            />
          </TabsContent>

          <TabsContent value="races" className="mt-6">
            <RacesManagement
              drivers={drivers}
              montagneRaces={montagneRaces}
              rallyeRaces={rallyeRaces}
              onRacesChange={onRacesChange}
              saveRace={saveRace}
              deleteRace={deleteRace}
            />
          </TabsContent>

          <TabsContent value="points" className="mt-6">
            <PointsEditor
              drivers={drivers}
              montagneRaces={montagneRaces}
              rallyeRaces={rallyeRaces}
              onRaceUpdate={handleRaceUpdate}
            />
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <AdminStats
              drivers={drivers}
              montagneRaces={montagneRaces}
              rallyeRaces={rallyeRaces}
              standings={standings}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <ChampionshipSettings
              championshipTitle={championshipTitle}
              championshipYear={championshipYear}
              onTitleChange={onTitleChange}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminPanel;
