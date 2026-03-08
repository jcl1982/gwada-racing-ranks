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
      <h1 className="text-4xl font-bold gradient-caribbean bg-clip-text text-transparent mb-2">{displayTitle}</h1>
      <p className="text-xl text-muted-foreground">{subtitle || `Saison ${championshipYear}`}</p>
    </div>
  );
};

export default CategoryHeader;
