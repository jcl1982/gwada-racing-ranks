
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Mountain, Car, CircleDot, Zap } from 'lucide-react';

interface RaceTypeSelectorProps {
  selectedType: 'montagne' | 'rallye' | 'karting' | 'acceleration';
  onTypeChange: (type: 'montagne' | 'rallye' | 'karting' | 'acceleration') => void;
}

const RaceTypeSelector = ({ selectedType, onTypeChange }: RaceTypeSelectorProps) => {
  return (
    <Card className="card-glass">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">Type de course à importer</h3>
        <RadioGroup
          value={selectedType}
          onValueChange={(value) => onTypeChange(value as 'montagne' | 'rallye' | 'karting' | 'acceleration')}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-green-50 transition-colors">
            <RadioGroupItem value="montagne" id="montagne" />
            <Label htmlFor="montagne" className="flex items-center gap-2 cursor-pointer">
              <Mountain className="w-5 h-5 text-green-600" />
              <span>Trophée de la montagne</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-blue-50 transition-colors">
            <RadioGroupItem value="rallye" id="rallye" />
            <Label htmlFor="rallye" className="flex items-center gap-2 cursor-pointer">
              <Car className="w-5 h-5 text-blue-600" />
              <span>Trophée des rallyes</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-yellow-50 transition-colors">
            <RadioGroupItem value="karting" id="karting" />
            <Label htmlFor="karting" className="flex items-center gap-2 cursor-pointer">
              <CircleDot className="w-5 h-5 text-yellow-600" />
              <span>Karting</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-red-50 transition-colors">
            <RadioGroupItem value="acceleration" id="acceleration" />
            <Label htmlFor="acceleration" className="flex items-center gap-2 cursor-pointer">
              <Zap className="w-5 h-5 text-red-600" />
              <span>Accélération</span>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default RaceTypeSelector;
