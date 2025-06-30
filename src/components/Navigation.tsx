
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Mountain, Car, Home, Upload } from 'lucide-react';

interface NavigationProps {
  currentView: 'home' | 'montagne' | 'rallye' | 'general' | 'import';
  onViewChange: (view: 'home' | 'montagne' | 'rallye' | 'general' | 'import') => void;
}

const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const navItems = [
    { id: 'home' as const, label: 'Accueil', icon: Home },
    { id: 'general' as const, label: 'Classement Général', icon: Trophy },
    { id: 'montagne' as const, label: 'Courses de Côte', icon: Mountain },
    { id: 'rallye' as const, label: 'Rallyes', icon: Car },
    { id: 'import' as const, label: 'Import Excel', icon: Upload },
  ];

  return (
    <Card className="card-glass p-4 mb-8">
      <nav className="flex flex-wrap justify-center gap-2 md:gap-4">
        {navItems.map(({ id, label, icon: Icon }) => (
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
    </Card>
  );
};

export default Navigation;
