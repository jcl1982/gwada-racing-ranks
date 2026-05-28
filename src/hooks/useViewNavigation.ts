import { useState, useEffect, useCallback } from 'react';

export type ViewType = 'home' | 'montagne' | 'rallye' | 'general' | 'r2' | 'import' | 'admin' | 'acceleration' | 'karting' | 'admin-acceleration' | 'admin-karting' | 'archives' | 'admin-hub' | 'reglement';

const VALID_VIEWS: ViewType[] = ['home', 'montagne', 'rallye', 'general', 'r2', 'import', 'admin', 'acceleration', 'karting', 'admin-acceleration', 'admin-karting', 'archives', 'admin-hub', 'reglement'];

const getViewFromHash = (): ViewType => {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace('#', '') as ViewType;
  return VALID_VIEWS.includes(hash) ? hash : 'home';
};

export const useViewNavigation = () => {
  const [currentView, setCurrentViewState] = useState<ViewType>(getViewFromHash);

  useEffect(() => {
    const onHashChange = () => setCurrentViewState(getViewFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const setCurrentView = useCallback((view: ViewType) => {
    setCurrentViewState(view);
    const newHash = view === 'home' ? '' : `#${view}`;
    if (window.location.hash !== newHash) {
      window.history.pushState(null, '', `${window.location.pathname}${window.location.search}${newHash}`);
    }
  }, []);

  return {
    currentView,
    setCurrentView
  };
};
