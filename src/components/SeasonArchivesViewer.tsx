
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Archive, Calendar, Users, Trophy, Trash2, ChevronDown, ChevronUp, FileSpreadsheet, FileText } from 'lucide-react';
import { useSeasonArchives, SeasonArchive } from '@/hooks/useSeasonArchives';
import { useUserRole } from '@/hooks/useUserRole';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as XLSX from 'xlsx';

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

    // Export each standings type
    const standingsData = archive.standings_data as Record<string, any[]>;
    for (const [key, standings] of Object.entries(standingsData)) {
      if (!Array.isArray(standings) || standings.length === 0) continue;
      
      const rows = standings.map((s: any, i: number) => ({
        Position: s.position || i + 1,
        Pilote: s.driverName,
        Équipe: s.driverTeam || '',
        'Points Montagne': s.montagnePoints || 0,
        'Points Rallye': s.rallyePoints || 0,
        'Total Points': s.totalPoints || 0,
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const tabName = key.charAt(0).toUpperCase() + key.slice(1);
      XLSX.utils.book_append_sheet(wb, ws, tabName.substring(0, 31));
    }

    // Export drivers
    if (Array.isArray(archive.drivers_data) && archive.drivers_data.length > 0) {
      const driversRows = archive.drivers_data.map((d: any) => ({
        Nom: d.name,
        Équipe: d.team || '',
        Numéro: d.number || '',
        Voiture: d.carModel || '',
        Rôle: d.driverRole || 'pilote',
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(driversRows), 'Pilotes');
    }

    // Export races
    if (Array.isArray(archive.races_data) && archive.races_data.length > 0) {
      const racesRows = archive.races_data.map((r: any) => ({
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
        const racesCount = Array.isArray(archive.races_data) ? archive.races_data.length : 0;

        return (
          <Card key={archive.id} className="card-glass overflow-hidden">
            {/* Header */}
            <div
              className="p-4 cursor-pointer hover:bg-muted/30 transition-colors flex items-center justify-between"
              onClick={() => toggleExpanded(archive.id)}
            >
              <div className="flex items-center gap-4">
                <Trophy size={24} className="text-primary" />
                <div>
                  <h3 className="font-bold text-lg">{archive.title}</h3>
                  <p className="text-sm text-muted-foreground">{archive.year}</p>
                </div>
                <div className="flex gap-2 ml-4">
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
              <div className="border-t p-4 space-y-4">
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

                {/* Standings tabs */}
                {standingsKeys.length > 0 && (
                  <div>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {standingsKeys.map(key => (
                        <Button
                          key={key}
                          variant={activeTab === key ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setActiveTab(key)}
                        >
                          {key === 'general' ? 'Général' :
                           key === 'montagne' ? 'Montagne' :
                           key === 'rallye' ? 'Rallye' :
                           key === 'r2' ? 'R2' :
                           key === 'copilote' ? 'Copilote' :
                           key.charAt(0).toUpperCase() + key.slice(1)}
                        </Button>
                      ))}
                    </div>

                    {/* Standings table */}
                    {standingsData[activeTab] && Array.isArray(standingsData[activeTab]) && (
                      <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left py-2 px-3 font-semibold">Pos</th>
                              <th className="text-left py-2 px-3 font-semibold">Pilote</th>
                              <th className="text-left py-2 px-3 font-semibold">Équipe</th>
                              {activeTab === 'general' && (
                                <>
                                  <th className="text-center py-2 px-3 font-semibold">Montagne</th>
                                  <th className="text-center py-2 px-3 font-semibold">Rallye</th>
                                </>
                              )}
                              <th className="text-center py-2 px-3 font-semibold">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {standingsData[activeTab].map((s: any, i: number) => (
                              <tr key={i} className={`border-b ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                                <td className="py-2 px-3">
                                  <Badge variant={s.position <= 3 ? 'default' : 'outline'} className="font-bold">
                                    {s.position || i + 1}
                                  </Badge>
                                </td>
                                <td className="py-2 px-3 font-medium">{s.driverName}</td>
                                <td className="py-2 px-3 text-muted-foreground">{s.driverTeam || '—'}</td>
                                {activeTab === 'general' && (
                                  <>
                                    <td className="py-2 px-3 text-center">{s.montagnePoints || 0}</td>
                                    <td className="py-2 px-3 text-center">{s.rallyePoints || 0}</td>
                                  </>
                                )}
                                <td className="py-2 px-3 text-center font-bold">{s.totalPoints || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
