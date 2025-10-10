import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SaveStandingsDialog from './SaveStandingsDialog';
import StandingsSavesList from './StandingsSavesList';

interface PreviousStandingsManagerProps {
  onSaveCurrentStandings: (saveName?: string) => Promise<void>;
  onResetDriversEvolution: () => Promise<void>;
  onRestorePreviousStandings: () => Promise<void>;
  championshipId?: string;
}

const PreviousStandingsManager = ({ onSaveCurrentStandings, onResetDriversEvolution, onRestorePreviousStandings, championshipId }: PreviousStandingsManagerProps) => {
  const handleSaveStandings = async (saveName?: string) => {
    try {
      console.log('🎯 Début de la sauvegarde:', { saveName });
      
      await onSaveCurrentStandings(saveName);
      
      console.log('✅ Sauvegarde terminée avec succès');
    } catch (error) {
      console.error('❌ Erreur dans handleSaveStandings:', error);
    }
  };

  const handleResetEvolution = async () => {
    try {
      console.log('🔄 BOUTON CLIQUÉ: Début de handleResetEvolution');
      
      await onResetDriversEvolution();
      
      console.log('✅ BOUTON: Réinitialisation terminée avec succès');
    } catch (error) {
      console.error('❌ BOUTON: Erreur dans handleResetEvolution:', error);
    }
  };

  const handleRestoreStandings = async () => {
    try {
      console.log('⏮️ BOUTON CLIQUÉ: Début de handleRestoreStandings');
      
      await onRestorePreviousStandings();
      
      console.log('✅ BOUTON: Restauration terminée avec succès');
    } catch (error) {
      console.error('❌ BOUTON: Erreur dans handleRestoreStandings:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={20} />
            Sauvegardes et Restauration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Nouveau système de sauvegardes :</strong> Créez plusieurs points de restauration pour votre championnat. 
              En cas d'erreur, vous pourrez revenir à n'importe quelle sauvegarde précédente.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>1.</strong> Créez une sauvegarde du classement actuel avant toute manipulation importante.
            </p>
            <SaveStandingsDialog onSave={handleSaveStandings} />
          </div>
        </CardContent>
      </Card>

      <StandingsSavesList 
        championshipId={championshipId}
        onRestore={onRestorePreviousStandings}
      />
    </div>
  );
};

export default PreviousStandingsManager;