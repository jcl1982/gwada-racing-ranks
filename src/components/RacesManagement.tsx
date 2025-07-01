
import { useState } from 'react';
import { Driver, Race } from '@/types/championship';
import RaceFormDialog from './RaceFormDialog';
import RaceEditDialog from './RaceEditDialog';
import RaceCard from './RaceCard';

interface RacesManagementProps {
  drivers: Driver[];
  montagneRaces: Race[];
  rallyeRaces: Race[];
  onRacesChange: (montagneRaces: Race[], rallyeRaces: Race[]) => void;
}

const RacesManagement = ({ drivers, montagneRaces, rallyeRaces, onRacesChange }: RacesManagementProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRace, setEditingRace] = useState<Race | null>(null);

  const allRaces = [...montagneRaces, ...rallyeRaces];

  const handleAddRace = (raceData: Omit<Race, 'id' | 'results'>) => {
    const newRace: Race = {
      id: Date.now().toString(),
      ...raceData,
      results: []
    };
    
    console.log('Adding new race:', newRace);
    
    if (raceData.type === 'montagne') {
      onRacesChange([...montagneRaces, newRace], rallyeRaces);
    } else {
      onRacesChange(montagneRaces, [...rallyeRaces, newRace]);
    }
  };

  const handleEditRace = (race: Race) => {
    console.log('Editing race:', race);
    setEditingRace(race);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRace = (updatedRace: Race) => {
    if (!editingRace) return;

    console.log('Updating race from:', editingRace);
    console.log('Updating race to:', updatedRace);

    // Copier les listes existantes
    let updatedMontagneRaces = [...montagneRaces];
    let updatedRallyeRaces = [...rallyeRaces];

    // Si le type de la course a changé, on doit la déplacer
    if (editingRace.type !== updatedRace.type) {
      console.log('Race type changed, moving between lists');
      // Supprimer de l'ancienne liste
      if (editingRace.type === 'montagne') {
        updatedMontagneRaces = montagneRaces.filter(race => race.id !== editingRace.id);
        updatedRallyeRaces.push(updatedRace);
      } else {
        updatedRallyeRaces = rallyeRaces.filter(race => race.id !== editingRace.id);
        updatedMontagneRaces.push(updatedRace);
      }
    } else {
      console.log('Race type unchanged, updating in same list');
      // Le type n'a pas changé, on met juste à jour dans la liste appropriée
      if (updatedRace.type === 'montagne') {
        const raceIndex = updatedMontagneRaces.findIndex(race => race.id === editingRace.id);
        if (raceIndex !== -1) {
          updatedMontagneRaces[raceIndex] = updatedRace;
        }
      } else {
        const raceIndex = updatedRallyeRaces.findIndex(race => race.id === editingRace.id);
        if (raceIndex !== -1) {
          updatedRallyeRaces[raceIndex] = updatedRace;
        }
      }
    }

    console.log('Final montagne races:', updatedMontagneRaces);
    console.log('Final rallye races:', updatedRallyeRaces);

    onRacesChange(updatedMontagneRaces, updatedRallyeRaces);
    setEditingRace(null);
  };

  const handleDeleteRace = (raceId: string) => {
    console.log('Deleting race with id:', raceId);
    const updatedMontagneRaces = montagneRaces.filter(race => race.id !== raceId);
    const updatedRallyeRaces = rallyeRaces.filter(race => race.id !== raceId);
    onRacesChange(updatedMontagneRaces, updatedRallyeRaces);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestion des Courses</h2>
        <RaceFormDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAddRace={handleAddRace}
        />
      </div>

      <RaceEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingRace={editingRace}
        onUpdateRace={handleUpdateRace}
      />

      <div className="grid gap-4">
        {allRaces.map((race) => (
          <RaceCard
            key={race.id}
            race={race}
            onEdit={handleEditRace}
            onDelete={handleDeleteRace}
          />
        ))}
      </div>
    </div>
  );
};

export default RacesManagement;
