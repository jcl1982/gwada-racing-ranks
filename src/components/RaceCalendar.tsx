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
}

const RaceCalendar = ({ races }: RaceCalendarProps) => {
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
        {races.map(race => (
          <div key={race.id} className="bg-white/70 rounded-lg p-4 border border-white/20">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <MapPin size={16} />
              {race.name}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {formatDateRange(race.date, race.endDate)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RaceCalendar;
