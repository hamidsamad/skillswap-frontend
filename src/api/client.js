import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL || '';
const baseURL = rawBase
  ? (rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/+$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillswap_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 safely
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Only clear credentials upon genuine 401 on protected resources,
    // avoiding false logouts on failed login attempts or public endpoints
    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register') &&
      !originalRequest.url.includes('/auth/demo-login') &&
      !originalRequest.url.includes('/auth/google')
    ) {
      console.warn('Session expired or unauthorized on protected route. Clearing token.');
      localStorage.removeItem('skillswap_token');
      localStorage.removeItem('skillswap_user');
      localStorage.removeItem('skillswap_profile');

      // Dispatch custom event so AuthContext can notify UI if needed
      window.dispatchEvent(new CustomEvent('skillswap:auth_expired'));
    }

    return Promise.reject(error);
  }
);

export default api;
