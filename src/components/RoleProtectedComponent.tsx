
import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';

interface RoleProtectedComponentProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

const RoleProtectedComponent = ({ 
  children, 
  requiredRole = 'user', 
  fallback = null,
  showLoading = true 
}: RoleProtectedComponentProps) => {
  const { userRole, isAuthenticated, loading } = useUserRole();

  // Show loading state while checking authentication
  if (loading) {
    if (showLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="text-sm text-gray-500">Vérification des permissions...</div>
        </div>
      );
    }
    // Don't show fallback during loading to avoid flashing "Access Denied"
    return null;
  }

  // Only check authentication after loading is complete
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  // Check if user has required role
  if (requiredRole === 'admin' && userRole !== 'admin') {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

export default RoleProtectedComponent;
