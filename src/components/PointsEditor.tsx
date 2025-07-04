
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Save, X, Trophy, Mountain, Car } from 'lucide-react';
import { Driver, Race, RaceResult } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';

interface PointsEditorProps {
  drivers: Driver[];
  montagneRaces: Race[];
  rallyeRaces: Race[];
  onRaceUpdate: (raceId: string, results: RaceResult[]) => Promise<void>;
}

const PointsEditor = ({ drivers, montagneRaces, rallyeRaces, onRaceUpdate }: PointsEditorProps) => {
  const [editingRace, setEditingRace] = useState<string | null>(null);
  const [editingResults, setEditingResults] = useState<RaceResult[]>([]);
  const { toast } = useToast();

  const handleEditRace = (race: Race) => {
    setEditingRace(race.id);
    setEditingResults([...race.results]);
  };

  const handleCancelEdit = () => {
    setEditingRace(null);
    setEditingResults([]);
  };

  const handleSaveEdit = async (race: Race) => {
    try {
      await onRaceUpdate(race.id, editingResults);
      setEditingRace(null);
      setEditingResults([]);
      toast({
        title: "Points mis à jour",
        description: `Les points de la course "${race.name}" ont été mis à jour avec succès.`,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des points:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les points.",
        variant: "destructive"
      });
    }
  };

  const handlePointsChange = (driverId: string, newPoints: number) => {
    setEditingResults(prev => {
      const existing = prev.find(r => r.driverId === driverId);
      if (existing) {
        return prev.map(r => 
          r.driverId === driverId 
            ? { ...r, points: newPoints }
            : r
        );
      } else {
        // Créer un nouveau résultat si le pilote n'a pas de résultat pour cette course
        return [...prev, {
          driverId,
          position: prev.length + 1,
          points: newPoints
        }];
      }
    });
  };

  const handlePositionChange = (driverId: string, newPosition: number) => {
    setEditingResults(prev => 
      prev.map(r => 
        r.driverId === driverId 
          ? { ...r, position: newPosition }
          : r
      )
    );
  };

  const renderRaceTable = (races: Race[], type: 'montagne' | 'rallye') => {
    const Icon = type === 'montagne' ? Mountain : Car;
    const colorClass = type === 'montagne' ? 'text-green-600' : 'text-blue-600';

    return (
      <div className="space-y-4">
        {races.map(race => {
          const isEditing = editingRace === race.id;
          const resultsToShow = isEditing ? editingResults : race.results;

          return (
            <Card key={race.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${colorClass}`} />
                  <h3 className="text-lg font-semibold">{race.name}</h3>
                  <Badge variant="outline">{new Date(race.date).toLocaleDateString('fr-FR')}</Badge>
                </div>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditRace(race)}
                    className="flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(race)}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Sauvegarder
                    </Button>
                  </div>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pilote</TableHead>
                    <TableHead className="text-center">Position</TableHead>
                    <TableHead className="text-center">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map(driver => {
                    const result = resultsToShow.find(r => r.driverId === driver.id);
                    return (
                      <TableRow key={driver.id}>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell className="text-center">
                          {isEditing ? (
                            <Input
                              type="number"
                              min="1"
                              value={result?.position || ''}
                              onChange={(e) => handlePositionChange(driver.id, parseInt(e.target.value) || 0)}
                              className="w-20 text-center"
                            />
                          ) : (
                            result?.position || '-'
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              value={result?.points || ''}
                              onChange={(e) => handlePointsChange(driver.id, parseInt(e.target.value) || 0)}
                              className="w-20 text-center"
                            />
                          ) : (
                            <Badge variant={result?.points ? "default" : "secondary"}>
                              {result?.points || 0} pts
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-600" />
        <h2 className="text-2xl font-bold">Édition des Points</h2>
      </div>

      <Tabs defaultValue="montagne" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="montagne" className="flex items-center gap-2">
            <Mountain className="w-4 h-4" />
            Courses de Montagne
          </TabsTrigger>
          <TabsTrigger value="rallye" className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            Courses de Rallye
          </TabsTrigger>
        </TabsList>

        <TabsContent value="montagne" className="mt-6">
          {montagneRaces.length > 0 ? (
            renderRaceTable(montagneRaces, 'montagne')
          ) : (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Aucune course de montagne disponible</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rallye" className="mt-6">
          {rallyeRaces.length > 0 ? (
            renderRaceTable(rallyeRaces, 'rallye')
          ) : (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Aucune course de rallye disponible</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PointsEditor;
