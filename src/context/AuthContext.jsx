import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Synchronous localStorage hydration to prevent route flicker
  const [token, setToken] = useState(() => localStorage.getItem('skillswap_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('skillswap_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  });
  const [profile, setProfile] = useState(() => {
    try {
      const p = localStorage.getItem('skillswap_profile');
      return p ? JSON.parse(p) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);

  // Sync token to api & load latest me/profile on startup
  useEffect(() => {
    if (token) {
      refreshMe();
    }
  }, [token]);

  // Listen for safe auth expired events
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setProfile(null);
      setToken(null);
      setShowReauthModal(true);
    };

    window.addEventListener('skillswap:auth_expired', handleExpired);
    return () => window.removeEventListener('skillswap:auth_expired', handleExpired);
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        localStorage.setItem('skillswap_user', JSON.stringify(res.data.user));
        localStorage.setItem('skillswap_profile', JSON.stringify(res.data.profile));
      }
    } catch (err) {
      // Handled by Axios response interceptor if 401
    }
  }, []);

  const setAuthData = (newToken, newUser, newProfile) => {
    setToken(newToken);
    setUser(newUser);
    setProfile(newProfile);

    localStorage.setItem('skillswap_token', newToken);
    localStorage.setItem('skillswap_user', JSON.stringify(newUser));
    if (newProfile) {
      localStorage.setItem('skillswap_profile', JSON.stringify(newProfile));
    }
    setShowReauthModal(false);
  };

  function extractErrorMessage(err, fallback = 'An unexpected error occurred') {
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.response?.data?.error) {
      return err.response.data.error;
    }
    if (typeof err.response?.data === 'string' && (err.response.data.includes('proxy error') || err.response.data.includes('ECONNREFUSED'))) {
      return 'Backend server is starting or unreachable. Please verify backend is running on port 5000.';
    }
    if (err.response?.status === 404) {
      return 'API endpoint not found (404). Please verify that the backend server is running and reachable.';
    }
    if (err.response?.status === 405) {
      return 'Request reached a static host instead of a backend server (405). Please configure VITE_API_URL pointing to the live backend.';
    }
    if (err.response?.status === 502 || err.response?.status === 503 || err.response?.status === 504) {
      return `Backend server is temporarily unavailable (${err.response.status}). Please check server status.`;
    }
    if (err.response?.status === 500) {
      return err.response?.data?.message || 'The backend server encountered an error (500). Please check database connectivity or try again in a few seconds.';
    }
    if (err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout')) {
      return 'Server request timed out. Please check your network connection.';
    }
    if (err.code === 'ERR_NETWORK') {
      return 'Cannot connect to backend server. Make sure the backend server is running on port 5000.';
    }
    if (err.message && !err.message.includes('status code')) {
      return err.message;
    }
    if (err.message) {
      return `${fallback}: ${err.message}`;
    }
    return fallback;
  }

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setAuthData(res.data.token, res.data.user, res.data.profile);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: extractErrorMessage(err, 'Invalid email or password or server error')
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        setAuthData(res.data.token, res.data.user, res.data.profile);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err) {
      return {
        success: false,
        message: extractErrorMessage(err, 'Registration error')
      };
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role = 'ali') => {
    setLoading(true);
    try {
      const res = await api.post('/auth/demo-login', { role });
      if (res.data.success) {
        setAuthData(res.data.token, res.data.user, res.data.profile);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || 'Demo login failed' };
    } catch (err) {
      return {
        success: false,
        message: extractErrorMessage(err, 'Demo login error')
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (password) => {
    setLoading(true);
    try {
      const res = await api.delete('/auth/delete-account', { data: { password } });
      if (res.data.success) {
        logout();
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Account deletion failed' };
    } catch (err) {
      return {
        success: false,
        message: extractErrorMessage(err, 'Error deleting account')
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    localStorage.removeItem('skillswap_token');
    localStorage.removeItem('skillswap_user');
    localStorage.removeItem('skillswap_profile');
  };

  const updateProfileData = (updatedProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('skillswap_profile', JSON.stringify(updatedProfile));
  };

  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('skillswap_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        profile,
        loading,
        isAuthenticated: Boolean(token && user),
        isAdmin: user?.role === 'admin',
        login,
        register,
        demoLogin,
        deleteAccount,
        logout,
        refreshMe,
        updateProfileData,
        updateUserData,
        showReauthModal,
        setShowReauthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
