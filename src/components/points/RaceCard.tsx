import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Save, X, Mountain, Car } from 'lucide-react';
import { Driver, Race, RaceResult } from '@/types/championship';
import { useToast } from '@/hooks/use-toast';
import DriverResultRow from './DriverResultRow';

// Parse une date YYYY-MM-DD en Date locale sans décalage de fuseau horaire
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

interface RaceCardProps {
  race: Race;
  drivers: Driver[];
  onRaceUpdate: (raceId: string, results: RaceResult[]) => Promise<void>;
}

const RaceCard = ({ race, drivers, onRaceUpdate }: RaceCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingResults, setEditingResults] = useState<RaceResult[]>([]);
  const { toast } = useToast();

  const handleEditRace = () => {
    setIsEditing(true);
    setEditingResults([...race.results]);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingResults([]);
  };

  const handleSaveEdit = async () => {
    try {
      await onRaceUpdate(race.id, editingResults);
      setIsEditing(false);
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

  const handleCarModelChange = (driverId: string, newCarModel: string) => {
    setEditingResults(prev => {
      const existing = prev.find(r => r.driverId === driverId);
      if (existing) {
        return prev.map(r => 
          r.driverId === driverId 
            ? { ...r, carModel: newCarModel }
            : r
        );
      } else {
        return [...prev, {
          driverId,
          position: prev.length + 1,
          points: 0,
          carModel: newCarModel
        }];
      }
    });
  };

  const handleCategoryChange = (driverId: string, newCategory: string) => {
    setEditingResults(prev => {
      const existing = prev.find(r => r.driverId === driverId);
      if (existing) {
        return prev.map(r => 
          r.driverId === driverId 
            ? { ...r, category: newCategory }
            : r
        );
      } else {
        return [...prev, {
          driverId,
          position: prev.length + 1,
          points: 0,
          category: newCategory
        }];
      }
    });
  };

  const handleBonusChange = (driverId: string, newBonus: number) => {
    setEditingResults(prev => {
      const existing = prev.find(r => r.driverId === driverId);
      if (existing) {
        return prev.map(r => 
          r.driverId === driverId 
            ? { ...r, bonus: newBonus }
            : r
        );
      } else {
        return [...prev, {
          driverId,
          position: prev.length + 1,
          points: 0,
          bonus: newBonus
        }];
      }
    });
  };

  const resultsToShow = isEditing ? editingResults : race.results;
  const Icon = race.type === 'montagne' ? Mountain : Car;
  const colorClass = race.type === 'montagne' ? 'text-green-600' : 'text-blue-600';
  const isKarting = race.type === 'karting';

  // Trier les pilotes par position dans la course
  const sortedDrivers = [...drivers].sort((a, b) => {
    const resultA = resultsToShow.find(r => r.driverId === a.id);
    const resultB = resultsToShow.find(r => r.driverId === b.id);
    
    // Si les deux ont des résultats, trier par position
    if (resultA && resultB) {
      return resultA.position - resultB.position;
    }
    // Si seul A a un résultat, A vient en premier
    if (resultA) return -1;
    // Si seul B a un résultat, B vient en premier
    if (resultB) return 1;
    // Si aucun n'a de résultat, trier par nom
    return a.name.localeCompare(b.name);
  });

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${colorClass}`} />
          <h3 className="text-lg font-semibold">{race.name}</h3>
          <Badge variant="outline">{parseLocalDate(race.date).toLocaleDateString('fr-FR')}</Badge>
        </div>
        {!isKarting && (
          <>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditRace}
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
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pilote</TableHead>
            <TableHead className="text-center">Position</TableHead>
            {isKarting && <TableHead className="text-center">Catégorie</TableHead>}
            {isKarting && <TableHead className="text-center">Bonus</TableHead>}
            <TableHead className="text-center">Points</TableHead>
            {!isKarting && <TableHead className="text-center">Modèle de voiture</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDrivers.map(driver => (
            <DriverResultRow
              key={driver.id}
              driver={driver}
              result={resultsToShow.find(r => r.driverId === driver.id)}
              isEditing={isEditing}
              onPointsChange={handlePointsChange}
              onPositionChange={handlePositionChange}
              onCarModelChange={handleCarModelChange}
              onCategoryChange={handleCategoryChange}
              onBonusChange={handleBonusChange}
              showCategory={isKarting}
              showBonus={isKarting}
              showCarModel={!isKarting}
            />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default RaceCard;
