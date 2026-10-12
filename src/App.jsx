import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

// Public & Auth Pages
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegisterPage from './pages/RegisterPage';

// User Panel Pages
import HomePage from './pages/HomePage';
import MatchFinderPage from './pages/MatchFinderPage';
import SkillsDirectoryPage from './pages/SkillsDirectoryPage';
import SwapAgreementsPage from './pages/SwapAgreementsPage';
import LiveChatPage from './pages/LiveChatPage';
import ProfilePage from './pages/ProfilePage';
import DeleteAccountPage from './pages/DeleteAccountPage';

// Admin Panel Pages
import AdminDashboardPage from './pages/AdminDashboardPage';

/**
 * App: Top-level routing architecture strictly separating the User Panel and Admin Panel.
 * - Normal users access only the User Panel (UserLayout + ProtectedRoute).
 * - Administrators access only the Admin Panel (AdminLayout + AdminProtectedRoute).
 * - Full role-based isolation is enforced across routes, layouts, and backend endpoints.
 */
export default function App() {
  return (
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
  );
}
