import { ChevronRight, Home, Settings } from 'lucide-react';
import { ViewType } from '@/hooks/useViewNavigation';

interface AdminBreadcrumbProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const viewLabels: Record<string, string> = {
  'admin': 'Rallye-Montagne',
  'admin-acceleration': 'Accélération',
  'admin-karting': 'Karting',
  'import': 'Import Excel',
};

const AdminBreadcrumb = ({ currentView, onViewChange }: AdminBreadcrumbProps) => {
  const currentLabel = viewLabels[currentView] || currentView;

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <button
        onClick={() => onViewChange('home')}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home size={14} />
        <span>Accueil</span>
      </button>
      <ChevronRight size={14} />
      <button
        onClick={() => onViewChange('admin-hub')}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Settings size={14} />
        <span>Administration</span>
      </button>
      <ChevronRight size={14} />
      <span className="text-foreground font-medium">{currentLabel}</span>
    </nav>
  );
};

export default AdminBreadcrumb;
