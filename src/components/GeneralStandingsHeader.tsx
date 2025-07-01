
interface GeneralStandingsHeaderProps {
  championshipTitle: string;
  championshipYear: string;
}

const GeneralStandingsHeader = ({ championshipTitle, championshipYear }: GeneralStandingsHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold gradient-caribbean bg-clip-text text-transparent mb-2">
        {championshipTitle}
      </h1>
      <p className="text-xl text-gray-600">Classement Général de la LSAG {championshipYear}</p>
    </div>
  );
};

export default GeneralStandingsHeader;
