import { Card } from '@/components/ui/card';
import { Trophy, Home, Upload, Settings, Zap, Circle } from 'lucide-react';
import { ViewType } from '@/hooks/useViewNavigation';
import { useUserRole } from '@/hooks/useUserRole';
import AuthButton from './AuthButton';
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
  }, {
    id: 'import' as const,
    label: 'Import Excel',
    icon: Upload,
    requiresAuth: true,
    adminOnly: true
  }];

  // Filter nav items based on authentication and role
  const visibleOtherItems = otherNavItems.filter(item => {
    console.log(`🔍 Navigation - Item: ${item.id}`, {
      requiresAuth: item.requiresAuth,
      adminOnly: item.adminOnly,
      isAuthenticated,
      isAdmin,
      willShow: !item.requiresAuth || isAuthenticated && (!item.adminOnly || isAdmin)
    });
    if (!item.requiresAuth) return true;
    if (!isAuthenticated) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });
  console.log('📋 Navigation - Visible items:', visibleOtherItems.map(item => item.id));
  const isRallyeMontagnView = ['general', 'montagne', 'rallye', 'c2r2'].includes(currentView);

  return <Card className="card-glass p-4 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <nav className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
          {visibleOtherItems.map(({
          id,
          label,
          icon: Icon
        }) => <button key={id} onClick={() => onViewChange(id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${currentView === id ? 'gradient-caribbean text-white shadow-lg transform scale-105' : 'bg-white/70 text-gray-700 hover:bg-white/90 hover:shadow-md hover:scale-102'}`}>
              <Icon size={18} />
              <span className="hidden sm:inline">{label}</span>
            </button>)}

          {/* Rallye-Montagne Championship */}
          <div className="flex items-center gap-1">
            <button onClick={() => onViewChange('general')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isRallyeMontagnView && currentView !== 'admin' ? 'gradient-caribbean text-white shadow-lg transform scale-105' : 'bg-white/70 text-gray-700 hover:bg-white/90 hover:shadow-md hover:scale-102'}`}>
              <Trophy size={18} />
              <span className="hidden sm:inline">CHAMPIONNAT RALLYE - MONTAGNE</span>
              <span className="sm:hidden">Rallye-Montagne</span>
            </button>
            {isAuthenticated && isAdmin && (
              <button onClick={() => onViewChange('admin')} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${currentView === 'admin' ? 'gradient-caribbean text-white shadow-lg transform scale-105' : 'bg-white/70 text-gray-700 hover:bg-white/90 hover:shadow-md hover:scale-102'}`} title="Administration Rallye-Montagne">
                <Settings size={18} />
              </button>
            )}
          </div>

          {/* Acceleration Championship */}
          <div className="flex items-center gap-1">
            <button onClick={() => onViewChange('acceleration')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${currentView === 'acceleration' ? 'gradient-caribbean text-white shadow-lg transform scale-105' : 'bg-white/70 text-gray-700 hover:bg-white/90 hover:shadow-md hover:scale-102'}`}>
              <Zap size={18} />
              <span className="hidden sm:inline">CHAMPIONNAT ACCELERATION</span>
              <span className="sm:hidden">Accélération</span>
            </button>
            {isAuthenticated && isAdmin && (
              <button onClick={() => onViewChange('admin-acceleration')} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${currentView === 'admin-acceleration' ? 'gradient-caribbean text-white shadow-lg transform scale-105' : 'bg-white/70 text-gray-700 hover:bg-white/90 hover:shadow-md hover:scale-102'}`} title="Administration Accélération">
                <Settings size={18} />
              </button>
            )}
          </div>

          {/* Karting Championship */}
          <div className="flex items-center gap-1">
            <button onClick={() => onViewChange('karting')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${currentView === 'karting' ? 'gradient-caribbean text-white shadow-lg transform scale-105' : 'bg-white/70 text-gray-700 hover:bg-white/90 hover:shadow-md hover:scale-102'}`}>
              <Circle size={18} />
              <span className="hidden sm:inline">CHAMPIONNAT KARTING</span>
              <span className="sm:hidden">Karting</span>
            </button>
            {isAuthenticated && isAdmin && (
              <button onClick={() => onViewChange('admin-karting')} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${currentView === 'admin-karting' ? 'gradient-caribbean text-white shadow-lg transform scale-105' : 'bg-white/70 text-gray-700 hover:bg-white/90 hover:shadow-md hover:scale-102'}`} title="Administration Karting">
                <Settings size={18} />
              </button>
            )}
          </div>
        </nav>
        
        {isAuthenticated && isAdmin && <AuthButton />}
      </div>
    </Card>;
};
export default Navigation;