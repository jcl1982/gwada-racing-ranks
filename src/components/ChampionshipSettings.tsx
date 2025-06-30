
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChampionshipSettingsProps {
  championshipTitle: string;
  championshipYear: string;
  onTitleChange: (title: string, year: string) => void;
}

const ChampionshipSettings = ({ 
  championshipTitle, 
  championshipYear, 
  onTitleChange 
}: ChampionshipSettingsProps) => {
  const [title, setTitle] = useState(championshipTitle);
  const [year, setYear] = useState(championshipYear);
  const { toast } = useToast();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="text-blue-600" size={24} />
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

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Aperçu</h3>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <h1 className="text-3xl md:text-4xl font-bold gradient-caribbean bg-clip-text text-transparent mb-2">
            {title || championshipTitle}
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            {year || championshipYear}
          </h2>
        </div>
      </Card>
    </div>
  );
};

export default ChampionshipSettings;
