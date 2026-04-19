import { Card } from '@/components/ui/card';
import { Trophy, Home, Settings, Zap, Circle, Archive, FileText } from 'lucide-react';
import { ViewType } from '@/hooks/useViewNavigation';
import { useUserRole } from '@/hooks/useUserRole';
import AuthButton from './AuthButton';
import ThemeToggle from './ThemeToggle';
interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}
const Navigation = ({
  currentView,
  onViewChange
}: NavigationProps) => {
  const {
    isAdmin,
    isAuthenticated,
    loading
  } = useUserRole();
  console.log('🔐 Navigation - Auth state:', {
    isAuthenticated,
    isAdmin,
    loading
  });

  const otherNavItems = [{
    id: 'home' as const,
    label: 'Accueil',
    icon: Home,
    requiresAuth: false
  }];

  // Filter nav items based on authentication
  const visibleOtherItems = otherNavItems.filter(item => {
    if (!item.requiresAuth) return true;
    if (!isAuthenticated) return false;
    return true;
  });
  console.log('📋 Navigation - Visible items:', visibleOtherItems.map(item => item.id));
  const isRallyeMontagnView = ['general', 'montagne', 'rallye', 'r2'].includes(currentView);
  const isAccelerationView = ['acceleration', 'admin-acceleration'].includes(currentView);
  const isKartingView = ['karting', 'admin-karting'].includes(currentView);
  const isAdminView = ['admin', 'admin-acceleration', 'admin-karting', 'admin-hub', 'import'].includes(currentView);

  const activeClass = 'gradient-caribbean text-white shadow-lg transform scale-105';
  const inactiveClass = 'bg-card/70 text-foreground hover:bg-card/90 hover:shadow-md hover:scale-102';

  return <Card className="card-glass p-4 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <nav className="flex flex-nowrap justify-center items-center gap-1 md:gap-2 text-xs md:text-sm overflow-x-auto">
          {visibleOtherItems.map(({
          id,
          label,
          icon: Icon
        }) => <button key={id} onClick={() => onViewChange(id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${currentView === id ? activeClass : inactiveClass}`}>
              <Icon size={18} />
              <span className="hidden sm:inline">{label}</span>
            </button>)}

          {/* Rallye-Montagne Championship button */}
          <button onClick={() => onViewChange('general')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isRallyeMontagnView ? activeClass : inactiveClass}`}>
            <Trophy size={18} />
            <span className="hidden sm:inline">CHAMPIONNAT RALLYE - MONTAGNE</span>
            <span className="sm:hidden">Rallye-Montagne</span>
          </button>

          {/* Acceleration Championship menu */}
          <button onClick={() => onViewChange('acceleration')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${currentView === 'acceleration' ? activeClass : inactiveClass}`}>
            <Zap size={18} />
            <span className="hidden sm:inline">CHAMPIONNAT ACCELERATION</span>
            <span className="sm:hidden">Accélération</span>
          </button>

          {/* Karting Championship menu */}
          <button onClick={() => onViewChange('karting')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${currentView === 'karting' ? activeClass : inactiveClass}`}>
            <Circle size={18} />
            <span className="hidden sm:inline">CHAMPIONNAT KARTING</span>
            <span className="sm:hidden">Karting</span>
          </button>

          {/* Règlement menu */}
          <button onClick={() => onViewChange('reglement')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${currentView === 'reglement' ? activeClass : inactiveClass}`}>
            <FileText size={18} />
            <span className="hidden sm:inline">RÈGLEMENT CHAMPIONNAT</span>
            <span className="sm:hidden">Règlement</span>
          </button>

          {/* Separator before admin */}
          {isAuthenticated && isAdmin && (
            <div className="hidden sm:block h-8 w-px bg-border mx-2" />
          )}

          {/* Administration button */}
          {isAuthenticated && isAdmin && (
            <button 
              onClick={() => onViewChange('admin-hub')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isAdminView ? activeClass : inactiveClass}`}
            >
              <Settings size={18} />
              <span className="hidden sm:inline">Administration</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}
        </nav>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated && isAdmin && <AuthButton />}
        </div>
      </div>
    </Card>;
};
export default Navigation;
