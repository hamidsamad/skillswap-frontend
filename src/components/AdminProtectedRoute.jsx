import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminProtectedRoute: Strictly enforces role-based access control for administrative areas.
 * - If not authenticated: Redirects to /admin/login.
 * - If authenticated as a normal user: Blocks access and redirects to /matches with an unauthorized warning.
 * - Only users with verified role === 'admin' are permitted to enter.
 */
export default function AdminProtectedRoute({ children }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080B14]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-amber-400">Verifying Administrator Permissions...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> send to Admin Login portal
  if (!token || !user) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  // Authenticated, but ordinary user without admin privileges -> Block completely
  if (user.role !== 'admin') {
    return (
      <Navigate
        to="/matches"
        state={{
          unauthorizedWarning: 'Access Denied: Administrator role required to view that area.'
        }}
        replace
      />
    );
  }

  return children;
}
