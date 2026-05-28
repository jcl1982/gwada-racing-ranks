import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Mountain, Car } from 'lucide-react';

interface VmrsRaceTypeSelectorProps {
  selectedType: 'montagne' | 'rallye';
  onTypeChange: (type: 'montagne' | 'rallye') => void;
}

const VmrsRaceTypeSelector = ({ selectedType, onTypeChange }: VmrsRaceTypeSelectorProps) => {
  return (
    <Card className="card-glass">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">Type de course à importer</h3>
        <RadioGroup
          value={selectedType}
          onValueChange={(value) => onTypeChange(value as 'montagne' | 'rallye')}
          className="flex gap-4 flex-wrap"
        >
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-green-50 transition-colors">
            <RadioGroupItem value="montagne" id="vmrs-montagne" />
            <Label htmlFor="vmrs-montagne" className="flex items-center gap-2 cursor-pointer">
              <Mountain className="w-5 h-5 text-green-600" />
              <span>Trophée Montagne VMRS</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-blue-50 transition-colors">
            <RadioGroupItem value="rallye" id="vmrs-rallye" />
            <Label htmlFor="vmrs-rallye" className="flex items-center gap-2 cursor-pointer">
              <Car className="w-5 h-5 text-blue-600" />
              <span>Trophée Rallye VMRS</span>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default VmrsRaceTypeSelector;
