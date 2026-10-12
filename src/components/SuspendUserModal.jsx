import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  Lock,
  UserCheck
} from 'lucide-react';
import api from '../api/client';
import UserAvatar from './UserAvatar';

export default function SuspendUserModal({
  isOpen,
  onClose,
  targetUser,
  onSuccess
}) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !targetUser) return null;

  const isCurrentlySuspended = Boolean(targetUser.isSuspended);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isCurrentlySuspended && (!reason || reason.trim().length < 5)) {
      setErrorMsg('A detailed reason (at least 5 characters) is required for moderation records.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.patch(`/admin/users/${targetUser._id}/suspend`, {
        suspend: !isCurrentlySuspended,
        reason: reason.trim()
      });

      if (res.data.success) {
        if (onSuccess) {
          onSuccess(res.data.user);
        }
        onClose();
      } else {
        setErrorMsg(res.data.message || 'Action failed');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Server error while executing moderation action');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-7 shadow-2xl relative text-[#24364B] dark:text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 text-[#708096] hover:text-[#102B50] dark:hover:text-slate-200 rounded-full hover:bg-[#FAF9F5] dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-3 rounded-2xl ${
              isCurrentlySuspended
                ? 'bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border border-[#07866D]/20'
                : 'bg-rose-50 dark:bg-rose-950/40 text-[#DC5555] dark:text-rose-400 border border-[#DC5555]/20'
            }`}
          >
            {isCurrentlySuspended ? <UserCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#102B50] dark:text-white font-display">
              {isCurrentlySuspended ? 'Reactivate Account' : 'Suspend User Account'}
            </h3>
            <p className="text-xs text-[#708096] dark:text-slate-400">
              Administrative Moderation Safeguard
            </p>
          </div>
        </div>

        {/* User Summary Card */}
        <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 flex items-center gap-3 mb-4">
          <UserAvatar user={targetUser} size="md" className="ring-1 ring-[#07866D]/30" />
          <div className="min-w-0">
            <h4 className="font-extrabold text-xs sm:text-sm text-[#102B50] dark:text-white truncate">
              {targetUser.name}
            </h4>
            <p className="text-[11px] text-[#708096] dark:text-slate-400 truncate">
              {targetUser.email}
            </p>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mt-1 border ${
                isCurrentlySuspended
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-[#DC5555] dark:text-rose-400 border-[#DC5555]/30'
                  : 'bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border-[#07866D]/30'
              }`}
            >
              Current Status: {isCurrentlySuspended ? 'Suspended' : 'Active'}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/50 text-xs text-[#DC5555] dark:text-rose-300 font-bold mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isCurrentlySuspended ? (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#708096] dark:text-slate-400 mb-1.5">
                Reason for Account Suspension *
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Specify policy violation reason (e.g. Confirmed payment scam, repeated abusive messages, impersonation)..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#102B50] dark:text-white outline-none focus:ring-2 focus:ring-[#DC5555]/20 focus:border-[#DC5555] font-medium resize-none"
              />
              <p className="text-[10px] text-[#708096] dark:text-slate-400 mt-1">
                This reason will be logged in the immutable audit trail and shown to the user if they attempt to sign in.
              </p>
            </div>
          ) : (
            <p className="text-xs text-[#24364B] dark:text-slate-300 leading-relaxed">
              Are you sure you want to reactivate <strong className="text-[#102B50] dark:text-white">{targetUser.name}</strong>'s account? Their platform login and barter exchange capabilities will be immediately restored.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-white flex-1 !py-2.5 !text-xs text-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 !py-2.5 !text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
                isCurrentlySuspended
                  ? 'btn-emerald'
                  : 'bg-[#DC5555] hover:bg-rose-600 text-white shadow-xs'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isCurrentlySuspended ? (
                <span>Confirm Reactivation</span>
              ) : (
                <span>Confirm Suspension</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
