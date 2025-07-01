
import { Button } from '@/components/ui/button';
import { FileDown, Image, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PrintButtonProps {
  onPrintPdf: () => void;
  onPrintImage?: () => void;
  variant?: 'default' | 'outline';
  className?: string;
}

const PrintButton = ({ onPrintPdf, onPrintImage, variant = 'outline', className = '' }: PrintButtonProps) => {
  // Si pas d'export image, afficher le bouton simple
  if (!onPrintImage) {
    return (
      <Button
        onClick={onPrintPdf}
        variant={variant}
        className={`flex items-center gap-2 ${className}`}
      >
        <FileDown size={16} />
        Exporter PDF
      </Button>
    );
  }

  // Si export image disponible, afficher le menu déroulant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          className={`flex items-center gap-2 ${className}`}
        >
          <FileDown size={16} />
          Exporter
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onPrintPdf}>
          <FileDown size={16} className="mr-2" />
          Exporter en PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPrintImage}>
          <Image size={16} className="mr-2" />
          Exporter en Image
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PrintButton;
