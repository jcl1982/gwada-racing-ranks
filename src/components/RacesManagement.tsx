
import { useState } from 'react';
import { Driver, Race } from '@/types/championship';
import RaceFormDialog from './RaceFormDialog';
import RaceEditDialog from './RaceEditDialog';
import RaceCard from './RaceCard';

interface RacesManagementProps {
  drivers: Driver[];
  montagneRaces: Race[];
  rallyeRaces: Race[];
  kartingRaces: Race[];
  accelerationRaces: Race[];
  championshipId?: string;
  onRacesChange: (montagneRaces: Race[], rallyeRaces: Race[]) => void;
  saveRace: (race: Omit<Race, 'id' | 'results'> | Race) => Promise<void>;
  deleteRace: (raceId: string) => Promise<void>;
}

const RacesManagement = ({ 
  drivers, 
  montagneRaces, 
  rallyeRaces,
  kartingRaces,
  accelerationRaces,
  championshipId,
  onRacesChange, 
  saveRace, 
  deleteRace 
}: RacesManagementProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRace, setEditingRace] = useState<Race | null>(null);

  const allRaces = [...montagneRaces, ...rallyeRaces, ...kartingRaces, ...accelerationRaces];

  const handleAddRace = async (raceData: Omit<Race, 'id' | 'results'>) => {
    console.log('Adding new race:', raceData, 'for championship:', championshipId);
    
    await saveRace({
      ...raceData,
      championshipId,
      results: []
    });
  };

  const handleEditRace = (race: Race) => {
    console.log('✏️ Bouton Modifier cliqué pour la course:', race);
    setEditingRace(race);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRace = async (updatedRace: Race) => {
    if (!editingRace) return;

    console.log('🔄 RacesManagement - handleUpdateRace appelé');
    console.log('Course originale:', editingRace);
    console.log('Course mise à jour:', updatedRace);
    console.log('Championship ID:', championshipId);
    console.log('Date changée:', editingRace.date, '->', updatedRace.date);

    // S'assurer que le championshipId est préservé
    await saveRace({
      ...updatedRace,
      championshipId: updatedRace.championshipId || championshipId
    });
    
    console.log('✅ saveRace terminé');
    setEditingRace(null);
    
    // Forcer un re-render en recréant les tableaux de courses
    const allRaces = [...montagneRaces, ...rallyeRaces];
    const updatedMontagne = allRaces.filter(r => r.type === 'montagne');
    const updatedRallye = allRaces.filter(r => r.type === 'rallye');
    onRacesChange(updatedMontagne, updatedRallye);
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
