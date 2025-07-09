
import { useState } from 'react';

export type ViewType = 'home' | 'montagne' | 'rallye' | 'general' | 'c2r2' | 'import' | 'admin';

export const useViewNavigation = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');

  return {
    currentView,
    setCurrentView
  };
};
