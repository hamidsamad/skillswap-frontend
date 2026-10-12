import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, X, AlertCircle } from 'lucide-react';

export default function ReauthModal() {
  const { showReauthModal, setShowReauthModal, login, user } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!showReauthModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const email = user?.email || 'ali.khan@skillswap.pk';
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      setShowReauthModal(false);
      setPassword('');
    } else {
      setError(res.message || 'Invalid password. Try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white/95 dark:bg-[#0D1424]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 rounded-3xl w-full max-w-md p-4 xs:p-6 sm:p-7 shadow-2xl shadow-sky-950/20 relative animate-in fade-in zoom-in-95 duration-200 max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
        <button
          onClick={() => setShowReauthModal(false)}
          className="absolute top-3 xs:top-5 right-3 xs:right-5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="p-3 bg-gradient-to-br from-sky-500/10 to-teal-500/10 text-sky-600 dark:text-sky-400 rounded-2xl border border-sky-500/20 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight">Session Verification</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Re-authenticate to securely save your profile changes</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-2.5 text-sm text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Account Email
            </label>
            <input
              type="text"
              disabled
              value={user?.email || 'ali.khan@skillswap.pk'}
              className="w-full px-4 py-2.5 bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password (e.g. SwapPass123!)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 outline-none transition-all"
            />
          </div>

          <div className="pt-3 flex flex-col-reverse xs:flex-row gap-2.5 xs:gap-3">
            <button
              type="button"
              onClick={() => setShowReauthModal(false)}
              className="w-full xs:flex-1 px-4 py-2.5 min-h-[42px] text-sm font-semibold border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full xs:flex-1 px-4 py-2.5 min-h-[42px] text-sm font-semibold text-white bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 rounded-xl shadow-lg shadow-sky-500/25 transition-all duration-200 disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {submitting ? 'Verifying...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
