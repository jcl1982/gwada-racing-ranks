
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'admin' | 'user' | null;

export const useUserRole = () => {
  const { user, userRole, isAuthenticated, loading, isAdmin } = useAuth();

  return {
    user,
    userRole,
    isAdmin,
    isAuthenticated,
    loading
  };
};
