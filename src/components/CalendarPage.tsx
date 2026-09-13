import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, FileSpreadsheet, MapPin } from 'lucide-react';
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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

  const normalizeName = (s: string) =>
    s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allRaces = useMemo(() => {
    const seen = new Set<string>();
    return championships.flatMap(c =>
      c.races.map(r => ({ race: r, championshipTitle: c.title }))
    ).filter(({ race }) => {
      const key = `${race.type}|${race.date}|${normalizeName(race.name)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => parseLocalDate(a.race.date).getTime() - parseLocalDate(b.race.date).getTime());
  }, [championships]);

  const initialMonth = useMemo(() => {
    const upcoming = allRaces.find(({ race }) => parseLocalDate(race.endDate || race.date) >= today);
    const reference = upcoming ?? allRaces[allRaces.length - 1];
    return reference ? startOfMonth(parseLocalDate(reference.race.date)) : startOfMonth(today);
  }, [allRaces]);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  const calendarDays = useMemo(() => {
    const first = startOfWeek(startOfMonth(selectedMonth), { weekStartsOn: 1 });
    const last = endOfWeek(endOfMonth(selectedMonth), { weekStartsOn: 1 });
    const days: Date[] = [];
    for (let day = first; day <= last; day = addDays(day, 1)) days.push(day);
    return days;
  }, [selectedMonth]);

  const racesForDay = (day: Date) => allRaces.filter(({ race }) => {
    const start = parseLocalDate(race.date);
    const end = parseLocalDate(race.endDate || race.date);
    return day >= start && day <= end;
  });

  const monthRaceDays = calendarDays.filter(day => isSameMonth(day, selectedMonth) && racesForDay(day).length > 0);

  const eventTone = (type: string) => {
    if (type === 'montagne') return 'border-primary bg-primary/10 text-foreground';
    if (type === 'rallye') return 'border-accent bg-accent/15 text-foreground';
    if (type === 'karting') return 'border-secondary bg-secondary/10 text-foreground';
    return 'border-muted-foreground bg-muted/30 text-foreground';
  };

  const RaceEvent = ({ item, compact = false }: { item: typeof allRaces[number]; compact?: boolean }) => {
    const { race, championshipTitle: champTitle } = item;
    const isPast = parseLocalDate(race.endDate || race.date) < today;
    return (
      <div className={cn('border-l-4 bg-card transition-colors', eventTone(race.type), isPast && 'opacity-60', compact ? 'rounded p-2' : 'rounded-md p-3')}>
        <div className="flex items-start justify-between gap-2">
          <p className={cn('font-semibold leading-tight', compact ? 'text-xs' : 'text-sm')}>{race.name}</p>
          {!compact && <Badge variant={isPast ? 'secondary' : 'default'} className="shrink-0 text-[9px] uppercase">{isPast ? 'Terminée' : 'À venir'}</Badge>}
        </div>
        <p className={cn('mt-1 text-muted-foreground uppercase', compact ? 'line-clamp-1 text-[9px]' : 'text-[10px]')}>{champTitle}</p>
        {!compact && race.organizer && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} />{race.organizer}</p>}
      </div>
    );
  };

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

  return (
    <Card className="card-glass border-t-4 border-primary p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        <div>
          <div className="mb-4 flex items-center justify-between gap-2 border-y border-border py-3">
            <Button variant="outline" size="icon" onClick={() => setSelectedMonth(month => addMonths(month, -1))} aria-label="Mois précédent">
              <ChevronLeft size={18} />
            </Button>
            <div className="text-center">
              <h3 className="font-display text-lg font-bold uppercase sm:text-xl">{format(selectedMonth, 'MMMM yyyy', { locale: fr })}</h3>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setSelectedMonth(startOfMonth(today))}>Aujourd’hui</Button>
            </div>
            <Button variant="outline" size="icon" onClick={() => setSelectedMonth(month => addMonths(month, 1))} aria-label="Mois suivant">
              <ChevronRight size={18} />
            </Button>
          </div>

          <div className="hidden overflow-hidden rounded-md border border-border md:block">
            <div className="grid grid-cols-7 bg-secondary text-secondary-foreground">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => <div key={day} className="py-2 text-center text-xs font-bold uppercase">{day}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map(day => {
                const events = racesForDay(day);
                return (
                  <div key={day.toISOString()} className={cn('min-h-32 border-b border-r border-border p-2', !isSameMonth(day, selectedMonth) && 'bg-muted/20 text-muted-foreground')}>
                    <div className={cn('mb-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold', isSameDay(day, today) && 'bg-primary text-primary-foreground')}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1.5">{events.map(item => <RaceEvent key={`${item.race.id}-${day.toISOString()}`} item={item} compact />)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {monthRaceDays.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Aucune course prévue ce mois-ci.</p>
            ) : monthRaceDays.map(day => (
              <section key={day.toISOString()} className="grid grid-cols-[3.25rem_1fr] gap-3 border-b border-border pb-3">
                <div className={cn('flex h-14 flex-col items-center justify-center rounded-md bg-secondary text-secondary-foreground', isSameDay(day, today) && 'bg-primary text-primary-foreground')}>
                  <span className="text-[10px] font-bold uppercase">{format(day, 'EEE', { locale: fr })}</span>
                  <span className="font-display text-xl font-bold">{format(day, 'd')}</span>
                </div>
                <div className="space-y-2">{racesForDay(day).map(item => <RaceEvent key={`${item.race.id}-${day.toISOString()}`} item={item} />)}</div>
              </section>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default CalendarPage;
