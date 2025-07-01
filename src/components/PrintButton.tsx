
import { Button } from '@/components/ui/button';
import { FileDown, Image, ChevronDown, Printer, Type } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PrintButtonProps {
  onPrintPdf: () => void;
  onPrintImage?: () => void;
  onPrintWeb?: () => void;
  onPrintUnicode?: () => void;
  variant?: 'default' | 'outline';
  className?: string;
}

const PrintButton = ({ 
  onPrintPdf, 
  onPrintImage, 
  onPrintWeb, 
  onPrintUnicode,
  variant = 'outline', 
  className = '' 
}: PrintButtonProps) => {
  // Si aucune option supplémentaire, afficher le bouton simple PDF
  if (!onPrintImage && !onPrintWeb && !onPrintUnicode) {
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

  // Afficher le menu déroulant avec toutes les options
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
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuItem onClick={onPrintPdf}>
          <FileDown size={16} className="mr-2" />
          Exporter en PDF
        </DropdownMenuItem>
        {onPrintImage && (
          <DropdownMenuItem onClick={onPrintImage}>
            <Image size={16} className="mr-2" />
            Exporter en Image
          </DropdownMenuItem>
        )}
        {onPrintWeb && (
          <DropdownMenuItem onClick={onPrintWeb}>
            <Printer size={16} className="mr-2" />
            Imprimer la page
          </DropdownMenuItem>
        )}
        {onPrintUnicode && (
          <DropdownMenuItem onClick={onPrintUnicode}>
            <Type size={16} className="mr-2" />
            Impression Unicode
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PrintButton;
