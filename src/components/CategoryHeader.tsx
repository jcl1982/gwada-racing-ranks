import PartnerLogos from './PartnerLogos';

interface CategoryHeaderProps {
  displayTitle: string;
  championshipYear: string;
  subtitle?: string;
}

const CategoryHeader = ({ displayTitle, championshipYear, subtitle }: CategoryHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <PartnerLogos />
      <h1 className="font-serif text-3xl sm:text-5xl gradient-caribbean bg-clip-text text-transparent mb-3 tracking-tight">
        {displayTitle}
      </h1>
      <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-primary via-accent to-primary mb-3" />
      <p className="text-sm sm:text-base uppercase tracking-[0.2em] text-muted-foreground font-medium">
        {subtitle || `Saison ${championshipYear}`}
      </p>
    </div>
  );
};


export default CategoryHeader;
