import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Image,
  UploadCloud,
  Trash2,
  Loader2,
  Send,
  FileText,
  Lock
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';

export default function ReportModal({
  isOpen,
  onClose,
  targetUser = null,
  targetContentId = null,
  contentType = 'user',
  contentSnapshot = null,
  onReportSubmitted = null
}) {
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedReport, setSubmittedReport] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const targetUserId = targetUser?._id || (typeof targetUser === 'string' ? targetUser : null);
  const targetUserName = targetUser?.name || 'Member';

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setScreenshot(null);
    setErrorMsg('');
    setSubmittedReport(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Screenshot file size must be less than 5MB.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setScreenshot(uploadEvent.target.result);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setErrorMsg('Please log in to submit a report.');
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMsg('Please provide a brief title describing the issue.');
      return;
    }

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setErrorMsg('Please explain your issue in the description field.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.post('/reports', {
        title: trimmedTitle,
        description: trimmedDescription,
        reason: trimmedDescription,
        screenshot: screenshot || null,
        reportedUserId: targetUserId,
        reportedContentId: targetContentId,
        reportedContentType: contentType,
        reportedContentSnapshot: contentSnapshot
      });

      if (res.data.success) {
        setSubmittedReport(res.data.report || { reportId: 'REP-SUBMITTED', title: trimmedTitle });
        if (onReportSubmitted) {
          onReportSubmitted(res.data.report);
        }
      } else {
        setErrorMsg(res.data.message || 'Failed to submit report');
      }
    } catch (err) {
      console.error('Report submission error:', err);
      const msg = err.response?.data?.message || 'Server error while submitting report. Please try again.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-lg lg:max-w-xl max-h-[calc(100dvh-3.5rem)] sm:max-h-[88vh] my-auto flex flex-col shadow-2xl relative text-[#24364B] dark:text-slate-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Modal Header */}
        <div className="p-3.5 sm:p-4.5 border-b border-[#E5EAE7] dark:border-slate-800 shrink-0 relative flex items-center justify-between pr-14">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 sm:p-2.5 rounded-2xl bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border border-[#07866D]/20 shadow-xs shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 id="report-modal-title" className="text-base sm:text-lg font-extrabold text-[#102B50] dark:text-white font-display truncate">
                {submittedReport ? 'Report Submitted' : 'Report an Issue'}
              </h2>
              <p className="text-[11px] text-[#708096] dark:text-slate-400 truncate">
                Direct assistance from SkillSwap Pakistan administration
              </p>
            </div>
          </div>

          {/* Close Button in Top-Right Corner */}
          <button
            type="button"
            id="report-issue-modal-close-btn"
            onClick={handleClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#102B50] dark:text-white border border-[#E5EAE7] dark:border-slate-700 shadow-2xs transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 z-20 min-w-[36px] min-h-[36px]"
            title="Close modal (Esc)"
            aria-label="Close modal"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-3.5 sm:p-5 overflow-y-auto overscroll-contain flex-1 touch-scroll space-y-3.5">
          {submittedReport ? (
            /* Submission Success State */
            <div className="text-center py-6 sm:py-8 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border border-[#07866D]/30 mx-auto flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#07866D] dark:text-emerald-400 px-2.5 py-1 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/60 border border-[#07866D]/30 font-mono">
                  Report Reference #{submittedReport.reportId}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#102B50] dark:text-white font-display mt-2.5">
                  Report Sent to Administration
                </h3>
                <p className="text-xs sm:text-sm text-[#708096] dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                  Thank you for reporting this issue. The admin team has received your report and is looking into the problem. You will receive an in-app notification when your report is under review and when it is resolved.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#070B16] border border-[#E5EAE7] dark:border-slate-800 text-left text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#708096] dark:text-slate-400 font-bold uppercase text-[10px]">Reference ID:</span>
                  <span className="font-mono font-extrabold text-[#102B50] dark:text-white">#{submittedReport.reportId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#708096] dark:text-slate-400 font-bold uppercase text-[10px]">Issue Title:</span>
                  <span className="font-semibold text-[#102B50] dark:text-white truncate max-w-[240px]">{submittedReport.title || title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#708096] dark:text-slate-400 font-bold uppercase text-[10px]">Current Status:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60">
                    Pending Review
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-emerald w-full !py-2.5 !text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Simple Issue Reporting Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Optional Target Account / Content Context (if opened from user profile or swap) */}
              {targetUser && (
                <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#070B16] border border-[#E5EAE7] dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar user={targetUser} size="sm" className="shrink-0 ring-1 ring-[#07866D]/30" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#708096] dark:text-slate-400 block">
                        Related Account
                      </span>
                      <h4 className="font-extrabold text-xs text-[#102B50] dark:text-white truncate">
                        {targetUserName}
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#708096] dark:text-slate-400">
                    Attached Context
                  </span>
                </div>
              )}

              {contentSnapshot && (
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#070B16] border border-[#E5EAE7] dark:border-slate-800 text-[11px] text-[#708096] dark:text-slate-400">
                  <span className="font-bold text-[#102B50] dark:text-slate-200">Context: </span>
                  <span className="italic">"{typeof contentSnapshot === 'string' ? contentSnapshot : JSON.stringify(contentSnapshot)}"</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/50 flex items-center gap-2 text-xs font-bold text-[#DC5555] dark:text-rose-300 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Issue Title */}
              <div>
                <label className="block text-xs font-bold text-[#102B50] dark:text-slate-200 mb-1">
                  Issue Title <span className="text-[#DC5555]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Messages not sending, Button not working, Login problem..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#070B16] border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#102B50] dark:text-white placeholder-[#708096]/60 outline-none focus:ring-2 focus:ring-[#07866D]/20 focus:border-[#07866D] transition-all font-medium"
                />
              </div>

              {/* 2. Describe Your Issue */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#102B50] dark:text-slate-200">
                    Describe Your Issue <span className="text-[#DC5555]">*</span>
                  </label>
                  <span className="text-[11px] text-[#708096] dark:text-slate-400">
                    {description.length} characters
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the problem in your own words and request help from administration..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#070B16] border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#102B50] dark:text-white placeholder-[#708096]/60 outline-none focus:ring-2 focus:ring-[#07866D]/20 focus:border-[#07866D] transition-all font-medium resize-none"
                />
              </div>

              {/* 3. Attach Screenshot (Optional) */}
              <div>
                <label className="block text-xs font-bold text-[#102B50] dark:text-slate-200 mb-1">
                  Attach Screenshot <span className="text-[#708096] font-normal">(Optional)</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {screenshot ? (
                  /* Image Preview with Remove Button */
                  <div className="relative rounded-2xl border border-[#E5EAE7] dark:border-slate-800 bg-[#FAF9F5] dark:bg-[#070B16] p-2.5 flex items-center gap-3">
                    <img
                      src={screenshot}
                      alt="Screenshot Preview"
                      className="w-16 h-16 object-cover rounded-xl border border-[#E5EAE7] dark:border-slate-700 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#102B50] dark:text-white truncate">
                        Screenshot Attached
                      </p>
                      <p className="text-[11px] text-[#708096] dark:text-slate-400">
                        Preview ready to be submitted to admin
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] font-bold text-[#07866D] dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          Change image
                        </button>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <button
                          type="button"
                          onClick={handleRemoveScreenshot}
                          className="text-[11px] font-bold text-[#DC5555] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* File Upload Dropzone */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E5EAE7] dark:border-slate-800 hover:border-[#07866D]/60 dark:hover:border-emerald-500/60 rounded-2xl p-3 sm:p-3.5 text-center cursor-pointer transition-colors bg-[#FAF9F5]/60 dark:bg-[#070B16]/50 group"
                  >
                    <Image className="w-5 h-5 text-[#708096] group-hover:text-[#07866D] mx-auto mb-1 transition-colors" />
                    <p className="text-xs font-bold text-[#102B50] dark:text-slate-200">
                      Click to attach a screenshot
                    </p>
                    <p className="text-[10px] text-[#708096] dark:text-slate-400 mt-0.5">
                      PNG, JPG or WebP (up to 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Confidentiality Notice */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#070B16] border border-[#E5EAE7] dark:border-slate-800 text-[11px] text-[#708096] dark:text-slate-400 flex items-start gap-2 leading-relaxed">
                <Lock className="w-3.5 h-3.5 shrink-0 text-[#07866D] mt-0.5" />
                <span>
                  <strong>Admin Notification:</strong> Your report is delivered directly to the platform administrators. You will be notified in your account when the issue is reviewed and resolved.
                </span>
              </div>

              {/* 4. Action Buttons */}
              <div className="pt-1.5 flex gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-white flex-1 !py-2.5 !text-xs font-bold cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !description.trim()}
                  className="btn-emerald flex-1 !py-2.5 !text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 active:scale-95"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
