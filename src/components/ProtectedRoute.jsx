import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute: Ensures normal users are authenticated before accessing protected pages (Chat, Swaps, Profile).
 * If the authenticated user is an administrator, redirects them to the Admin Panel.
 */
export default function ProtectedRoute({ children }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5] dark:bg-[#080B14]">
        <div className="w-10 h-10 border-4 border-[#07866D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If user is an administrator, enforce panel separation by redirecting to Admin Panel
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
