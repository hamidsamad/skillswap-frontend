import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Terminal,
  UserCheck
} from 'lucide-react';
import SkillExchangeLogo from '../components/SkillExchangeLogo';

export default function AdminLoginPage() {
  const { login, demoLogin, user, isAuthenticated, isAdmin, logout, loading } = useAuth();
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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#080B14] text-slate-100 selection:bg-amber-500 selection:text-white relative overflow-hidden">
      {/* Background Security Grid & Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1A2238_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[480px] bg-[#0E1526] rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 relative z-10">
        
        {/* Header Icon & Branding */}
        <div className="text-center space-y-3 pb-6 border-b border-slate-800/80">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-lg shadow-amber-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                SkillSwap PK
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Administrative Control & Moderation Portal
            </p>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="mt-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300">
          <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <p className="leading-snug">
            Restricted administrative area. All access attempts and moderation actions are logged in the immutable security audit log.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs font-semibold text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@skillswap.pk"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-wide uppercase shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
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
        <div className="mt-5 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Admin Access
            </span>
            <span className="text-[10px] text-amber-400 font-semibold">1-Click Test Access</span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdminDemo}
            disabled={isSubmitting || loading}
            className="w-full p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                UG
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                  Usman Ghani
                </div>
                <div className="text-[10px] text-slate-400">admin@skillswap.pk</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform">
              Sign In →
            </span>
          </button>
        </div>

        {/* Link back to User Portal */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Are you a standard member?{' '}
            <Link
              to="/login"
              className="font-bold text-[#07866D] hover:text-emerald-400 hover:underline transition-colors"
            >
              Go to User Portal
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
