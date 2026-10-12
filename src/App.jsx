import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Route Guards & Fallback
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import PageLoader from './components/PageLoader';

// Lazy-Loaded Public & Auth Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// Lazy-Loaded User Panel Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const MatchFinderPage = lazy(() => import('./pages/MatchFinderPage'));
const SkillsDirectoryPage = lazy(() => import('./pages/SkillsDirectoryPage'));
const SwapAgreementsPage = lazy(() => import('./pages/SwapAgreementsPage'));
const LiveChatPage = lazy(() => import('./pages/LiveChatPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DeleteAccountPage = lazy(() => import('./pages/DeleteAccountPage'));

// Lazy-Loaded Admin Panel Pages
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));

/**
 * App: Top-level routing architecture strictly separating the User Panel and Admin Panel.
 * - Normal users access only the User Panel (UserLayout + ProtectedRoute).
 * - Administrators access only the Admin Panel (AdminLayout + AdminProtectedRoute).
 * - Full role-based isolation is enforced across routes, layouts, and backend endpoints.
 */
export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
      {/* ======================================================== */}
      {/* 1. PUBLIC AUTHENTICATION ROUTES                         */}
      {/* ======================================================== */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ======================================================== */}
      {/* 2. ISOLATED ADMIN PANEL (ADMINISTRATORS ONLY)           */}
      {/* ======================================================== */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* ======================================================== */}
      {/* 3. USER PANEL (MEMBERS & MARKETPLACE VISITORS)          */}
      {/* ======================================================== */}
      <Route element={<UserLayout />}>
        {/* Public Marketplace Views */}
        <Route path="/" element={<HomePage />} />
        <Route path="/matches" element={<MatchFinderPage />} />
        <Route path="/skills" element={<SkillsDirectoryPage />} />

        {/* Authenticated Member Views */}
        <Route
          path="/swaps"
          element={
            <ProtectedRoute>
              <SwapAgreementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <LiveChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delete-account"
          element={
            <ProtectedRoute>
              <DeleteAccountPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
