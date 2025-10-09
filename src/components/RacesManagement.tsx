
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
  saveRace: (race: Omit<Race, 'id' | 'results'> | Race) => Promise<void>;
  deleteRace: (raceId: string) => Promise<void>;
}

const RacesManagement = ({ 
  drivers, 
  montagneRaces, 
  rallyeRaces, 
  onRacesChange, 
  saveRace, 
  deleteRace 
}: RacesManagementProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRace, setEditingRace] = useState<Race | null>(null);

  const allRaces = [...montagneRaces, ...rallyeRaces];

  const handleAddRace = async (raceData: Omit<Race, 'id' | 'results'>) => {
    console.log('Adding new race:', raceData);
    
    await saveRace({
      ...raceData,
      results: []
    });
  };

  const handleEditRace = (race: Race) => {
    console.log('✏️ Bouton Modifier cliqué pour la course:', race);
    setEditingRace(race);
    setIsEditDialogOpen(true);
    console.log('📂 État après clic:', { isEditDialogOpen: true, editingRaceId: race.id });
  };

  const handleUpdateRace = async (updatedRace: Race) => {
    if (!editingRace) return;

    console.log('🔄 handleUpdateRace appelé');
    console.log('Course originale:', editingRace);
    console.log('Course mise à jour:', updatedRace);
    console.log('Différences:', {
      name: editingRace.name !== updatedRace.name,
      date: editingRace.date !== updatedRace.date,
      endDate: editingRace.endDate !== updatedRace.endDate,
      type: editingRace.type !== updatedRace.type
    });

    await saveRace(updatedRace);
    setEditingRace(null);
  };

  const handleDeleteRace = async (raceId: string) => {
    console.log('Deleting race with id:', raceId);
    await deleteRace(raceId);
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
