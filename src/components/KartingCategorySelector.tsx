import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface KartingCategorySelectorProps {
  selectedCategory: 'MINI 60' | 'SENIOR MASTER GENTLEMAN' | 'KZ2';
  onCategoryChange: (category: 'MINI 60' | 'SENIOR MASTER GENTLEMAN' | 'KZ2') => void;
}

const KartingCategorySelector = ({ selectedCategory, onCategoryChange }: KartingCategorySelectorProps) => {
  return (
    <Card className="card-glass">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">Catégorie Karting</h3>
        <RadioGroup
          value={selectedCategory}
          onValueChange={(value) => onCategoryChange(value as 'MINI 60' | 'SENIOR MASTER GENTLEMAN' | 'KZ2')}
          className="flex gap-4 flex-wrap"
        >
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-purple-50 transition-colors">
            <RadioGroupItem value="MINI 60" id="mini60" />
            <Label htmlFor="mini60" className="cursor-pointer">
              MINI 60
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-blue-50 transition-colors">
            <RadioGroupItem value="SENIOR MASTER GENTLEMAN" id="senior" />
            <Label htmlFor="senior" className="cursor-pointer">
              SENIOR MASTER GENTLEMAN
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-red-50 transition-colors">
            <RadioGroupItem value="KZ2" id="kz2" />
            <Label htmlFor="kz2" className="cursor-pointer">
              KZ2
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default KartingCategorySelector;
