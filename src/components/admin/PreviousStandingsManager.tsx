import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Save, Info, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PreviousStandingsManagerProps {
  onSaveCurrentStandings: () => Promise<void>;
  onResetDriversEvolution: () => Promise<void>;
  onRestorePreviousStandings: () => Promise<void>;
}

const PreviousStandingsManager = ({ onSaveCurrentStandings, onResetDriversEvolution, onRestorePreviousStandings }: PreviousStandingsManagerProps) => {
  const handleSaveStandings = async () => {
    try {
      console.log('🎯 BOUTON CLIQUÉ: Début de handleSaveStandings');
      console.log('🔧 FONCTION REÇUE:', typeof onSaveCurrentStandings);
      
      await onSaveCurrentStandings();
      
      console.log('✅ BOUTON: Sauvegarde terminée avec succès');
    } catch (error) {
      console.error('❌ BOUTON: Erreur dans handleSaveStandings:', error);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save size={20} />
          Gestion des Classements Précédents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Pour voir l'évolution des positions dans les classements, vous devez d'abord sauvegarder 
            le classement actuel comme référence. Cette action remplacera les classements précédents existants.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Sauvegardez le classement actuel pour permettre le calcul de l'évolution des positions 
              lors des prochaines mises à jour.
            </p>
            
            <Button
              onClick={() => {
                console.log('🚨 BOUTON CLIQUÉ IMMÉDIATEMENT !');
                handleSaveStandings();
              }}
              className="w-full"
              variant="outline"
            >
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder le Classement Actuel
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Restaurez le classement précédemment sauvegardé. 
              <strong className="text-destructive"> Attention : Cette action supprimera tous les résultats de course actuels.</strong>
            </p>
            
            <Button
              onClick={handleRestoreStandings}
              className="w-full"
              variant="outline"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restaurer le Classement Sauvegardé
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Réinitialisez l'évolution des pilotes pour remettre à zéro les flèches d'évolution. 
              Tous les pilotes afficheront un tiret dans la colonne évolution.
            </p>
            
            <Button
              onClick={handleResetEvolution}
              className="w-full"
              variant="destructive"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Réinitialiser l'Évolution
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreviousStandingsManager;