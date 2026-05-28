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

  const btnBase = 'flex items-center justify-center gap-1.5 px-2.5 py-2 sm:px-4 sm:gap-2 rounded-lg font-medium transition-all duration-300 shrink-0';

  return <Card className="card-glass p-3 sm:p-4 mb-4 sm:mb-8">
      <div className="flex flex-row justify-between items-center gap-2 sm:gap-4">
        <nav className="flex flex-nowrap items-center gap-1 md:gap-2 text-[11px] sm:text-xs md:text-sm overflow-x-auto flex-1 min-w-0 -mx-1 px-1 scrollbar-thin">
          {visibleOtherItems.map(({
          id,
          label,
          icon: Icon
        }) => <button key={id} onClick={() => onViewChange(id)} aria-label={label} className={`${btnBase} ${currentView === id ? activeClass : inactiveClass}`}>
              <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              <span className="hidden md:inline">{label}</span>
            </button>)}

          {/* Rallye-Montagne Championship button */}
          <button onClick={() => onViewChange('general')} aria-label="Championnat Rallye - Montagne" className={`${btnBase} ${isRallyeMontagnView ? activeClass : inactiveClass}`}>
            <Trophy className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            <span className="hidden lg:inline">CHAMPIONNAT RALLYE - MONTAGNE</span>
            <span className="hidden sm:inline lg:hidden">Rallye-Montagne</span>
          </button>

          {/* Acceleration Championship menu */}
          <button onClick={() => onViewChange('acceleration')} aria-label="Championnat Accélération" className={`${btnBase} ${currentView === 'acceleration' ? activeClass : inactiveClass}`}>
            <Zap className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            <span className="hidden lg:inline">CHAMPIONNAT ACCELERATION</span>
            <span className="hidden sm:inline lg:hidden">Accélération</span>
          </button>

          {/* Karting Championship menu */}
          <button onClick={() => onViewChange('karting')} aria-label="Championnat Karting" className={`${btnBase} ${currentView === 'karting' ? activeClass : inactiveClass}`}>
            <Circle className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            <span className="hidden lg:inline">CHAMPIONNAT KARTING</span>
            <span className="hidden sm:inline lg:hidden">Karting</span>
          </button>

          {/* Règlement menu */}
          <button onClick={() => onViewChange('reglement')} aria-label="Règlement Championnat" className={`${btnBase} ${currentView === 'reglement' ? activeClass : inactiveClass}`}>
            <FileText className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            <span className="hidden lg:inline">RÈGLEMENT CHAMPIONNAT</span>
            <span className="hidden sm:inline lg:hidden">Règlement</span>
          </button>

          {/* Separator before admin */}
          {isAuthenticated && isAdmin && (
            <div className="hidden sm:block h-8 w-px bg-border mx-1 sm:mx-2 shrink-0" />
          )}

          {/* Administration button */}
          {isAuthenticated && isAdmin && (
            <button 
              onClick={() => onViewChange('admin-hub')} 
              aria-label="Administration"
              className={`${btnBase} ${isAdminView ? activeClass : inactiveClass}`}
            >
              <Settings className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}
        </nav>
        
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <ThemeToggle />
          {isAuthenticated && isAdmin && <AuthButton />}
        </div>
      </div>
    </Card>;
};
export default Navigation;
