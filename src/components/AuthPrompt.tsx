
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, LogIn } from 'lucide-react';

interface AuthPromptProps {
  message?: string;
  showLoginButton?: boolean;
  onLogin?: () => void;
}

const AuthPrompt = ({ 
  message = "Vous devez vous connecter pour accéder à cette fonctionnalité.",
  showLoginButton = true,
  onLogin 
}: AuthPromptProps) => {
  return (
    <Card className="card-glass p-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <Shield className="h-12 w-12 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-700">Accès restreint</h3>
        <p className="text-gray-600 max-w-md">{message}</p>
        {showLoginButton && (
          <Button onClick={onLogin} className="flex items-center gap-2">
            <LogIn size={16} />
            Se connecter
          </Button>
        )}
      </div>
    </Card>
  );
};

export default AuthPrompt;
