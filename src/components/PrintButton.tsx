
import { Button } from '@/components/ui/button';
import { FileDown, Image, ChevronDown, Printer, Type, FileSpreadsheet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserRole } from '@/hooks/useUserRole';

interface PrintButtonProps {
  onPrintPdf: () => void;
  onPrintImage?: () => void;
  onPrintWeb?: () => void;
  onPrintUnicode?: () => void;
  onPrintExcel?: () => void;
  variant?: 'default' | 'outline';
  className?: string;
  adminOnly?: boolean;
}

const PrintButton = ({ 
  onPrintPdf, 
  onPrintImage, 
  onPrintWeb, 
  onPrintUnicode,
  onPrintExcel,
  variant = 'outline', 
  className = '',
  adminOnly = false
}: PrintButtonProps) => {
  const { isAdmin, isAuthenticated } = useUserRole();

  // If admin only and user is not admin, don't show the button
  if (adminOnly && (!isAuthenticated || !isAdmin)) {
    return null;
  }

  // Si aucune option supplémentaire, afficher le bouton simple PDF
  if (!onPrintImage && !onPrintWeb && !onPrintUnicode && !onPrintExcel) {
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
        {onPrintExcel && (
          <DropdownMenuItem onClick={onPrintExcel}>
            <FileSpreadsheet size={16} className="mr-2" />
            Exporter en Excel
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PrintButton;
