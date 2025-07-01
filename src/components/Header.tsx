
import { Card } from '@/components/ui/card';

const Header = () => {
  return (
    <Card className="card-glass p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <img 
            src="/lovable-uploads/f44dcff6-2fa0-4905-a56f-9eb4f2cd6f65.png" 
            alt="Ligue Sport Automobile Guadeloupe" 
            className="h-16 w-auto object-contain"
          />
          <img 
            src="/lovable-uploads/6e02b1dc-7545-421e-b907-5716db771b34.png" 
            alt="FFSA - Fédération Française du Sport Automobile" 
            className="h-16 w-auto object-contain"
          />
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold gradient-caribbean bg-clip-text text-transparent">
            Championnat de Guadeloupe
          </h1>
          <p className="text-gray-600">Sport Automobile</p>
        </div>
      </div>
    </Card>
  );
};

export default Header;
