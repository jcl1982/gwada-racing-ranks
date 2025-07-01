
import { Card } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';
import { Race } from '@/types/championship';

interface RaceCalendarProps {
  races: Race[];
}

const RaceCalendar = ({ races }: RaceCalendarProps) => {
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
            <p className="text-gray-600">
              {new Date(race.date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RaceCalendar;
