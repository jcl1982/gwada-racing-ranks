
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Trophy, BarChart3, Trash2 } from 'lucide-react';
import { Driver, Race, ChampionshipStanding } from '@/types/championship';
import DriversManagement from './DriversManagement';
import RacesManagement from './RacesManagement';
import AdminStats from './AdminStats';

interface AdminPanelProps {
  drivers: Driver[];
  montagneRaces: Race[];
  rallyeRaces: Race[];
  standings: ChampionshipStanding[];
  onDriversChange: (drivers: Driver[]) => void;
  onRacesChange: (montagneRaces: Race[], rallyeRaces: Race[]) => void;
  onReset: () => void;
}

const AdminPanel = ({
  drivers,
  montagneRaces,
  rallyeRaces,
  standings,
  onDriversChange,
  onRacesChange,
  onReset
}: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState('drivers');

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="drivers" className="flex items-center gap-2">
              <Users size={16} />
              Pilotes
            </TabsTrigger>
            <TabsTrigger value="races" className="flex items-center gap-2">
              <Trophy size={16} />
              Courses
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 size={16} />
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drivers" className="mt-6">
            <DriversManagement
              drivers={drivers}
              onDriversChange={onDriversChange}
            />
          </TabsContent>

          <TabsContent value="races" className="mt-6">
            <RacesManagement
              drivers={drivers}
              montagneRaces={montagneRaces}
              rallyeRaces={rallyeRaces}
              onRacesChange={onRacesChange}
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
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminPanel;
