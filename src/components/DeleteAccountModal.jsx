import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Trash2, 
  AlertTriangle, 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

export default function DeleteAccountModal({ isOpen, onClose }) {
  const { user, deleteAccount, loading } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your current password to confirm deletion');
      return;
    }

    const res = await deleteAccount(password);
    if (res.success) {
      handleClose();
      navigate('/login', {
        replace: true,
        state: {
          deletedMsg: 'Your SkillSwap Pakistan account and personal data have been permanently deleted.'
        }
      });
    } else {
      setError(res.message || 'Failed to delete account');
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#0E1526] rounded-3xl border border-[#DC5555]/30 shadow-2xl overflow-hidden relative max-h-[calc(100dvh-3rem)] sm:max-h-[88vh] my-auto overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Danger Accent Bar */}
        <div className="h-2 bg-[#DC5555] w-full" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 xs:top-4 right-3 xs:right-4 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-[#708096] hover:text-[#102B50] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 xs:p-6 sm:p-8 space-y-6">
          {/* Header Icon & Title */}
          <div className="flex items-start gap-3 xs:gap-4">
            <div className="w-11 h-11 xs:w-12 xs:h-12 rounded-2xl bg-rose-50 text-[#DC5555] flex items-center justify-center shrink-0 border border-[#DC5555]/20 shadow-xs">
              <ShieldAlert className="w-5 h-5 xs:w-6 xs:h-6 text-[#DC5555]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#102B50] dark:text-white">
                Delete Account
              </h2>
              <p className="text-xs text-[#DC5555] font-bold uppercase tracking-wider mt-0.5">
                Permanent & Irreversible Action
              </p>
            </div>
          </div>

          {/* Warning Card */}
          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2 text-xs text-[#24364B] dark:text-slate-200">
            <div className="flex items-center gap-2 font-bold text-[#DC5555]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Are you absolutely sure you want to proceed?</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-[11px] text-[#708096] dark:text-slate-400 pl-1">
              <li>
                Your profile, skills matrix, and personal information for <strong className="text-[#102B50] dark:text-white font-bold">{user?.email}</strong> will be wiped.
              </li>
              <li>
                All pending and active swap agreements will be immediately cancelled.
              </li>
              <li>
                Your account cannot be recovered or restored once deleted.
              </li>
            </ul>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-[#DC5555]/30 dark:border-rose-800/40 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-[#DC5555] dark:text-rose-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Password Confirmation Form */}
          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] dark:text-slate-400 mb-1.5">
                Confirm Your Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#708096] dark:text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
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
              <p className="text-[10px] text-[#708096] dark:text-slate-400 mt-1">
                Identity verification is mandatory to prevent accidental or unauthorized deletion.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse xs:flex-row items-center gap-2.5 xs:gap-3 pt-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="btn-white w-full xs:w-1/2 !py-2.5 min-h-[42px] !text-xs !rounded-xl"
              >
                Cancel & Keep Account
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full xs:w-1/2 py-2.5 min-h-[42px] px-4 rounded-xl bg-[#DC5555] hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
