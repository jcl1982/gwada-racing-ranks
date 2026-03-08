import { Card } from '@/components/ui/card';
import { Trophy, Zap, Circle, Upload } from 'lucide-react';
import { ViewType } from '@/hooks/useViewNavigation';

interface AdminHubProps {
  onViewChange: (view: ViewType) => void;
}

const adminSections = [
  {
    id: 'admin' as const,
    label: 'Rallye - Montagne',
    description: 'Gérer les pilotes, courses et classements du championnat Rallye-Montagne',
    icon: Trophy,
  },
  {
    id: 'admin-acceleration' as const,
    label: 'Accélération',
    description: 'Gérer les pilotes, courses et classements du championnat Accélération',
    icon: Zap,
  },
  {
    id: 'admin-karting' as const,
    label: 'Karting',
    description: 'Gérer les pilotes, courses et classements du championnat Karting',
    icon: Circle,
  },
  {
    id: 'import' as const,
    label: 'Import Excel',
    description: 'Importer des données depuis un fichier Excel',
    icon: Upload,
  },
];

const AdminHub = ({ onViewChange }: AdminHubProps) => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground text-center">Administration</h1>
      <p className="text-muted-foreground text-center">Sélectionnez le championnat à administrer</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {adminSections.map(({ id, label, description, icon: Icon }) => (
          <Card
            key={id}
            onClick={() => onViewChange(id)}
            className="card-glass p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 flex flex-col items-center text-center gap-4"
          >
            <div className="w-14 h-14 rounded-full gradient-caribbean flex items-center justify-center">
              <Icon size={28} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{label}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminHub;
