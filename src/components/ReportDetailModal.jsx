import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  UserX,
  UserCheck,
  Lock,
  ArrowRight,
  Send,
  Loader2,
  TrendingUp,
  Tag,
  Image,
  Eye
} from 'lucide-react';
import api from '../api/client';
import UserAvatar from './UserAvatar';
import SuspendUserModal from './SuspendUserModal';

export default function ReportDetailModal({
  isOpen,
  onClose,
  reportId,
  administrators = [],
  onReportUpdated
}) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Internal Note form
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Status Action Modal/Drawer
  const [actionType, setActionType] = useState(null); // 'resolve', 'reject', null
  const [resolutionAction, setResolutionAction] = useState('Formal Warning Issued');
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Reviewed: No community policy violation found.');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // User suspension modal
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const fetchReportDetails = async () => {
    if (!reportId) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/admin/reports/${reportId}`);
      if (res.data.success) {
        setReport(res.data.report);
      } else {
        setErrorMsg('Report not found');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch report details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && reportId) {
      fetchReportDetails();
    } else {
      setReport(null);
      setActionType(null);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, reportId]);

  // Handle Escape key to close modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStatusChange = async (statusPayload) => {
    setSubmittingStatus(true);
    setErrorMsg('');
    try {
      const res = await api.patch(`/admin/reports/${report._id}/status`, statusPayload);
      if (res.data.success) {
        setReport(res.data.report);
        setActionType(null);
        setSuccessMsg(`Status updated to "${statusPayload.status}"`);
        if (onReportUpdated) onReportUpdated(res.data.report);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating report status');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    try {
      const res = await api.post(`/admin/reports/${report._id}/notes`, { note: newNote });
      if (res.data.success) {
        setReport(prev => ({
          ...prev,
          adminNotes: res.data.adminNotes,
          history: res.data.history
        }));
        setNewNote('');
        setSuccessMsg('Internal administrative note recorded');
        if (onReportUpdated) onReportUpdated(report);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleAssignAdmin = async (adminId) => {
    try {
      const res = await api.patch(`/admin/reports/${report._id}/assign`, { adminId });
      if (res.data.success) {
        setReport(res.data.report);
        setSuccessMsg('Administrator assignment updated');
        if (onReportUpdated) onReportUpdated(res.data.report);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign administrator');
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      const res = await api.patch(`/admin/reports/${report._id}/priority`, { priority: newPriority });
      if (res.data.success) {
        setReport(res.data.report);
        setSuccessMsg(`Priority updated to ${newPriority}`);
        if (onReportUpdated) onReportUpdated(res.data.report);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update priority');
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'Urgent':
        return 'bg-rose-50 dark:bg-rose-950/50 text-[#DC5555] dark:text-rose-400 border-[#DC5555]/30';
      case 'High':
        return 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-800/60';
      case 'Medium':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800/60';
      default:
        return 'bg-[#FAF9F5] dark:bg-[#0E1526] text-[#708096] dark:text-slate-400 border-[#E5EAE7] dark:border-slate-800';
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Pending':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800/60';
      case 'In Progress':
      case 'IN_PROGRESS':
      case 'Under Review':
        return 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-800/60';
      case 'Resolved':
      case 'RESOLVED':
        return 'bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border-[#07866D]/30';
      case 'Rejected':
        return 'bg-slate-100 dark:bg-slate-800 text-[#708096] dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-[#FAF9F5] dark:bg-[#0E1526] text-[#708096] dark:text-slate-400 border-[#E5EAE7] dark:border-slate-800';
    }
  };

  const modalContent = (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-2xl lg:max-w-[720px] max-h-[calc(100dvh-3.5rem)] sm:max-h-[85vh] my-auto flex flex-col shadow-2xl relative text-[#24364B] dark:text-slate-100 overflow-hidden"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="py-20 px-6 text-center relative flex-1 flex flex-col items-center justify-center">
              <button
                type="button"
                id="report-detail-modal-close-btn-loading"
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#102B50] dark:text-white border border-[#E5EAE7] dark:border-slate-700 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95 z-20 text-xs font-bold"
                title="Cancel & Close (Esc)"
                aria-label="Cancel"
              >
                <X className="w-4 h-4 text-[#708096] dark:text-slate-400" />
                <span>Cancel</span>
              </button>
              <div className="relative w-10 h-10 mx-auto mb-3">
                <div className="w-10 h-10 rounded-full border-4 border-[#07866D]/20 border-t-[#07866D] animate-spin" />
              </div>
              <p className="text-xs font-bold text-[#708096] uppercase tracking-wider">
                Loading complete report dossier...
              </p>
            </div>
          ) : errorMsg && !report ? (
            <div className="py-16 px-6 text-center text-[#DC5555] font-bold text-sm relative flex-1 flex flex-col items-center justify-center">
              <button
                type="button"
                id="report-detail-modal-close-btn-error"
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#102B50] dark:text-white border border-[#E5EAE7] dark:border-slate-700 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95 z-20 text-xs font-bold"
                title="Cancel & Close (Esc)"
                aria-label="Cancel"
              >
                <X className="w-4 h-4 text-[#708096] dark:text-slate-400" />
                <span>Cancel</span>
              </button>
              {errorMsg}
            </div>
          ) : report ? (
            <>
              {/* Pinned Card Header: Reference ID, Badges, Dropdowns, and Aligned Cancel Button */}
              <div className="p-3.5 sm:p-4 sm:px-5 border-b border-[#E5EAE7] dark:border-slate-800 bg-white dark:bg-[#0E1526] shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="font-mono font-black text-xs sm:text-sm text-[#102B50] dark:text-white bg-[#FAF9F5] dark:bg-[#0D1527] px-2 py-0.5 rounded-lg border border-[#E5EAE7] dark:border-slate-700">
                      #{report.reportId}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getPriorityBadge(report.priority)}`}>
                      {report.priority} Priority
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#102B50] dark:text-white font-display truncate">
                    {report.title || report.category}
                  </h2>
                  {report.title && report.category && report.title !== report.category && (
                    <span className="text-[11px] font-bold text-[#708096] dark:text-slate-400 block truncate">
                      Category Context: {report.category}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] text-[#708096] dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Submitted on {new Date(report.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Priority Selector, Assigned Admin & Aligned Cancel Button */}
                <div className="flex items-end gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-[#708096] dark:text-slate-400 mb-1">
                      Assign Admin
                    </label>
                    <select
                      value={report.assignedAdmin?._id || ''}
                      onChange={(e) => handleAssignAdmin(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 outline-none font-bold text-[#102B50] dark:text-white cursor-pointer focus:ring-2 focus:ring-[#07866D]/20 focus:border-[#07866D] h-[34px]"
                    >
                      <option value="">Unassigned</option>
                      {administrators.map(a => (
                        <option key={a._id} value={a._id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-[#708096] dark:text-slate-400 mb-1">
                      Escalate Priority
                    </label>
                    <select
                      value={report.priority}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 outline-none font-bold text-[#102B50] dark:text-white cursor-pointer focus:ring-2 focus:ring-[#07866D]/20 focus:border-[#07866D] h-[34px]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Cancel Button Aligned with Review Content & Controls */}
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-[#708096] dark:text-slate-400 mb-1 invisible select-none">
                      Cancel
                    </label>
                    <button
                      type="button"
                      id="report-detail-modal-close-btn"
                      onClick={onClose}
                      className="h-[34px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#102B50] dark:text-white border border-[#E5EAE7] dark:border-slate-700 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 text-xs font-bold"
                      title="Cancel Review (Esc)"
                      aria-label="Cancel Review"
                    >
                      <X className="w-3.5 h-3.5 text-[#708096] dark:text-slate-400" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Body Content */}
              <div className="overflow-y-auto overscroll-contain flex-1 p-3.5 sm:p-5 space-y-4 touch-scroll">

              {successMsg && (
                <div className="p-3 rounded-2xl bg-[#EAF6EF] dark:bg-emerald-950/40 border border-[#07866D]/30 flex items-center gap-2 text-xs font-bold text-[#07866D] dark:text-emerald-300 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Two Parties Involved: Reporter vs Reported User */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Reported User Dossier Card */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#DC5555] dark:text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Reported Account</span>
                    </span>
                    {report.reportedUser && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          report.reportedUser.isSuspended
                            ? 'bg-rose-600 text-white'
                            : 'bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400'
                        }`}
                      >
                        {report.reportedUser.isSuspended ? 'Suspended' : 'Active Account'}
                      </span>
                    )}
                  </div>

                  {report.reportedUser ? (
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar user={report.reportedUser} size="md" className="shrink-0 ring-2 ring-rose-400/40" />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs sm:text-sm text-[#102B50] dark:text-white truncate">
                            {report.reportedUser.name}
                          </h4>
                          <p className="text-[11px] text-[#708096] dark:text-slate-400 truncate">
                            {report.reportedUser.email}
                          </p>
                          <p className="text-[10px] text-[#708096] dark:text-slate-400 truncate mt-0.5">
                            {report.reportedUser.headline || 'SkillSwap Member'}
                          </p>
                        </div>
                      </div>

                      {/* Moderation Suspension Action */}
                      <button
                        type="button"
                        onClick={() => setShowSuspendModal(true)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black shadow-xs transition-all cursor-pointer shrink-0 active:scale-95 ${
                          report.reportedUser.isSuspended
                            ? 'bg-[#07866D] hover:bg-[#086B57] text-white'
                            : 'bg-[#DC5555] hover:bg-rose-600 text-white'
                        }`}
                        title="Execute account suspension or reactivation"
                      >
                        {report.reportedUser.isSuspended ? 'Reactivate' : 'Suspend User'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-[#708096] dark:text-slate-400 italic">
                      Direct User Issue Report (No specific offending account attached)
                    </div>
                  )}

                  {report.reportedUser?.isSuspended && report.reportedUser?.suspensionReason && (
                    <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-[11px] text-rose-800 dark:text-rose-300 leading-snug">
                      <strong>Current Suspension Reason:</strong> "{report.reportedUser.suspensionReason}"
                    </div>
                  )}
                </div>

                {/* Reporter Dossier Card */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-[#FAF9F5] dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#708096] dark:text-slate-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#07866D]" />
                      <span>Reporter (Confidential)</span>
                    </span>
                    <span className="text-[10px] text-[#07866D] dark:text-emerald-400 font-bold">
                      Admin-Only View
                    </span>
                  </div>

                  {report.reporter ? (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar user={report.reporter} size="md" className="shrink-0 ring-2 ring-[#07866D]/20" />
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs sm:text-sm text-[#102B50] dark:text-white truncate">
                          {report.reporter.name}
                        </h4>
                        <p className="text-[11px] text-[#708096] dark:text-slate-400 truncate">
                          {report.reporter.email}
                        </p>
                        <p className="text-[10px] text-[#708096] dark:text-slate-400 truncate mt-0.5">
                          {report.reporter.headline || 'SkillSwap Member'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-[#708096] dark:text-slate-400 italic">Anonymous Reporter</div>
                  )}
                </div>
              </div>

              {/* Detailed Explanation, Title, Evidence & Screenshot */}
              <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E5EAE7] dark:border-slate-800 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#708096] dark:text-slate-400 block">
                    User Issue Description & Evidence
                  </span>
                  <span className="text-[10px] text-[#708096] dark:text-slate-400 font-mono">
                    Submitted: {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>

                {report.title && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#708096] dark:text-slate-400 block mb-0.5">
                      Issue Title:
                    </span>
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#102B50] dark:text-white">
                      {report.title}
                    </h3>
                  </div>
                )}

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#708096] dark:text-slate-400 block mb-1">
                    Complete Description:
                  </span>
                  <p className="text-xs text-[#24364B] dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium bg-[#FAF9F5]/80 dark:bg-[#070B16]/60 p-3 rounded-lg border border-[#E5EAE7]/70 dark:border-slate-800">
                    {report.description || report.reason}
                  </p>
                </div>

                {/* Optional Screenshot */}
                {report.screenshot && (
                  <div className="pt-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#708096] dark:text-slate-400 block mb-1.5 flex items-center gap-1.5">
                      <Image className="w-3.5 h-3.5 text-[#07866D]" />
                      <span>Attached Screenshot:</span>
                    </span>
                    <a
                      href={report.screenshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block relative group rounded-xl overflow-hidden border border-[#E5EAE7] dark:border-slate-700 bg-black/5 dark:bg-black/30 shadow-xs max-w-md cursor-pointer"
                      title="Click to open screenshot in full resolution"
                    >
                      <img
                        src={report.screenshot}
                        alt="User issue screenshot"
                        className="max-h-56 w-auto object-contain rounded-xl group-hover:opacity-90 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                        <Eye className="w-4 h-4" />
                        <span>Click to View Full Size</span>
                      </div>
                    </a>
                  </div>
                )}

                {report.reportedContentSnapshot && (
                  <div className="mt-2 p-2.5 rounded-lg bg-[#FAF9F5] dark:bg-[#070B16] border border-[#E5EAE7] dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-[#708096] dark:text-slate-400 block mb-1">
                      Attached Content Context:
                    </span>
                    <p className="text-xs font-mono text-[#24364B] dark:text-slate-300">
                      {typeof report.reportedContentSnapshot === 'string'
                        ? report.reportedContentSnapshot
                        : JSON.stringify(report.reportedContentSnapshot, null, 2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Moderation Status Controls Bar */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#FAF9F5] dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#708096] dark:text-slate-400 block">
                  Administrative Moderation Actions
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  {report.status !== 'Under Review' && report.status !== 'In Progress' && (
                    <button
                      type="button"
                      disabled={submittingStatus}
                      onClick={() => handleStatusChange({ status: 'In Progress' })}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-800/60 hover:bg-sky-100 transition-all cursor-pointer"
                    >
                      Mark In Progress
                    </button>
                  )}

                  {report.status !== 'Resolved' && report.status !== 'RESOLVED' && (
                    <button
                      type="button"
                      onClick={() => setActionType('resolve')}
                      className="btn-emerald !py-1.5 !px-3 !text-xs cursor-pointer shadow-xs"
                    >
                      Mark As Resolved
                    </button>
                  )}

                  {report.status !== 'Rejected' && (
                    <button
                      type="button"
                      onClick={() => setActionType('reject')}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-50 dark:bg-rose-950/50 text-[#DC5555] dark:text-rose-400 border border-[#DC5555]/30 hover:bg-rose-100 transition-all cursor-pointer"
                    >
                      Reject Report
                    </button>
                  )}

                  {report.status !== 'Pending' && (
                    <button
                      type="button"
                      disabled={submittingStatus}
                      onClick={() => handleStatusChange({ status: 'Pending' })}
                      className="btn-white !py-1.5 !px-3 !text-xs cursor-pointer"
                    >
                      Reopen to Pending
                    </button>
                  )}
                </div>

                {/* Sub-form for Resolving */}
                {actionType === 'resolve' && (
                  <div className="p-4 rounded-xl bg-white dark:bg-[#070B16] border border-[#07866D]/30 space-y-3 animate-in fade-in">
                    <h4 className="text-xs font-black text-[#07866D] dark:text-emerald-400 uppercase tracking-wider">
                      Resolve Report Details
                    </h4>
                    <div>
                      <label className="block text-[10px] font-bold text-[#708096] dark:text-slate-400 mb-1">
                        Action Taken
                      </label>
                      <select
                        value={resolutionAction}
                        onChange={(e) => setResolutionAction(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 outline-none font-semibold text-[#102B50] dark:text-white cursor-pointer"
                      >
                        <option value="Formal Warning Issued">Formal Warning Issued</option>
                        <option value="Offending Content Hidden / Removed">Offending Content Hidden / Removed</option>
                        <option value="Account Suspended">Account Suspended</option>
                        <option value="Parties Mediated & Syllabus Realigned">Parties Mediated & Syllabus Realigned</option>
                        <option value="No Violation - Advisory Provided">No Violation - Advisory Provided</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#708096] dark:text-slate-400 mb-1">
                        Resolution Notes / Summary
                      </label>
                      <textarea
                        rows={2}
                        value={resolutionDetails}
                        onChange={(e) => setResolutionDetails(e.target.value)}
                        placeholder="Describe investigation outcome and actions performed..."
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 outline-none font-medium resize-none text-[#102B50] dark:text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActionType(null)}
                        className="btn-white !py-1.5 !px-3 !text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={submittingStatus}
                        onClick={() =>
                          handleStatusChange({
                            status: 'Resolved',
                            resolutionAction,
                            resolutionDetails
                          })
                        }
                        className="btn-emerald !py-1.5 !px-4 !text-xs cursor-pointer shadow-xs"
                      >
                        {submittingStatus ? 'Submitting...' : 'Confirm Resolution'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-form for Rejecting */}
                {actionType === 'reject' && (
                  <div className="p-4 rounded-xl bg-white dark:bg-[#070B16] border border-[#DC5555]/30 space-y-3 animate-in fade-in">
                    <h4 className="text-xs font-black text-[#DC5555] dark:text-rose-400 uppercase tracking-wider">
                      Reject Report Reason
                    </h4>
                    <div>
                      <label className="block text-[10px] font-bold text-[#708096] dark:text-slate-400 mb-1">
                        Rejection Reason *
                      </label>
                      <textarea
                        rows={2}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="State why this report was dismissed (e.g. Subjective dispute, insufficient evidence, no violation)..."
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 outline-none font-medium resize-none text-[#102B50] dark:text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActionType(null)}
                        className="btn-white !py-1.5 !px-3 !text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={submittingStatus || !rejectionReason.trim()}
                        onClick={() =>
                          handleStatusChange({
                            status: 'Rejected',
                            rejectionReason
                          })
                        }
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#DC5555] hover:bg-rose-600 text-white transition-all shadow-xs cursor-pointer"
                      >
                        {submittingStatus ? 'Submitting...' : 'Confirm Rejection'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Internal Notes Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#102B50] dark:text-white font-display flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#07866D]" />
                    <span>Internal Administrative Notes ({(report.adminNotes || []).length})</span>
                  </h3>
                  <span className="text-[10px] text-[#07866D] dark:text-emerald-400 font-bold">
                    Private to Administrators
                  </span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {(report.adminNotes || []).length === 0 ? (
                    <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 text-center text-xs text-[#708096] dark:text-slate-400 italic">
                      No internal notes recorded yet. Add investigation notes below.
                    </div>
                  ) : (
                    report.adminNotes.map((n, i) => (
                      <div
                        key={n._id || i}
                        className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-extrabold text-[#102B50] dark:text-white">
                            {n.authorName || 'Administrator'}
                          </span>
                          <span className="text-[#708096] dark:text-slate-400">
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[#24364B] dark:text-slate-300 font-medium">
                          {n.note}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add internal administrative note (e.g. Followed up on chat logs, verified user)..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-[#07866D]/20 focus:border-[#07866D] font-medium text-[#102B50] dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={submittingNote || !newNote.trim()}
                    className="btn-emerald !py-2.5 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {submittingNote ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Save Note</span>
                  </button>
                </form>
              </div>

              {/* Report Audit Timeline / Event History */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs sm:text-sm font-extrabold text-[#102B50] dark:text-white font-display flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#07866D]" />
                  <span>Audit History Timeline</span>
                </h3>

                <div className="space-y-2 border-l-2 border-[#E5EAE7] dark:border-slate-800 ml-2 pl-4 py-1">
                  {(report.history || []).map((h, idx) => (
                    <div key={h._id || idx} className="relative text-xs space-y-0.5">
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#07866D] ring-4 ring-white dark:ring-[#0E1526]" />
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-extrabold text-[#102B50] dark:text-white">
                          {h.action}
                        </span>
                        <span className="text-[#708096] dark:text-slate-400 font-medium">
                          {new Date(h.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[#708096] dark:text-slate-400 text-[11px] leading-relaxed">
                        {h.details || `Performed by ${h.actorName || 'System'}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer Quick Cancel / Close */}
              <div className="pt-3 border-t border-[#E5EAE7] dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-white !py-1.5 !px-4 !text-xs cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5 text-[#708096] dark:text-slate-400" />
                  <span>Cancel & Close Review</span>
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>

      {/* Account Suspension Confirmation Modal */}
      {report?.reportedUser && (
        <SuspendUserModal
          isOpen={showSuspendModal}
          onClose={() => setShowSuspendModal(false)}
          targetUser={report.reportedUser}
          onSuccess={(updatedUser) => {
            setReport(prev => ({
              ...prev,
              reportedUser: updatedUser
            }));
            fetchReportDetails();
            if (onReportUpdated) onReportUpdated(report);
          }}
        />
      )}
    </>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
