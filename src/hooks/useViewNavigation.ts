
import { useState } from 'react';

export type ViewType = 'home' | 'montagne' | 'rallye' | 'general' | 'import' | 'admin';

export const useViewNavigation = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');

  return {
    currentView,
    setCurrentView
  };
};
