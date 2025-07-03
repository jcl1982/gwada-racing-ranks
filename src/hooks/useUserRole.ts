
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'admin' | 'user' | null;

export const useUserRole = () => {
  const authData = useAuth();

  // Ensure we return a consistent object structure
  return {
    user: authData.user,
    userRole: authData.userRole,
    isAdmin: authData.isAdmin,
    isAuthenticated: authData.isAuthenticated,
    loading: authData.loading
  };
};
