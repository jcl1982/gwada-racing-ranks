import { Card } from '@/components/ui/card';
import { ShieldCheck, Database, Cookie, UserCheck, Mail, Globe } from 'lucide-react';

const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
      <Icon size={20} className="text-primary shrink-0" />
      {title}
    </h2>
    <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">{children}</div>
  </section>
);

const PrivacyPage = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="card-glass p-6 sm:p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg gradient-racing text-white">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Politique de confidentialité</h1>
            <p className="text-muted-foreground text-sm">
              Protection des données personnelles (RGPD) — Championnats LSAG
            </p>
          </div>
        </div>

        <Section icon={UserCheck} title="Responsable de traitement">
          <p>
            Le responsable du traitement des données personnelles collectées sur ce site est la
            LSAG (Ligue Sport Automobile de Guadeloupe). Pour toute question relative à vos
            données, vous pouvez nous contacter via les coordonnées indiquées sur nos supports
            officiels.
          </p>
        </Section>

        <Section icon={Database} title="Données collectées et finalités">
          <p>
            <strong className="text-foreground">Résultats sportifs publics :</strong> les noms, prénoms,
            équipes, numéros, véhicules et résultats des pilotes et copilotes sont publiés dans le cadre
            de l'organisation et de la promotion des championnats (intérêt légitime, résultats
            officiels d'épreuves sportives).
          </p>
          <p>
            <strong className="text-foreground">Comptes administrateurs :</strong> l'adresse email et le
            mot de passe (chiffré) des administrateurs sont utilisés uniquement pour sécuriser
            l'accès à la gestion du site.
          </p>
          <p>
            Aucune donnée n'est vendue, cédée ou utilisée à des fins publicitaires ou de prospection
            commerciale.
          </p>
        </Section>

        <Section icon={Cookie} title="Cookies et stockage local">
          <p>
            Ce site n'utilise <strong className="text-foreground">aucun cookie publicitaire ni traceur
            d'audience tiers</strong>. Seuls des éléments strictement nécessaires au fonctionnement sont
            enregistrés sur votre appareil :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Session de connexion des administrateurs ;</li>
            <li>Préférence de thème (clair / sombre) ;</li>
            <li>Préférences d'affichage de l'interface.</li>
          </ul>
          <p>
            Ces éléments étant indispensables au service, ils ne nécessitent pas de bandeau de
            consentement et peuvent être supprimés à tout moment via votre navigateur.
          </p>
        </Section>

        <Section icon={Globe} title="Sous-traitants et hébergement">
          <p>
            Le site est hébergé par Lovable et les données sont stockées dans une base Supabase
            (infrastructure cloud sécurisée, chiffrement en transit). Les polices de caractères sont
            fournies par Google Fonts, ce qui implique une requête technique vers les serveurs de
            Google lors du chargement des pages.
          </p>
        </Section>

        <Section icon={UserCheck} title="Vos droits">
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement,
            de limitation et d'opposition concernant vos données personnelles. Vous pouvez exercer
            ces droits en nous contactant via nos canaux officiels. Vous pouvez également introduire
            une réclamation auprès de la CNIL (www.cnil.fr).
          </p>
        </Section>

        <Section icon={Mail} title="Durée de conservation">
          <p>
            Les résultats sportifs sont conservés pour la durée de validité sportive des championnats
            et de leurs archives historiques. Les comptes administrateurs sont conservés tant que
            l'accès est actif, puis supprimés sur demande ou lors de la clôture du service.
          </p>
        </Section>

        <p className="text-xs text-muted-foreground border-t border-border pt-4">
          Dernière mise à jour : septembre 2026.
        </p>
      </Card>
    </div>
  );
};

export default PrivacyPage;
