
import { Card } from '@/components/ui/card';
import { Trophy, Mountain, Car, Home, Upload, Settings } from 'lucide-react';
import { ViewType } from '@/hooks/useViewNavigation';
import { useUserRole } from '@/hooks/useUserRole';
import AuthButton from './AuthButton';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const { isAdmin, isAuthenticated, loading } = useUserRole();
  
  console.log('🔐 Navigation - Auth state:', { isAuthenticated, isAdmin, loading });

  const navItems = [
    { id: 'home' as const, label: 'Accueil', icon: Home, requiresAuth: false },
    { id: 'general' as const, label: 'Classement Général', icon: Trophy, requiresAuth: false },
    { id: 'montagne' as const, label: 'Trophée de la montagne', icon: Mountain, requiresAuth: false },
    { id: 'rallye' as const, label: 'Trophée des rallyes', icon: Car, requiresAuth: false },
    { id: 'c2r2' as const, label: 'Trophée C2 R2', icon: Car, requiresAuth: false },
    { id: 'import' as const, label: 'Import Excel', icon: Upload, requiresAuth: true, adminOnly: true },
    { id: 'admin' as const, label: 'Administration', icon: Settings, requiresAuth: true, adminOnly: true },
  ];

  // Filter nav items based on authentication and role
  const visibleNavItems = navItems.filter(item => {
    console.log(`🔍 Navigation - Item: ${item.id}`, {
      requiresAuth: item.requiresAuth,
      adminOnly: item.adminOnly,
      isAuthenticated,
      isAdmin,
      willShow: !item.requiresAuth || (isAuthenticated && (!item.adminOnly || isAdmin))
    });
    
    if (!item.requiresAuth) return true;
    if (!isAuthenticated) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  console.log('📋 Navigation - Visible items:', visibleNavItems.map(item => item.id));

  return (
    <Card className="card-glass p-4 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <nav className="flex flex-wrap justify-center gap-2 md:gap-4">
          {visibleNavItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                currentView === id
                  ? 'gradient-caribbean text-white shadow-lg transform scale-105'
                  : 'bg-white/70 text-gray-700 hover:bg-white/90 hover:shadow-md hover:scale-102'
              }`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>
        
        {isAuthenticated && isAdmin && <AuthButton />}
      </div>
    </Card>
  );
};

export default Navigation;
