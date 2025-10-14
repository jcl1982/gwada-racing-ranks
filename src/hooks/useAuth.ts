
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'user' | null;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    console.log('🔐 [useAuth] Initializing auth hook...');

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('🔐 [useAuth] Auth state changed:', { event, hasSession: !!session });
        
        // Only synchronous state updates here
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer Supabase calls with setTimeout to prevent deadlocks
        if (session?.user) {
          setTimeout(() => {
            if (mounted) {
              fetchUserRole(session.user.id);
            }
          }, 0);
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initSession = async () => {
      try {
        console.log('🔐 [useAuth] Checking for existing session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log('🔐 [useAuth] Existing session:', { hasSession: !!session, userId: session?.user?.id });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('❌ [useAuth] Error initializing session:', error);
      } finally {
        if (mounted) {
          console.log('🔐 [useAuth] Initialization complete, setting loading to false');
          setLoading(false);
        }
      }
    };

    initSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('🔐 [useAuth] Fetching role for user:', userId);
      
      // Petit délai pour s'assurer que la session est établie côté serveur
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      console.log('🔐 [useAuth] Role query result:', { data, error, userId });

      if (error) {
        if (error.code === 'PGRST116') {
          // Pas de rôle trouvé, utiliser 'user' par défaut
          console.log('⚠️ [useAuth] No role found, defaulting to user');
          setUserRole('user');
        } else {
          console.error('❌ [useAuth] Error fetching user role:', error);
          console.error('❌ [useAuth] Error details:', JSON.stringify(error, null, 2));
          setUserRole('user');
        }
      } else {
        const role = data?.role || 'user';
        console.log('✅ [useAuth] User role fetched:', role);
        setUserRole(role);
      }
    } catch (error) {
      console.error('❌ [useAuth] Exception fetching user role:', error);
      setUserRole('user');
    } finally {
      // CRITICAL: Always set loading to false after fetching role
      console.log('🔐 [useAuth] Role fetch complete, setting loading to false');
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    try {
      // Nettoyer l'état local immédiatement
      setSession(null);
      setUser(null);
      setUserRole(null);
      
      // Tenter la déconnexion Supabase
      const { error } = await supabase.auth.signOut();
      
      // Ignorer les erreurs de session manquante (déjà déconnecté)
      if (error && !error.message.includes('session_not_found')) {
        console.error('Sign out error:', error);
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign out exception:', error);
      // Même en cas d'erreur, l'état local est nettoyé
      return { error: null };
    }
  };

  return {
    user,
    session,
    userRole,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    isAdmin: userRole === 'admin'
  };
};
