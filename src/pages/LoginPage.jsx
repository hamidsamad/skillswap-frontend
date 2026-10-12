import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Info,
  Layers,
  GraduationCap,
  Compass,
  User,
  UserPlus
} from 'lucide-react';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { triggerGoogleOAuth } from '../utils/googleAuth';

export default function LoginPage() {
  const { login, googleLogin, user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(location.state?.unauthorizedWarning || '');
  const [successBanner, setSuccessBanner] = useState(location.state?.deletedMsg || '');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/matches', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (location.state?.deletedMsg) {
      setSuccessBanner(location.state.deletedMsg);
    }
    if (location.state?.unauthorizedWarning) {
      setError(location.state.unauthorizedWarning);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessBanner('');
    const res = await login(email, password);
    if (res.success) {
      if (res.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/matches', { replace: true });
      }
    } else {
      setError(res.message || 'Login failed');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccessBanner('');
    setGoogleLoading(true);
    try {
      // 1. Open genuine Google account picker & consent flow
      const { access_token } = await triggerGoogleOAuth();

      // 2. Authenticate real Google identity on backend and get user session
      const res = await googleLogin({ access_token });
      if (res.success) {
        if (res.user?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/matches', { replace: true });
        }
      } else {
        setError(res.message || 'Google authentication failed');
      }
    } catch (err) {
      // Clean cancellation or error message without logging into any demo account
      setError(err.message || 'Google authentication was cancelled or failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-3 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-12 bg-[#F6F8F6]/80 dark:bg-[#080B14] transition-colors duration-200">
      {/* Central Split-Screen Card Matching Reference Image */}
      <div className="w-full max-w-[960px] bg-white dark:bg-[#0E1526] rounded-2xl xs:rounded-3xl md:rounded-[32px] border border-[#EAEFEA] dark:border-slate-800 shadow-[0_20px_60px_-15px_rgba(15,36,59,0.07)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: SkillSwap PK Branding & Visual Showcase      */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 p-4 xs:p-6 sm:p-8 md:p-9 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#EAEFEA] dark:border-slate-800 bg-[#FAFCFA]/60 dark:bg-[#0A0F1D]/80">
          <div className="space-y-4 sm:space-y-5">
            {/* 1. SkillSwap PK Logo Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0F243B] dark:bg-slate-800 p-2 flex items-center justify-center shadow-xs shrink-0">
                <img
                  src="/skillswap-icon.png"
                  alt="SkillSwap Logo"
                  className="w-full h-full object-contain filter invert brightness-125"
                />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-[22px] text-[#0F243B] dark:text-white tracking-tight font-display">
                    SkillSwap
                  </span>
                  <span className="bg-[#D8EFE4] dark:bg-emerald-950/60 text-[#0E7057] dark:text-emerald-400 text-[11px] font-bold px-1.5 py-0.5 rounded-md leading-none border border-transparent dark:border-emerald-800/40">
                    PK
                  </span>
                </div>
                <div className="text-[10px] font-bold tracking-widest text-[#64748B] dark:text-slate-400 uppercase mt-0.5">
                  SKILL EXCHANGE
                </div>
              </div>
            </div>

            {/* 2. Pakistan's 1st Skill Exchange Platform Badge */}
            <div>
              <div className="inline-flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 py-1 rounded-full bg-[#EDF7F2] dark:bg-emerald-950/40 border border-[#D5EAE0] dark:border-emerald-800/40 text-[#0D634C] dark:text-emerald-400 text-[10px] xs:text-[11px] sm:text-xs font-semibold shadow-xs">
                {/* Crisp Vector Pakistan Flag */}
                <svg className="w-4 h-2.5 rounded-[2px] shrink-0 shadow-2xs" viewBox="0 0 300 200">
                  <rect width="300" height="200" fill="#01411C" />
                  <rect width="75" height="200" fill="#FFFFFF" />
                  <circle cx="187.5" cy="100" r="60" fill="#FFFFFF" />
                  <circle cx="202.5" cy="88" r="54" fill="#01411C" />
                  <polygon
                    points="207,64 213,82 231,82 216,93 222,111 207,100 192,111 198,93 183,82 201,82"
                    fill="#FFFFFF"
                  />
                </svg>
                <span>Pakistan's 1st Skill Exchange Platform</span>
                <Info className="w-3.5 h-3.5 text-[#0D634C]/70 dark:text-emerald-400/70 shrink-0" />
              </div>
            </div>

            {/* 3. Main Welcome Heading & Tagline */}
            <div>
              <h1 className="text-2xl xs:text-3xl sm:text-[34px] lg:text-[38px] font-extrabold text-[#0F243B] dark:text-white leading-[1.15] tracking-tight font-display">
                Welcome to <br />
                SkillSwap PK
              </h1>
              <p className="text-xs sm:text-sm text-[#4A5568] dark:text-slate-300 mt-2 sm:mt-2.5 leading-snug">
                Exchange skills. Build connections. <br />
                Grow together.
              </p>
            </div>

            {/* 4. Three Benefit Icons Horizontal Row */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EDF7F2] dark:bg-emerald-950/50 text-[#0E7057] dark:text-emerald-400 flex items-center justify-center mb-1.5 shadow-2xs transition-transform hover:scale-105">
                  <Layers className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-[#0F243B] dark:text-white">Learn</span>
                <span className="text-[10px] xs:text-[11px] text-[#64748B] dark:text-slate-400">New Skills</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EDF7F2] dark:bg-emerald-950/50 text-[#0E7057] dark:text-emerald-400 flex items-center justify-center mb-1.5 shadow-2xs transition-transform hover:scale-105">
                  <GraduationCap className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-[#0F243B] dark:text-white">Share</span>
                <span className="text-[10px] xs:text-[11px] text-[#64748B] dark:text-slate-400">Your Skills</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EDF7F2] dark:bg-emerald-950/50 text-[#0E7057] dark:text-emerald-400 flex items-center justify-center mb-1.5 shadow-2xs transition-transform hover:scale-105">
                  <Compass className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-[#0F243B] dark:text-white">Build</span>
                <span className="text-[10px] xs:text-[11px] text-[#64748B] dark:text-slate-400">Your Future</span>
              </div>
            </div>

            {/* 5. Pakistani Landmark & Students Illustration */}
            <div className="w-full rounded-2xl overflow-hidden shadow-xs border border-[#E2ECE5] dark:border-slate-800 bg-white dark:bg-[#0E1526]">
              <img
                src="/skillswap-hero.jpg"
                alt="SkillSwap PK students collaborating"
                className="w-full h-36 xs:h-44 sm:h-48 object-cover object-center"
              />
            </div>
          </div>

          {/* 6. Handwritten Script Slogan with Organic Underline */}
          <div className="pt-3 sm:pt-4 pb-1 text-center">
            <div className="relative inline-block">
              <span className="font-hand text-2xl sm:text-[26px] text-[#0E4759] dark:text-emerald-400 font-bold tracking-wide -rotate-2 inline-block">
                Together We Grow
              </span>
              <svg
                className="w-full h-3 -mt-1 text-[#0E7057] dark:text-emerald-500"
                viewBox="0 0 160 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8.5C38 3.5 125 3 157 7.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Authentication Form & Quick Demo Personas   */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 p-4 xs:p-6 sm:p-8 md:p-9 flex flex-col justify-between bg-white dark:bg-[#0E1526]">
          <div>
            {/* 1. Top Right Header: "Already have an account? Sign In" */}
            <div className="flex items-center justify-end gap-2 mb-4">
              <span className="text-xs text-[#708096] dark:text-slate-400">Already have an account?</span>
              <button
                type="button"
                onClick={() => {}}
                className="px-3 py-1 rounded-full border border-[#0E7057] dark:border-emerald-500 text-[#0E7057] dark:text-emerald-400 text-xs font-bold hover:bg-[#EDF7F2] dark:hover:bg-emerald-950/40 transition-colors"
              >
                Sign In
              </button>
            </div>

            {/* 2. Top Tabs: Sign In (Active) vs Register */}
            <div className="flex items-center gap-8 border-b border-[#EAEFEA] dark:border-slate-800 mb-5">
              <button
                type="button"
                className="relative pb-2.5 text-sm font-bold text-[#0F243B] dark:text-white transition-colors"
              >
                Sign In
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0E7057] rounded-full" />
              </button>
              <Link
                to="/register"
                className="pb-2.5 text-sm font-semibold text-[#708096] dark:text-slate-400 hover:text-[#0F243B] dark:hover:text-white transition-colors"
              >
                Register
              </Link>
            </div>

            {/* 3. Section Title & Subtitle */}
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F243B] dark:text-white font-display">
                Sign In to Your Account
              </h2>
              <p className="text-xs text-[#708096] dark:text-slate-400 mt-1">
                Welcome back! Please enter your details to continue.
              </p>
            </div>

            {/* Success & Error Banners */}
            {successBanner && (
              <div className="mb-4 p-3 bg-[#EDF7F2] dark:bg-emerald-950/40 border border-[#0E7057]/30 dark:border-emerald-800/40 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-[#0E7057] dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successBanner}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-[#DC5555]/30 dark:border-rose-800/40 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-[#DC5555] dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 4. Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Email Address Field */}
              <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2.5 flex items-center gap-3 focus-within:border-[#0E7057] focus-within:ring-2 focus-within:ring-[#0E7057]/15 transition-all">
                <div className="p-1 rounded-md text-[#708096] dark:text-slate-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-semibold text-[#708096] dark:text-slate-400 leading-none mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full text-xs sm:text-sm text-[#0F243B] dark:text-white placeholder-[#94A3B8] dark:placeholder-slate-500 font-medium outline-none bg-transparent p-0 leading-tight"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2.5 flex items-center gap-3 focus-within:border-[#0E7057] focus-within:ring-2 focus-within:ring-[#0E7057]/15 transition-all">
                <div className="p-1 rounded-md text-[#708096] dark:text-slate-400 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-semibold text-[#708096] dark:text-slate-400 leading-none mb-1">
                    Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full text-xs sm:text-sm text-[#0F243B] dark:text-white placeholder-[#94A3B8] dark:placeholder-slate-500 font-medium outline-none bg-transparent p-0 leading-tight"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#94A3B8] dark:text-slate-400 hover:text-[#0F243B] dark:hover:text-white transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccessBanner('');
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-semibold text-[#0E7057] dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Primary CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-[#0E7057] hover:bg-[#0A5743] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-[#0E7057]/25 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-75"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* 5. "or" Divider */}
            <div className="relative my-3.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#EAEFEA] dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-[#0E1526] px-3 text-[#94A3B8] dark:text-slate-400">or</span>
              </div>
            </div>

            {/* 6. Continue with Google Button */}
            <button
              type="button"
              disabled={loading || googleLoading}
              onClick={handleGoogleLogin}
              className="w-full py-2.5 rounded-full border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131B2E] hover:bg-slate-50 dark:hover:bg-[#18233c] text-xs sm:text-sm font-semibold text-[#1E293B] dark:text-white flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>{googleLoading ? 'Connecting with Google...' : 'Continue with Google'}</span>
            </button>

            {/* Bottom "Create a New Account" Section */}
            <div className="mt-3.5 pt-3 border-t border-[#EAEFEA] dark:border-slate-800 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#EDF7F2] dark:bg-emerald-950/50 text-[#0E7057] dark:text-emerald-400 shrink-0 mt-0.5">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-[#0F243B] dark:text-white">Create a New Account</div>
                <p className="text-[11px] text-[#708096] dark:text-slate-400">
                  Join SkillSwap PK and start your learning journey.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0E7057] dark:text-emerald-400 hover:underline mt-1 cursor-pointer"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal (Preserved OTP Flow) */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialEmail={email}
        onSuccess={(resetEmail, newPass) => {
          setEmail(resetEmail);
          setPassword(newPass || '');
          setSuccessBanner('Password reset successfully! You can now sign in.');
          setShowForgotModal(false);
        }}
      />
    </div>
  );
}
