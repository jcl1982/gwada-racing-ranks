import { Card } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';
import { Race } from '@/types/championship';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Parse une date YYYY-MM-DD en Date locale sans décalage de fuseau horaire
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

interface RaceCalendarProps {
  races: Race[];
  driverIds?: string[]; // Liste des IDs de pilotes pour filtrer les courses
}

const RaceCalendar = ({ races, driverIds }: RaceCalendarProps) => {
  // Filtrer les courses pour n'afficher que celles où au moins un pilote de la liste a participé
  const relevantRaces = driverIds 
    ? races.filter(race => {
        return race.results.some(result => 
          driverIds.includes(result.driverId) && result.points > 0
        );
      })
    : races;
  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = format(parseLocalDate(startDate), 'dd MMMM yyyy', { locale: fr });
    if (!endDate) return start;
    const end = format(parseLocalDate(endDate), 'dd MMMM yyyy', { locale: fr });
    return `${start} - ${end}`;
  };

  return (
    <Card className="card-glass p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Calendar size={24} />
        Calendrier des Courses
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        {relevantRaces.map(race => (
          <div key={race.id} className="bg-white/70 rounded-lg p-4 border border-white/20">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <MapPin size={16} />
              {race.name}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {formatDateRange(race.date, race.endDate)}
            </p>
            {race.organizer && (
              <p className="text-sm text-gray-500 mt-1 italic">
                Organisateur : {race.organizer}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RaceCalendar;
