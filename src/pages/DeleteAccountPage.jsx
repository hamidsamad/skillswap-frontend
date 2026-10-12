import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  FileCheck,
  MessageSquare,
  Users
} from 'lucide-react';

export default function DeleteAccountPage() {
  const { user, profile, deleteAccount, loading } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('Please check the confirmation box acknowledging this action is permanent.');
      return;
    }

    if (!password) {
      setError('Please provide your current account password to proceed.');
      return;
    }

    const res = await deleteAccount(password);
    if (res.success) {
      navigate('/login', {
        replace: true,
        state: {
          deletedMsg: 'Your SkillSwap Pakistan account and profile data have been permanently deleted.'
        }
      });
    } else {
      setError(res.message || 'Account deletion failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Back link */}
      <div>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#708096] dark:text-slate-400 hover:text-[#102B50] dark:hover:text-white transition-colors min-h-[36px] py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile & Settings</span>
        </Link>
      </div>

      {/* Main Danger Card */}
      <div className="card-clean border-[#DC5555]/30 overflow-hidden shadow-sm">
        <div className="h-2 bg-[#DC5555] w-full" />

        <div className="p-4 xs:p-6 sm:p-10 space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="flex items-start gap-3 xs:gap-4">
            <div className="w-11 h-11 xs:w-13 xs:h-13 rounded-2xl bg-rose-50 text-[#DC5555] flex items-center justify-center shrink-0 border border-[#DC5555]/20 shadow-xs">
              <ShieldAlert className="w-6 h-6 xs:w-7 xs:h-7 text-[#DC5555]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-[#DC5555] border border-[#DC5555]/20">
                  Danger Zone
                </span>
              </div>
              <h1 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-[#102B50] dark:text-white mt-1">
                Delete SkillSwap Account
              </h1>
              <p className="text-xs text-[#708096] dark:text-slate-400 mt-1">
                Permanently remove your account, profile, and barter matrix from SkillSwap Pakistan.
              </p>
            </div>
          </div>

          {/* Account Details Being Purged */}
          <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-slate-900/60 border border-[#E5EAE7] dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-[10px] font-black uppercase text-[#708096] dark:text-slate-400 tracking-wider">Account To Be Deleted</p>
              <p className="text-sm font-extrabold text-[#102B50] dark:text-white break-all">{user?.name} ({user?.email})</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#07866D] dark:text-emerald-400 bg-[#EAF6EF] dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-[#07866D]/20 dark:border-emerald-800/40 inline-block">
                City: {profile?.city || 'Pakistan'}
              </span>
            </div>
          </div>

          {/* Impact Overview Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#102B50] dark:text-slate-300">
              What happens when you delete your account:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-1.5">
                <Users className="w-4 h-4 text-[#DC5555]" />
                <h4 className="text-xs font-extrabold text-[#102B50] dark:text-white">Profile Purge</h4>
                <p className="text-[11px] text-[#708096] dark:text-slate-400">
                  Your teaching skills, learning goals, and bio are permanently deleted.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-1.5">
                <FileCheck className="w-4 h-4 text-[#DC5555]" />
                <h4 className="text-xs font-extrabold text-[#102B50] dark:text-white">Agreements Terminated</h4>
                <p className="text-[11px] text-[#708096] dark:text-slate-400">
                  All active and pending barter agreements are immediately cancelled.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-1.5">
                <MessageSquare className="w-4 h-4 text-[#DC5555]" />
                <h4 className="text-xs font-extrabold text-[#102B50] dark:text-white">Sessions Closed</h4>
                <p className="text-[11px] text-[#708096] dark:text-slate-400">
                  Tokens are invalidated and ongoing chat sessions with partners closed.
                </p>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-[#DC5555]/30 dark:border-rose-800/40 rounded-2xl flex items-center gap-3 text-xs font-semibold text-[#DC5555] dark:text-rose-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Deletion Form */}
          <form onSubmit={handleDelete} className="space-y-6 pt-2">
            {/* Agreement Checkbox */}
            <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-[#DC5555]/20 dark:border-rose-900/40 flex items-start gap-3">
              <input
                id="agree-delete"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-[#DC5555] rounded border-[#E5EAE7] dark:border-slate-700 focus:ring-[#DC5555] cursor-pointer accent-[#DC5555]"
              />
              <label htmlFor="agree-delete" className="text-xs text-[#24364B] dark:text-slate-200 font-medium cursor-pointer">
                I understand that this action is <strong className="text-[#DC5555] font-bold">permanent and irreversible</strong>. I confirm that I want to delete my SkillSwap Pakistan account and remove all personal records.
              </label>
            </div>

            {/* Password Confirmation */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] dark:text-slate-400 mb-1.5">
                Confirm Your Current Password
              </label>
              <div className="relative max-w-md">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#708096] dark:text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#DC5555] transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-[#708096] dark:text-slate-400 hover:text-[#102B50] dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse xs:flex-row items-center gap-3 pt-4 border-t border-[#E5EAE7] dark:border-slate-800">
              <Link
                to="/profile"
                className="btn-white w-full xs:w-auto !py-2.5 min-h-[44px] !px-5 !text-xs !rounded-xl text-center flex items-center justify-center"
              >
                Cancel & Keep My Account
              </Link>

              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                className="w-full xs:w-auto px-6 py-2.5 min-h-[44px] rounded-xl bg-[#DC5555] hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Deletion...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Delete My Account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
