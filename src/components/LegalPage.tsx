import { Card } from '@/components/ui/card';
import { Building2, UserRound, Server, Phone, Scale } from 'lucide-react';

const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
      <Icon size={20} className="text-primary shrink-0" />
      {title}
    </h2>
    <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">{children}</div>
  </section>
);

const LegalPage = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="card-glass p-6 sm:p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg gradient-racing text-white">
            <Scale size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mentions légales</h1>
            <p className="text-muted-foreground text-sm">
              Informations éditeur et hébergeur — Championnats LSAG
            </p>
          </div>
        </div>

        <Section icon={Building2} title="Éditeur du site">
          <p>
            Le présent site est édité par la <strong className="text-foreground">Ligue Sport Automobile
            de Guadeloupe (« LSAG »)</strong>, association organisatrice des championnats de sport
            automobile publiés sur ce site.
          </p>
          <p>
            <strong className="text-foreground">Contact :</strong>{' '}
            <a href="tel:+590690532123" className="text-primary hover:underline">0690 53 21 23</a>
          </p>
        </Section>

        <Section icon={UserRound} title="Directeur de la publication">
          <p>
            <strong className="text-foreground">Jérôme CLEONIS</strong>
          </p>
        </Section>

        <Section icon={Phone} title="Contact">
          <p>
            Pour toute question relative au site, aux classements ou aux données personnelles,
            vous pouvez contacter la LSAG par téléphone au{' '}
            <a href="tel:+590690532123" className="text-primary hover:underline">0690 53 21 23</a>.
          </p>
          <p className="text-xs">
            Pour l'exercice de vos droits sur vos données personnelles, consultez également notre
            page « Confidentialité ».
          </p>
        </Section>

        <Section icon={Server} title="Hébergement">
          <p>
            Le site est hébergé par <strong className="text-foreground">Lovable Cloud</strong>
            {' '}(Lovable, siège social à Stockholm, Suède — lovable.app), avec stockage des données
            sportives sur l'infrastructure cloud <strong className="text-foreground">Supabase</strong>.
          </p>
        </Section>

        <Section icon={Scale} title="Propriété et responsabilités">
          <p>
            Les contenus publiés (résultats, classements, règlements, visuels) sont la propriété de
            la LSAG et de leurs auteurs respectifs. Toute reproduction des contenus à des fins de
            promotion des championnats est autorisée avec mention de la source.
          </p>
          <p>
            La LSAG s'efforce d'assurer l'exactitude des classements publiés, qui restent toutefois
            provisoires jusqu'à validation officielle des résultats par les organisateurs d'épreuves.
          </p>
        </Section>

        <p className="text-xs text-muted-foreground border-t border-border pt-4">
          Dernière mise à jour : septembre 2026.
        </p>
      </Card>
    </div>
  );
};

export default LegalPage;
