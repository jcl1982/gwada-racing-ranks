import { ShieldCheck, Scale } from 'lucide-react';
import { ViewType } from '@/hooks/useViewNavigation';

interface SiteFooterProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const SiteFooter = ({ currentView, onViewChange }: SiteFooterProps) => {
  const linkClass = (id: ViewType) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all duration-300 ${
      currentView === id
        ? 'text-primary bg-primary/10'
        : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
    }`;

  return (
    <footer className="card-glass mt-8 py-6 px-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
            LSAG — Championnats Sport Automobile
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            © {new Date().getFullYear()} Ligue Sport Automobile de Guadeloupe
          </p>
        </div>

        <nav className="flex items-center gap-2" aria-label="Liens légaux">
          <button
            onClick={() => onViewChange('confidentialite')}
            aria-label="Politique de confidentialité"
            className={linkClass('confidentialite')}
          >
            <ShieldCheck className="w-4 h-4" />
            Confidentialité
          </button>
          <button
            onClick={() => onViewChange('mentions-legales')}
            aria-label="Mentions légales"
            className={linkClass('mentions-legales')}
          >
            <Scale className="w-4 h-4" />
            Mentions légales
          </button>
        </nav>
      </div>
    </footer>
  );
};

export default SiteFooter;
