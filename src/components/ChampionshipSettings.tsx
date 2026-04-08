
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save, Type, Tag, LayoutList, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StandingsTitles, DEFAULT_STANDINGS_TITLES } from '@/hooks/useChampionshipConfig';
import { supabase } from '@/integrations/supabase/client';

interface ChampionshipSettingsProps {
  championshipTitle: string;
  championshipYear: string;
  standingsTitles?: StandingsTitles;
  onTitleChange: (title: string, year: string) => void;
  onStandingsTitlesChange?: (titles: StandingsTitles) => void;
}

const TITLE_LABELS: Record<string, string> = {
  general: 'Classement Général',
  montagne: 'Trophée Montagne',
  rallye: 'Trophée Rallye',
  r2: 'Trophée R2',
  copilote: 'Trophée Copilote',
  vmrs: 'Trophée VMRS',
};

const SUBTITLE_LABELS: Record<string, string> = {
  general_subtitle: 'Sous-titre Général',
  montagne_subtitle: 'Sous-titre Montagne',
  rallye_subtitle: 'Sous-titre Rallye',
  r2_subtitle: 'Sous-titre R2',
  copilote_subtitle: 'Sous-titre Copilote',
  vmrs_subtitle: 'Sous-titre VMRS',
};

const TAB_LABELS: Record<string, string> = {
  general_tab: 'Onglet Général',
  montagne_tab: 'Onglet Montagne',
  rallye_tab: 'Onglet Rallye',
  r2_tab: 'Onglet R2',
  copilote_tab: 'Onglet Copilote',
  vmrs_tab: 'Onglet VMRS',
};

const ChampionshipSettings = ({ 
  championshipTitle, 
  championshipYear,
  standingsTitles,
  onTitleChange,
  onStandingsTitlesChange,
}: ChampionshipSettingsProps) => {
  const [title, setTitle] = useState(championshipTitle);
  const [year, setYear] = useState(championshipYear);
  const [titles, setTitles] = useState<StandingsTitles>(standingsTitles || DEFAULT_STANDINGS_TITLES);
  const { toast } = useToast();

  const [bulkYear, setBulkYear] = useState('');
  const [updatingAll, setUpdatingAll] = useState(false);

  const handleSave = () => {
    if (!title.trim() || !year.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    onTitleChange(title.trim(), year.trim());
    toast({
      title: "Paramètres sauvegardés",
      description: "Le titre du championnat a été mis à jour avec succès",
    });
  };

  const handleUpdateAllYears = async () => {
    if (!bulkYear.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir la nouvelle année",
        variant: "destructive",
      });
      return;
    }

    setUpdatingAll(true);
    try {
      const { error } = await supabase
        .from('championship_config')
        .update({ year: bulkYear.trim(), updated_at: new Date().toISOString() })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // update all rows

      if (error) throw error;

      setYear(bulkYear.trim());
      toast({
        title: "Tous les championnats mis à jour",
        description: `L'année de tous les championnats a été changée en "${bulkYear.trim()}"`,
      });
    } catch (error) {
      console.error('Error updating all championships:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour tous les championnats",
        variant: "destructive",
      });
    } finally {
      setUpdatingAll(false);
    }
  };

  const handleSaveTitles = () => {
    if (onStandingsTitlesChange) {
      onStandingsTitlesChange(titles);
    }
  };

  const handleTitleFieldChange = (key: string, value: string) => {
    setTitles(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="text-primary" size={24} />
        <h2 className="text-xl font-semibold">Paramètres du Championnat</h2>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="championship-title">Titre du Championnat</Label>
            <Input
              id="championship-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Championnat Automobile de Guadeloupe"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="championship-year">Année</Label>
            <Input
              id="championship-year"
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Ex: 2024"
              className="mt-1"
            />
          </div>

          <Button 
            onClick={handleSave}
            className="w-full sm:w-auto"
          >
            <Save size={16} className="mr-2" />
            Sauvegarder les paramètres
          </Button>
        </div>
      </Card>

      {/* Mise à jour globale de l'année */}
      <Card className="p-6 border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="text-primary" size={20} />
          <h3 className="text-lg font-semibold">Mise à jour globale</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Mettre à jour l'année de <strong>tous les championnats</strong> en un seul clic (Rallye-Montagne, Accélération, Karting...).
        </p>
        <div className="flex items-end gap-3">
          <div className="flex-1 max-w-xs">
            <Label htmlFor="bulk-year">Nouvelle année pour tous</Label>
            <Input
              id="bulk-year"
              type="text"
              value={bulkYear}
              onChange={(e) => setBulkYear(e.target.value)}
              placeholder={`Ex: de Guadeloupe ${new Date().getFullYear()}`}
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleUpdateAllYears}
            disabled={updatingAll}
            variant="default"
          >
            {updatingAll ? <RefreshCw size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}
            Appliquer à tous les championnats
          </Button>
        </div>
      </Card>

      {onStandingsTitlesChange && (
        <>
          {/* Titres des classements */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Type className="text-primary" size={20} />
              <h3 className="text-lg font-semibold">Titres des Classements</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Personnalisez les titres principaux affichés pour chaque classement.
            </p>
            <div className="space-y-4">
              {Object.entries(TITLE_LABELS).map(([key, label]) => (
                <div key={key}>
                  <Label htmlFor={`title-${key}`}>{label}</Label>
                  <Input
                    id={`title-${key}`}
                    type="text"
                    value={titles[key] || ''}
                    onChange={(e) => handleTitleFieldChange(key, e.target.value)}
                    placeholder={DEFAULT_STANDINGS_TITLES[key]}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Sous-titres */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="text-primary" size={20} />
              <h3 className="text-lg font-semibold">Sous-titres</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Texte affiché sous le titre principal de chaque classement. Laissez vide pour afficher "Saison {championshipYear}" par défaut.
            </p>
            <div className="space-y-4">
              {Object.entries(SUBTITLE_LABELS).map(([key, label]) => (
                <div key={key}>
                  <Label htmlFor={`title-${key}`}>{label}</Label>
                  <Input
                    id={`title-${key}`}
                    type="text"
                    value={titles[key] || ''}
                    onChange={(e) => handleTitleFieldChange(key, e.target.value)}
                    placeholder={`Saison ${championshipYear}`}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Libellés des onglets */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <LayoutList className="text-primary" size={20} />
              <h3 className="text-lg font-semibold">Libellés des Onglets</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Personnalisez les noms affichés sur les onglets de navigation des classements.
            </p>
            <div className="space-y-4">
              {Object.entries(TAB_LABELS).map(([key, label]) => (
                <div key={key}>
                  <Label htmlFor={`title-${key}`}>{label}</Label>
                  <Input
                    id={`title-${key}`}
                    type="text"
                    value={titles[key] || ''}
                    onChange={(e) => handleTitleFieldChange(key, e.target.value)}
                    placeholder={DEFAULT_STANDINGS_TITLES[key]}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </Card>

          <Button 
            onClick={handleSaveTitles}
            className="w-full sm:w-auto"
          >
            <Save size={16} className="mr-2" />
            Sauvegarder tous les textes
          </Button>
        </>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Aperçu</h3>
        <div className="text-center py-8 bg-muted/50 rounded-lg">
          <h1 className="text-3xl md:text-4xl font-bold gradient-caribbean bg-clip-text text-transparent mb-2">
            {title || championshipTitle}
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {year || championshipYear}
          </h2>
        </div>
      </Card>
    </div>
  );
};

export default ChampionshipSettings;
