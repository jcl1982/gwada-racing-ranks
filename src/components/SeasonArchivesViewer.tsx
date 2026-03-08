
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Archive, Calendar, Users, Trophy, Trash2, ChevronDown, ChevronUp, FileSpreadsheet, FileText, Mountain, Car, Award, Medal } from 'lucide-react';
import { useSeasonArchives, SeasonArchive } from '@/hooks/useSeasonArchives';
import { useUserRole } from '@/hooks/useUserRole';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getPositionBadgeColor } from '@/utils/championship';
import { addLogosToDoc, addTitleToDoc } from '@/utils/pdfLogos';
import { PDF_STYLES, getPositionRowStyle } from '@/utils/pdfStyles';

function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: any; gradient: string }> = {
  general: { label: 'Général', icon: Trophy, gradient: 'from-yellow-400 to-yellow-600' },
  montagne: { label: 'Montagne', icon: Mountain, gradient: 'from-green-600 to-emerald-600' },
  rallye: { label: 'Rallye', icon: Car, gradient: 'from-blue-600 to-cyan-600' },
  r2: { label: 'R2', icon: Award, gradient: 'from-orange-600 to-red-600' },
  copilote: { label: 'Copilote', icon: Users, gradient: 'from-purple-600 to-pink-600' },
};

