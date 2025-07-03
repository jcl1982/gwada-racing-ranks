
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'admin' | 'user' | null;

export const useUserRole = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      setUserRole(null);
      setLoading(false);
      return;
    }

    fetchUserRole(user.id);
  }, [user, authLoading]);

  const fetchUserRole = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user role:', error);
        setUserRole('user'); // Default to user role on error
      } else {
        setUserRole(data?.role || 'user');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userRole === 'admin';

  return {
    user,
    userRole,
    isAdmin,
    isAuthenticated,
    loading: loading || authLoading
  };
};
