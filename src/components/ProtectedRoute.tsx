import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

const normalizeRole = (role?: string): string => {
  if (!role) return '';
  const normalized = role.trim().toUpperCase().replace(/^ROLE_/, '');
  if (normalized === 'SALES') return 'KINHDOANH';
  if (normalized === 'MANAGER') return 'DIEUHANH';
  return normalized;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = normalizeRole(user.maVaiTro);

  // ADMIN always has full system access – bypass all role checks
  if (normalizedRole === 'ADMIN') {
    return <>{children}</>;
  }

  const allowedSet = new Set(allowedRoles.map(normalizeRole));
  const hasRequiredRole = allowedSet.has(normalizedRole);

  if (!hasRequiredRole) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Forbidden</h2>
          <p className="text-gray-600">Bạn không có quyền truy cập vào trang này.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
