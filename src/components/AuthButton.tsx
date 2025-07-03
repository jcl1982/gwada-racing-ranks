
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthPage from './AuthPage';
import { useToast } from '@/hooks/use-toast';

const AuthButton = () => {
  const { user, signOut, loading, isAdmin } = useAuth();
  const [showAuthPage, setShowAuthPage] = useState(false);
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Succès",
        description: "Déconnexion réussie"
      });
    }
  };

  if (loading) {
    return (
      <Button variant="outline" disabled>
        Chargement...
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/70 rounded-lg">
          {isAdmin ? <Shield size={16} className="text-green-600" /> : <User size={16} />}
          <span className="text-sm text-gray-700 hidden sm:inline">
            {user.email}
          </span>
          {isAdmin && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Admin</span>}
        </div>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="flex items-center gap-2"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Déconnexion</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowAuthPage(true)}
        className="flex items-center gap-2"
      >
        <LogIn size={16} />
        <span className="hidden sm:inline">Connexion</span>
      </Button>
      
      {showAuthPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 z-10 bg-white rounded-full"
              onClick={() => setShowAuthPage(false)}
            >
              ×
            </Button>
            <AuthPage onClose={() => setShowAuthPage(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default AuthButton;
