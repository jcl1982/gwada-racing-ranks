
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

interface PrintButtonProps {
  onClick: () => void;
  variant?: 'default' | 'outline';
  className?: string;
}

const PrintButton = ({ onClick, variant = 'outline', className = '' }: PrintButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      className={`flex items-center gap-2 ${className}`}
    >
      <FileDown size={16} />
      Exporter PDF
    </Button>
  );
};

export default PrintButton;
