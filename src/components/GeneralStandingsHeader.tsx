import PartnerLogos from "./PartnerLogos";

interface GeneralStandingsHeaderProps {
  championshipTitle: string;
  championshipYear: string;
  subtitle?: string;
}

const GeneralStandingsHeader = ({ championshipTitle, championshipYear, subtitle }: GeneralStandingsHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <PartnerLogos />
      <h1 className="font-serif text-3xl sm:text-5xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-3 tracking-tight">
        {championshipTitle}
      </h1>
      <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-primary via-accent to-primary mb-3" />
      <p className="text-sm sm:text-base uppercase tracking-[0.2em] text-muted-foreground font-medium">
        {subtitle || `Classement Général ${championshipYear}`}
      </p>
    </div>
  );
};


export default GeneralStandingsHeader;
