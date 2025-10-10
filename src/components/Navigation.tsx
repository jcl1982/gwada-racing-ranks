import { Card } from '@/components/ui/card';
import { Trophy, Mountain, Car, Home, Upload, Settings, Zap, Circle } from 'lucide-react';
import { ViewType } from '@/hooks/useViewNavigation';
import { useUserRole } from '@/hooks/useUserRole';
import AuthButton from './AuthButton';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
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
  const rallyeMontagnChampionshipItems = [{
    id: 'general' as const,
    label: 'Classement Général',
    icon: Trophy
  }, {
    id: 'montagne' as const,
    label: 'Trophée de la montagne',
    icon: Mountain
  }, {
    id: 'rallye' as const,
    label: 'Trophée des rallyes',
    icon: Car
  }, {
    id: 'c2r2' as const,
    label: 'Trophée C2 R2',
    icon: Car
  }];

  const accelerationChampionshipItems = [{
    id: 'acceleration' as const,
    label: 'Classement Accélération',
    icon: Zap,
    requiresAuth: false
  }, {
    id: 'admin-acceleration' as const,
    label: 'Administration',
    icon: Settings,
    requiresAuth: true,
    adminOnly: true
  }];

  const kartingChampionshipItems = [{
    id: 'karting' as const,
    label: 'Classement Karting',
    icon: Circle,
    requiresAuth: false
  }, {
    id: 'admin-karting' as const,
    label: 'Administration',
    icon: Settings,
    requiresAuth: true,
    adminOnly: true
  }];
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
  }, {
    id: 'admin' as const,
    label: 'Administration',
    icon: Settings,
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
  const isAccelerationView = ['acceleration', 'admin-acceleration'].includes(currentView);
  const isKartingView = ['karting', 'admin-karting'].includes(currentView);

  // Filter championship items based on authentication and role
  const visibleAccelerationItems = accelerationChampionshipItems.filter(item => {
    if (!item.requiresAuth) return true;
    if (!isAuthenticated) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  const visibleKartingItems = kartingChampionshipItems.filter(item => {
    if (!item.requiresAuth) return true;
    if (!isAuthenticated) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });
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

          {/* Rallye-Montagne Championship dropdown menu */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isRallyeMontagnView ? 'gradient-caribbean text-white shadow-lg' : 'bg-white/70 text-gray-700 hover:bg-white/90 hover:shadow-md'}`}>
                  <Trophy size={18} />
                  <span className="hidden sm:inline">CHAMPIONNAT RALLYE - MONTAGNE</span>
                  <span className="sm:hidden">Rallye-Montagne</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white border rounded-lg shadow-lg p-2 min-w-[240px] z-50">
                  <div className="flex flex-col gap-1">
                    {rallyeMontagnChampionshipItems.map(({
                    id,
                    label,
                    icon: Icon
                  }) => <button key={id} onClick={() => onViewChange(id)} className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-all duration-200 text-left ${currentView === id ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                        <Icon size={18} />
                        <span>{label}</span>
                      </button>)}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Acceleration Championship dropdown menu */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isAccelerationView ? 'gradient-caribbean text-white shadow-lg' : 'bg-white/70 text-gray-700 hover:bg-white/90 hover:shadow-md'}`}>
                  <Zap size={18} />
                  <span className="hidden sm:inline">CHAMPIONNAT ACCELERATION</span>
                  <span className="sm:hidden">Accélération</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white border rounded-lg shadow-lg p-2 min-w-[240px] z-50">
                  <div className="flex flex-col gap-1">
                    {visibleAccelerationItems.map(({
                    id,
                    label,
                    icon: Icon
                  }) => <button key={id} onClick={() => onViewChange(id)} className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-all duration-200 text-left ${currentView === id ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                        <Icon size={18} />
                        <span>{label}</span>
                      </button>)}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Karting Championship dropdown menu */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isKartingView ? 'gradient-caribbean text-white shadow-lg' : 'bg-white/70 text-gray-700 hover:bg-white/90 hover:shadow-md'}`}>
                  <Circle size={18} />
                  <span className="hidden sm:inline">CHAMPIONNAT KARTING</span>
                  <span className="sm:hidden">Karting</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white border rounded-lg shadow-lg p-2 min-w-[240px] z-50">
                  <div className="flex flex-col gap-1">
                    {visibleKartingItems.map(({
                    id,
                    label,
                    icon: Icon
                  }) => <button key={id} onClick={() => onViewChange(id)} className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-all duration-200 text-left ${currentView === id ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                        <Icon size={18} />
                        <span>{label}</span>
                      </button>)}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
        
        {isAuthenticated && isAdmin && <AuthButton />}
      </div>
    </Card>;
};
export default Navigation;