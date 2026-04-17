import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

const PDF_URL = '/reglement/LSAG_REGLEMENT_CHAMPIONNATS_2026.pdf';

const ReglementPage = () => {
  return (
    <div className="space-y-6">
      <Card className="card-glass p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg gradient-caribbean text-white">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Règlement des Championnats 2026</h1>
              <p className="text-muted-foreground text-sm">
                Consultez et téléchargez le règlement officiel LSAG
              </p>
            </div>
          </div>
          <Button asChild className="gradient-caribbean text-white">
            <a href={PDF_URL} download="LSAG_REGLEMENT_CHAMPIONNATS_2026.pdf">
              <Download className="mr-2" size={18} />
              Télécharger le PDF
            </a>
          </Button>
        </div>

        <div className="w-full rounded-lg overflow-hidden border border-border bg-muted">
          <object
            data={PDF_URL}
            type="application/pdf"
            className="w-full"
            style={{ height: '80vh', minHeight: '600px' }}
            aria-label="Règlement des Championnats 2026"
          >
            <iframe
              src={PDF_URL}
              title="Règlement des Championnats 2026"
              className="w-full h-full"
              style={{ minHeight: '600px' }}
            />
            <div className="p-6 text-center">
              <p className="mb-4">
                Votre navigateur ne peut pas afficher le PDF directement.
              </p>
              <Button asChild>
                <a href={PDF_URL} target="_blank" rel="noopener noreferrer">
                  Ouvrir le règlement dans un nouvel onglet
                </a>
              </Button>
            </div>
          </object>
        </div>
      </Card>
    </div>
  );
};

export default ReglementPage;