const ArchiveStandingsTable = ({ standings, activeTab, races }: { standings: any[]; activeTab: string; races: any[] }) => {
  if (!standings || standings.length === 0) return null;

  const isCopilote = activeTab === 'copilote';
  const isGeneral = activeTab === 'general';

  // Collect all race names from standings racePoints to know which columns to show
  const raceNamesSet = new Set<string>();
  standings.forEach((s: any) => {
    if (s.racePoints) {
      Object.keys(s.racePoints).forEach(name => raceNamesSet.add(name));
    }
  });

  // Get race details for the relevant races (match by name)
  const relevantRaces = races
    .filter((r: any) => raceNamesSet.has(r.name))
    .sort((a: any, b: any) => a.date.localeCompare(b.date));

  const config = CATEGORY_CONFIG[activeTab] || CATEGORY_CONFIG.general;
  const Icon = config.icon;

  return (
    <Card className="card-glass overflow-hidden">
      <div className={`bg-gradient-to-r ${config.gradient} p-4 text-white`}>
        <div className="flex items-center justify-center gap-3">
          <Icon size={24} />
          <h3 className="font-bold text-xl">{config.label}</h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-2 px-2 font-semibold">Pos</th>
              <th className="text-left py-2 px-2 font-semibold">Pilote</th>
              {!isCopilote && <th className="text-left py-2 px-2 font-semibold">Véhicule</th>}
              {isGeneral && (
                <>
                  <th className="text-center py-2 px-2 font-semibold">Montagne</th>
                  <th className="text-center py-2 px-2 font-semibold">Rallye</th>
                </>
              )}
              {!isGeneral && relevantRaces.map((race: any, i: number) => (
                <th key={i} className="text-center py-1 px-1 font-semibold min-w-[80px]">
                  <div className="text-xs">{race.name}</div>
                  <div className="text-[10px] text-muted-foreground font-normal">
                    {format(parseLocalDate(race.date), 'dd/MM/yy', { locale: fr })}
                    {race.endDate && `-${format(parseLocalDate(race.endDate), 'dd/MM/yy', { locale: fr })}`}
                  </div>
                  {race.organizer && (
                    <div className="text-[10px] text-muted-foreground font-normal italic">{race.organizer}</div>
                  )}
                </th>
              ))}
              <th className="text-center py-2 px-2 font-semibold">Total</th>
              <th className="text-center py-2 px-2 font-semibold">Écart</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s: any, i: number) => {
              const gap = standings[0].totalPoints - s.totalPoints;
              return (
                <tr key={i} className={`border-b transition-colors hover:bg-muted/30 ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                  <td className="py-1 px-2">
                    <Badge className={`${getPositionBadgeColor(s.position || i + 1)} font-bold`}>
                      {s.position || i + 1}
                    </Badge>
                  </td>
                  <td className="py-1 px-2 font-medium">{s.driverName}</td>
                  {!isCopilote && (
                    <td className="py-1 px-2 text-muted-foreground text-sm">{s.driverCarModel || '—'}</td>
                  )}
                  {isGeneral && (
                    <>
                      <td className="py-1 px-2 text-center">{s.montagnePoints || 0}</td>
                      <td className="py-1 px-2 text-center">{s.rallyePoints || 0}</td>
                    </>
                  )}
                  {!isGeneral && relevantRaces.map((race: any, ri: number) => {
                    const pts = s.racePoints?.[race.name] || 0;
                    return (
                      <td key={ri} className="py-1 px-1 text-center">
                        {pts > 0 ? (
                          <Badge variant="outline" className="text-xs">{pts} pts</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-1 px-2 text-center">
                    <Badge className="bg-slate-400 hover:bg-slate-500 text-white font-bold">
                      {s.totalPoints || 0} pts
                    </Badge>
                  </td>
                  <td className="py-1 px-2 text-center">
                    <Badge variant="outline" className={gap === 0 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-red-50 border-red-200 text-red-700'}>
                      {gap === 0 ? '—' : `-${gap}`}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const ArchivePodium = ({ standings }: { standings: any[] }) => {
  const top3 = standings.slice(0, 3);
  if (top3.length === 0) return null;

  const medals = ['🥇', '🥈', '🥉'];
  const colors = [
    'from-yellow-400 to-amber-500',
    'from-gray-300 to-gray-400',
    'from-orange-400 to-orange-500',
  ];

  return (
    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
      {[1, 0, 2].map(idx => {
        const s = top3[idx];
        if (!s) return <div key={idx} />;
        return (
          <Card key={idx} className={`card-glass p-4 text-center ${idx === 0 ? 'mt-0' : 'mt-4'}`}>
            <div className="text-3xl mb-2">{medals[idx]}</div>
            <div className="font-bold text-sm">{s.driverName}</div>
            {s.driverTeam && <div className="text-xs text-muted-foreground">{s.driverTeam}</div>}
            <Badge className={`mt-2 bg-gradient-to-r ${colors[idx]} text-white`}>
              {s.totalPoints} pts
            </Badge>
          </Card>
        );
      })}
    </div>
  );
};

const ArchiveRaceCalendar = ({ races }: { races: any[] }) => {
  if (!races || races.length === 0) return null;

  return (
    <Card className="card-glass p-4">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Calendar size={18} /> Calendrier des courses
      </h4>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {races.map((race: any, i: number) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
            <div className="text-xs font-mono text-muted-foreground">
              {format(parseLocalDate(race.date), 'dd MMM', { locale: fr })}
            </div>
            <div>
              <div className="text-sm font-medium">{race.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{race.type}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const SeasonArchivesViewer = () => {
  const { archives, loading, deleteArchive } = useSeasonArchives();
  const { isAdmin } = useUserRole();
  const [expandedArchive, setExpandedArchive] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('general');

  const toggleExpanded = (id: string) => {
    setExpandedArchive(expandedArchive === id ? null : id);
    setActiveTab('general');
  };

  const exportArchiveToExcel = (archive: SeasonArchive) => {
    const wb = XLSX.utils.book_new();
    const standingsData = archive.standings_data as Record<string, any[]>;
    const racesArr = Array.isArray(archive.races_data) ? archive.races_data : [];

    for (const [key, standings] of Object.entries(standingsData)) {
      if (!Array.isArray(standings) || standings.length === 0) continue;

      const rows = standings.map((s: any, i: number) => {
        const row: Record<string, any> = {
          Position: s.position || i + 1,
          Pilote: s.driverName,
          Équipe: s.driverTeam || '',
          Véhicule: s.driverCarModel || '',
        };

        // Add per-race columns
        if (s.racePoints) {
          for (const [raceName, pts] of Object.entries(s.racePoints)) {
            row[raceName] = pts;
          }
        }

        if (key === 'general') {
          row['Points Montagne'] = s.montagnePoints || 0;
          row['Points Rallye'] = s.rallyePoints || 0;
        }
        row['Total Points'] = s.totalPoints || 0;
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const tabName = (CATEGORY_CONFIG[key]?.label || key).substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, tabName);
    }

    if (racesArr.length > 0) {
      const racesRows = racesArr.map((r: any) => ({
        Course: r.name,
        Date: r.date,
        Type: r.type,
        Organisateur: r.organizer || '',
        'Nb Résultats': r.resultsCount || 0,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(racesRows), 'Courses');
    }

    XLSX.writeFile(wb, `Archive_${archive.title}_${archive.year}.xlsx`);
  };

  const exportArchiveToPdf = (archive: SeasonArchive, category: string) => {
    const standingsData = archive.standings_data as Record<string, any[]>;
    const standings = standingsData[category];
    if (!standings || standings.length === 0) return;

    const racesArr = Array.isArray(archive.races_data) ? archive.races_data : [];
    const isGeneral = category === 'general';
    const isCopilote = category === 'copilote';
    const categoryLabel = CATEGORY_CONFIG[category]?.label || category;
    const title = `${archive.title} - ${categoryLabel}`;
    const subtitle = `Saison ${archive.year}`;

    if (isGeneral) {
      // General standings PDF (portrait)
      const doc = new jsPDF();
      addLogosToDoc(doc);
      addTitleToDoc(doc, title, subtitle);

      const tableData = standings.map((s: any, i: number) => {
        const pos = s.position || i + 1;
        const leaderPts = standings[0].totalPoints || 0;
        const gap = leaderPts - (s.totalPoints || 0);
        return [
          pos.toString(),
          s.driverName,
          `${s.montagnePoints || 0}`,
          `${s.rallyePoints || 0}`,
          `${s.totalPoints || 0}`,
          gap === 0 ? '—' : `-${gap}`,
        ];
      });

      autoTable(doc, {
        head: [['Pos', 'Pilote', 'Montagne', 'Rallye', 'Total', 'Écart']],
        body: tableData,
        startY: PDF_STYLES.positions.tableStart.y,
        didParseCell: function (data) {
          if (data.section === 'body') {
            const pos = parseInt(tableData[data.row.index][0]);
            const style = getPositionRowStyle(pos);
            if (style) {
              data.cell.styles.fillColor = style.fillColor;
              data.cell.styles.textColor = style.textColor;
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
      });

      doc.save(`archive-${categoryLabel.toLowerCase()}-${archive.year}.pdf`);
    } else {
      // Category standings PDF (landscape) with per-race columns
      const doc = new jsPDF('landscape');
      addLogosToDoc(doc, true);
      addTitleToDoc(doc, title, subtitle, 148);

      // Get relevant races
      const categoryRaces = category === 'montagne'
        ? racesArr.filter((r: any) => r.type === 'montagne')
        : category === 'rallye' || category === 'copilote'
        ? racesArr.filter((r: any) => r.type === 'rallye')
        : racesArr;

      // Filter races that have points
      const raceNamesSet = new Set<string>();
      standings.forEach((s: any) => {
        if (s.racePoints) Object.keys(s.racePoints).forEach(n => raceNamesSet.add(n));
      });
      const relevantRaces = categoryRaces
        .filter((r: any) => raceNamesSet.has(r.name))
        .sort((a: any, b: any) => a.date.localeCompare(b.date));

      const headers = ['Pos', 'Pilote'];
      if (!isCopilote) headers.push('Véhicule');
      relevantRaces.forEach((r: any) => {
        const dateStr = format(parseLocalDate(r.date), 'dd/MM', { locale: fr });
        headers.push(`${r.name} (${dateStr})`);
      });
      headers.push('Total', 'Écart');

      const tableData = standings.map((s: any, i: number) => {
        const pos = s.position || i + 1;
        const leaderPts = standings[0].totalPoints || 0;
        const gap = leaderPts - (s.totalPoints || 0);
        const row = [pos.toString(), s.driverName];
        if (!isCopilote) row.push(s.driverCarModel || '-');
        relevantRaces.forEach((r: any) => {
          const pts = s.racePoints?.[r.name] || 0;
          row.push(pts > 0 ? `${pts} pts` : '-');
        });
        row.push(`${s.totalPoints || 0}`);
        row.push(gap === 0 ? '—' : `-${gap}`);
        return row;
      });

      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: PDF_STYLES.positions.tableStart.y,
        didParseCell: function (data) {
          if (data.section === 'body') {
            const pos = parseInt(tableData[data.row.index][0]);
            const style = getPositionRowStyle(pos);
            if (style) {
              data.cell.styles.fillColor = style.fillColor;
              data.cell.styles.textColor = style.textColor;
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
      });

      doc.save(`archive-${categoryLabel.toLowerCase()}-${archive.year}.pdf`);
    }
  };

  const exportAllArchivePdfs = (archive: SeasonArchive) => {
    const standingsData = archive.standings_data as Record<string, any[]>;
    const keys = Object.keys(standingsData).filter(
      k => Array.isArray(standingsData[k]) && standingsData[k].length > 0
    );
    keys.forEach(key => exportArchiveToPdf(archive, key));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (archives.length === 0) {
    return (
      <Card className="card-glass p-8 text-center">
        <Archive size={48} className="mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Aucune archive</h2>
        <p className="text-muted-foreground">
          Les saisons archivées apparaîtront ici. Utilisez le bouton "Archiver la saison" dans l'administration pour créer une archive.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Archive size={28} className="text-primary" />
        <h1 className="text-2xl font-bold">Archives des saisons</h1>
      </div>

      {archives.map((archive) => {
        const isExpanded = expandedArchive === archive.id;
        const standingsData = archive.standings_data as Record<string, any[]>;
        const standingsKeys = Object.keys(standingsData).filter(
          k => Array.isArray(standingsData[k]) && standingsData[k].length > 0
        );
        const driversCount = Array.isArray(archive.drivers_data) ? archive.drivers_data.length : 0;
        const racesArr = Array.isArray(archive.races_data) ? archive.races_data : [];
        const racesCount = racesArr.length;

        // Get races for the active tab
        const activeRaces = activeTab === 'general'
          ? racesArr
          : activeTab === 'montagne'
          ? racesArr.filter((r: any) => r.type === 'montagne')
          : activeTab === 'rallye' || activeTab === 'copilote'
          ? racesArr.filter((r: any) => r.type === 'rallye')
          : racesArr; // r2 uses all races

        return (
          <Card key={archive.id} className="card-glass overflow-hidden">
            {/* Header */}
            <div
              className="p-4 cursor-pointer hover:bg-muted/30 transition-colors flex items-center justify-between"
              onClick={() => toggleExpanded(archive.id)}
            >
              <div className="flex items-center gap-4 flex-wrap">
                <Trophy size={24} className="text-primary" />
                <div>
                  <h3 className="font-bold text-lg">{archive.title}</h3>
                  <p className="text-sm text-muted-foreground">{archive.year}</p>
                </div>
                <div className="flex gap-2 ml-4 flex-wrap">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users size={12} /> {driversCount} pilotes
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Trophy size={12} /> {racesCount} courses
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar size={12} />
                    {format(new Date(archive.archived_at), 'dd MMM yyyy', { locale: fr })}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t p-4 space-y-6">
                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); exportArchiveToExcel(archive); }}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet size={16} /> Exporter Excel
                  </Button>
                  {isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex items-center gap-2">
                          <Trash2 size={16} /> Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer cette archive ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            L'archive "{archive.title} {archive.year}" sera définitivement supprimée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteArchive(archive.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                {/* Race calendar */}
                <ArchiveRaceCalendar races={activeRaces} />

                {/* Category tabs */}
                {standingsKeys.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      {standingsKeys.map(key => {
                        const cfg = CATEGORY_CONFIG[key];
                        const Icon = cfg?.icon || Trophy;
                        return (
                          <Button
                            key={key}
                            variant={activeTab === key ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTab(key)}
                            className="flex items-center gap-1"
                          >
                            <Icon size={14} />
                            {cfg?.label || key}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Podium */}
                    {standingsData[activeTab] && (
                      <ArchivePodium standings={standingsData[activeTab]} />
                    )}

                    {/* Detailed standings table */}
                    {standingsData[activeTab] && (
                      <ArchiveStandingsTable
                        standings={standingsData[activeTab]}
                        activeTab={activeTab}
                        races={activeRaces}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default SeasonArchivesViewer;
