
interface CategoryHeaderProps {
  title: string;
  championshipYear: string;
}

const CategoryHeader = ({ title, championshipYear }: CategoryHeaderProps) => {
  return (
    <div className="text-center mb-8 relative">
      <div className="absolute left-0 top-0">
        <img 
          src="/lovable-uploads/62684b57-67a9-4b26-8c45-289e8ea186da.png" 
          alt="Ligue Sport Automobile Guadeloupe" 
          className="h-16 w-auto object-contain"
        />
      </div>
      <div className="absolute right-0 top-0">
        <img 
          src="/lovable-uploads/174d8472-4f55-4be5-bd4c-6cad2885ed7d.png" 
          alt="FFSA - Fédération Française du Sport Automobile" 
          className="h-16 w-auto object-contain"
        />
      </div>
      <h1 className="text-4xl font-bold gradient-caribbean bg-clip-text text-transparent mb-2">
        {title}
      </h1>
      <p className="text-xl text-gray-600">Saison {championshipYear}</p>
    </div>
  );
};

export default CategoryHeader;
