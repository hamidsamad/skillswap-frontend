import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  X, 
  Mail, 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ShieldCheck 
} from 'lucide-react';

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = '', onSuccess }) {
  const [step, setStep] = useState('request'); // 'request' | 'verify' | 'success'
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [devCode, setDevCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync initial email when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialEmail) {
        setEmail(initialEmail);
      }
      setStep('request');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccessMsg('');
      setDevCode('');
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  // Step 1: Request reset code
  const handleRequestCode = async (e) => {
    e?.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setDevCode(res.data.resetCode || '');
        setSuccessMsg(res.data.message || 'Verification code sent!');
        setStep('verify');
      } else {
        setError(res.data.message || 'Failed to send reset code');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with code
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetCode || resetCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        resetCode: resetCode.trim(),
        newPassword
      });

      if (res.data.success) {
        setStep('success');
        if (onSuccess) {
          onSuccess(email, newPassword);
        }
      } else {
        setError(res.data.message || 'Password reset failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (devCode) {
      navigator.clipboard?.writeText(devCode);
      setResetCode(devCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#0E1526] rounded-3xl border border-[#E5EAE7] dark:border-slate-800 shadow-2xl overflow-hidden relative max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 xs:top-4 right-3 xs:right-4 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-[#708096] hover:text-[#102B50] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="p-4 xs:p-6 sm:p-8">
          {/* Header Icon */}
          <div className="text-center mb-6">
            <div className="w-13 h-13 rounded-2xl bg-[#EAF6EF] text-[#07866D] border border-[#07866D]/20 flex items-center justify-center mx-auto mb-3 shadow-xs">
              {step === 'success' ? (
                <ShieldCheck className="w-6 h-6 text-[#16855F]" />
              ) : step === 'verify' ? (
                <KeyRound className="w-6 h-6 animate-pulse" />
              ) : (
                <Lock className="w-6 h-6" />
              )}
            </div>

            <h2 className="text-2xl font-black text-[#102B50] dark:text-white">
              {step === 'request' && 'Reset Your Password'}
              {step === 'verify' && 'Verify Code & Set Password'}
              {step === 'success' && 'Password Reset Complete!'}
            </h2>
            <p className="text-xs text-[#708096] dark:text-slate-400 mt-1 font-medium">
              {step === 'request' && 'Enter your registered email and we will generate a recovery code.'}
              {step === 'verify' && `We've sent a 6-digit recovery code to ${email}`}
              {step === 'success' && 'Your account password has been successfully updated.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-[#DC5555]/30 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-[#DC5555]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ================= STEP 1: REQUEST CODE ================= */}
          {step === 'request' && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#708096]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ali.khan@skillswap.pk"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-emerald w-full !py-3 min-h-[44px] !rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-bold text-[#708096] hover:text-[#102B50]"
                >
                  Remembered your password? <span className="text-[#07866D] underline">Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 2: VERIFY CODE & NEW PASSWORD ================= */}
          {step === 'verify' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Dev Preview Helper Banner */}
              {devCode && (
                <div className="p-3 bg-[#EAF6EF] dark:bg-emerald-950/40 border border-[#07866D]/20 dark:border-emerald-800/40 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#07866D] dark:text-emerald-400 block">
                      Preview Verification Code:
                    </span>
                    <span className="font-mono font-bold text-sm text-[#102B50] dark:text-white tracking-widest">
                      {devCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-2.5 py-1.5 rounded-xl bg-[#07866D] hover:bg-[#086B57] text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Auto-filled' : 'Auto-fill'}</span>
                  </button>
                </div>
              )}

              {/* 6-Digit Code */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] mb-1.5">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-[#708096]" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs font-mono tracking-widest text-[#102B50] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] transition-all font-bold"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] mb-1.5">
                  New Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#708096]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-[#708096] hover:text-[#102B50]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#708096]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-2.5 text-[#708096] hover:text-[#102B50]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-emerald w-full !py-3 min-h-[44px] !rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="font-bold text-[#708096] hover:text-[#102B50]"
                >
                  ← Change Email
                </button>
                <button
                  type="button"
                  onClick={handleRequestCode}
                  disabled={loading}
                  className="font-bold text-[#07866D] hover:underline"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 3: SUCCESS CONFIRMATION ================= */}
          {step === 'success' && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#EAF6EF] border-2 border-[#16855F]/30 flex items-center justify-center mx-auto text-[#16855F]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-extrabold text-[#102B50] dark:text-white">
                  Password Updated Successfully!
                </p>
                <p className="text-xs text-[#708096] dark:text-slate-400">
                  You can now log into your SkillSwap account with your new password.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn-emerald w-full !py-3 min-h-[44px] !rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
