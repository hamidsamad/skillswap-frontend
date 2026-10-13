import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import SkillExchangeLogo from '../components/SkillExchangeLogo';

export default function AdminLoginPage() {
  const { login, demoLogin, user, isAuthenticated, isAdmin, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(location.state?.unauthorizedWarning || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in as administrator, go directly to Admin Panel
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          // Immediately revoke session because this portal is admin-only
          logout();
          setError('Access Denied: Account lacks administrator privileges. Please sign in via the User Portal.');
        }
      } else {
        setError(res.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred during administrative login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdminDemo = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const res = await demoLogin('admin');
      if (res.success && res.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        setError('Failed to initialize demo administrator session.');
      }
    } catch (err) {
      setError('Error during demo admin authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#FAF9F5] dark:bg-[#080B14] text-[#24364B] dark:text-slate-100 selection:bg-[#07866D] selection:text-white relative transition-colors duration-200">
      <div className="ambient-mesh" aria-hidden="true" />

      {/* Top Floating Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-xl bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 text-[#102B50] dark:text-slate-200 hover:bg-[#EAF6EF] dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-[#102B50]" />
          )}
        </button>
      </div>

      <div className="w-full max-w-[480px] card-clean p-6 sm:p-8 relative z-10 shadow-xl">
        
        {/* Header Icon & Branding */}
        <div className="text-center space-y-3 pb-6 border-b border-[#E5EAE7] dark:border-slate-800">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 p-2 shadow-sm">
            <SkillExchangeLogo className="w-full h-full" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#102B50] dark:text-white font-display tracking-tight">
                SkillSwap PK
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-[#07866D] text-white font-black text-[10px] tracking-wider uppercase shadow-xs">
                Admin
              </span>
            </div>
            <p className="text-xs text-[#708096] dark:text-slate-400 mt-1 font-medium">
              Administrative Control & Moderation Portal
            </p>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="mt-5 panel-mint flex items-start gap-2.5 text-xs text-[#07866D] dark:text-emerald-300">
          <Lock className="w-4 h-4 shrink-0 mt-0.5 text-[#07866D] dark:text-emerald-400" />
          <p className="leading-snug">
            Restricted administrative area. All access attempts and moderation actions are logged in the immutable security audit log.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-[#DC5555]/30 dark:border-rose-800/40 flex items-center gap-2.5 text-xs font-semibold text-[#DC5555] dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#102B50] dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Admin Email
            </label>
            <div className="rounded-xl border border-[#E5EAE7] dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2.5 flex items-center gap-2.5 focus-within:border-[#07866D] focus-within:ring-2 focus-within:ring-[#07866D]/15 transition-all">
              <Mail className="w-4 h-4 text-[#708096] dark:text-slate-400 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@skillswap.pk"
                className="w-full text-xs sm:text-sm text-[#102B50] dark:text-white placeholder-[#708096] dark:placeholder-slate-500 font-medium bg-transparent outline-none p-0 leading-tight"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#102B50] dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="rounded-xl border border-[#E5EAE7] dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2.5 flex items-center gap-2.5 focus-within:border-[#07866D] focus-within:ring-2 focus-within:ring-[#07866D]/15 transition-all">
              <KeyRound className="w-4 h-4 text-[#708096] dark:text-slate-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs sm:text-sm text-[#102B50] dark:text-white placeholder-[#708096] dark:placeholder-slate-500 font-medium bg-transparent outline-none p-0 leading-tight"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#708096] hover:text-[#102B50] dark:hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="btn-emerald w-full !py-3 !rounded-xl !text-sm font-bold shadow-md cursor-pointer disabled:opacity-60 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Access Admin Panel</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Admin Login */}
        <div className="mt-5 pt-5 border-t border-[#E5EAE7] dark:border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-[#708096] dark:text-slate-400 uppercase tracking-wider">
              Quick Admin Access
            </span>
            <span className="text-[10px] text-[#07866D] dark:text-emerald-400 font-bold">1-Click Test Access</span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdminDemo}
            disabled={isSubmitting || loading}
            className="w-full p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#131B2E] border border-[#E5EAE7] dark:border-slate-800 hover:border-[#07866D]/40 hover:bg-[#EAF6EF]/50 dark:hover:bg-slate-800/80 transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/60 border border-[#07866D]/30 text-[#07866D] dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                UG
              </div>
              <div>
                <div className="text-xs font-bold text-[#102B50] dark:text-white group-hover:text-[#07866D] dark:group-hover:text-emerald-400 transition-colors">
                  Usman Ghani
                </div>
                <div className="text-[10px] text-[#708096] dark:text-slate-400">admin@skillswap.pk</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#07866D] dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>

        {/* Link back to User Portal */}
        <div className="mt-6 pt-4 border-t border-[#E5EAE7] dark:border-slate-800 text-center">
          <p className="text-xs text-[#708096] dark:text-slate-400">
            Are you a standard member?{' '}
            <Link
              to="/login"
              className="font-bold text-[#07866D] hover:text-[#086B57] dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline transition-colors"
            >
              Go to User Portal
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
