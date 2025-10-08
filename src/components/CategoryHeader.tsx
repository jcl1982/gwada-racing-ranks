interface CategoryHeaderProps {
  displayTitle: string;
  championshipYear: string;
}

const CategoryHeader = ({ displayTitle, championshipYear }: CategoryHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold gradient-caribbean bg-clip-text text-transparent mb-2">{displayTitle}</h1>
      <p className="text-xl text-gray-600">Saison {championshipYear}</p>
    </div>
  );
};

export default CategoryHeader;
