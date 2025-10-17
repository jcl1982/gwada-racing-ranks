
import { useState } from 'react';

export type ViewType = 'home' | 'montagne' | 'rallye' | 'general' | 'r2' | 'import' | 'admin' | 'acceleration' | 'karting' | 'admin-acceleration' | 'admin-karting';

export const useViewNavigation = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');

  return {
    currentView,
    setCurrentView
  };
};
