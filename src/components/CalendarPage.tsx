import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileSpreadsheet } from 'lucide-react';
import { exportCalendarToExcel } from '@/utils/excel/excelExport';
import { useAllChampionshipsData } from '@/hooks/useAllChampionshipsData';
import { useUserRole } from '@/hooks/useUserRole';
import AddCalendarRaceDialog from '@/components/AddCalendarRaceDialog';

function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

interface CalendarPageProps {
  championshipYear: string;
}

const CalendarPage = ({ championshipYear }: CalendarPageProps) => {
  const { championships, loading, refetch } = useAllChampionshipsData();
  const { isAdmin } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-muted-foreground">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  const normalizeName = (s: string) =>
    s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const seen = new Set<string>();
  const allRaces = championships.flatMap(c =>
    c.races.map(r => ({ race: r, championshipTitle: c.title }))
  ).filter(({ race }) => {
    const key = `${race.type}|${race.date}|${normalizeName(race.name)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => parseLocalDate(a.race.date).getTime() - parseLocalDate(b.race.date).getTime());

  const upcomingRaces = allRaces.filter(({ race }) => parseLocalDate(race.date) >= today);
  const pastRaces = allRaces.filter(({ race }) => parseLocalDate(race.date) < today);

  const renderRaceCard = ({ race, championshipTitle: champTitle }: typeof allRaces[number]) => {
    const isPast = parseLocalDate(race.date) < today;
    const dateLabel = race.endDate && race.endDate !== race.date
      ? `${parseLocalDate(race.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${parseLocalDate(race.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
      : parseLocalDate(race.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    return (
      <div
        key={`${race.id}-${race.date}`}
        className={`rounded-lg p-4 border-l-4 border-primary bg-card/60 border border-border transition-colors ${isPast ? 'opacity-60' : ''}`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold leading-tight">{race.name}</p>
          <Badge variant={isPast ? 'secondary' : 'default'} className="shrink-0 text-[10px] uppercase">
            {isPast ? 'Terminée' : 'À venir'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
          <Calendar size={14} />
          {dateLabel}
        </p>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{champTitle}</p>
        {race.organizer && (
          <p className="text-xs text-muted-foreground mt-1 italic">Organisateur : {race.organizer}</p>
        )}
      </div>
    );
  };

  return (
    <Card className="card-glass p-6 border-t-4 border-primary">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold flex items-center gap-2 uppercase tracking-wide">
          <Calendar className="text-primary" />
          Calendrier des Courses
        </h2>
        <div className="flex flex-wrap items-center gap-2 no-export no-print">
          <Button
            size="sm"
            variant="outline"
            disabled={allRaces.length === 0}
            onClick={() => exportCalendarToExcel(
              allRaces.map(({ race, championshipTitle: champTitle }) => ({
                name: race.name,
                date: race.date,
                endDate: race.endDate,
                type: race.type,
                organizer: race.organizer,
                championshipTitle: champTitle
              })),
              championshipYear
            )}
          >
            <FileSpreadsheet size={16} className="mr-2" />
            Export Excel
          </Button>
          {isAdmin && (
            <AddCalendarRaceDialog
              championships={championships.map(c => ({ id: c.id, title: c.title }))}
              onCreated={refetch}
            />
          )}
        </div>
      </div>

      {allRaces.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Aucune course programmée pour le moment.</p>
      ) : (
        <div className="space-y-10">
          <section>
            <h3 className="font-display text-lg font-semibold mb-4 uppercase tracking-wide">
              Courses à venir ({upcomingRaces.length})
            </h3>
            {upcomingRaces.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune course à venir.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingRaces.map(renderRaceCard)}
              </div>
            )}
          </section>

          <section>
            <h3 className="font-display text-lg font-semibold mb-4 uppercase tracking-wide">
              Courses terminées ({pastRaces.length})
            </h3>
            {pastRaces.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune course terminée.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastRaces.map(renderRaceCard)}
              </div>
            )}
          </section>
        </div>
      )}
    </Card>
  );
};

export default CalendarPage;
