

interface GeneralStandingsHeaderProps {
  championshipTitle: string;
  championshipYear: string;
}

const GeneralStandingsHeader = ({ championshipTitle, championshipYear }: GeneralStandingsHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
        {championshipTitle} - Classement provisoire
      </h1>
      <p className="text-xl text-gray-600">Classement Général Provisoire de la LSAG {championshipYear}</p>
    </div>
  );
};

export default GeneralStandingsHeader;

