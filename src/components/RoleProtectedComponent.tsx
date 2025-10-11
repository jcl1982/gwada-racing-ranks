
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

  console.log('🔒 [RoleProtected] State:', { loading, isAuthenticated, userRole, requiredRole });

  // CRITICAL: Always show loading during initial auth check
  // This prevents flashing "Access Denied" before auth completes
  if (loading) {
    console.log('🔒 [RoleProtected] Still loading auth state...');
    if (showLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="text-sm text-gray-500">Vérification des permissions...</div>
        </div>
      );
    }
    return null;
  }

  // After loading completes, check authentication
  if (!isAuthenticated) {
    console.log('🔒 [RoleProtected] User not authenticated, showing fallback');
    return fallback ? <>{fallback}</> : null;
  }

  // Check if user has required role
  if (requiredRole === 'admin' && userRole !== 'admin') {
    console.log('🔒 [RoleProtected] User is not admin, showing fallback');
    return fallback ? <>{fallback}</> : null;
  }

  console.log('🔒 [RoleProtected] Access granted, rendering children');
  return <>{children}</>;
};

export default RoleProtectedComponent;
