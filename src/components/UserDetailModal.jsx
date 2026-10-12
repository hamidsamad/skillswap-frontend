import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Award,
  BookOpen,
  GraduationCap,
  Clock,
  Activity,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Eye,
  Sparkles,
  Layers,
  Lock,
  UserX,
  UserCheck,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  Loader2
} from 'lucide-react';
import api from '../api/client';
import UserAvatar from './UserAvatar';

export default function UserDetailModal({
  isOpen,
  onClose,
  userId,
  initialUser = null,
  onOpenReport = null,
  onOpenSuspend = null,
  onRoleToggle = null
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'skills' | 'reports'
  const [userDetails, setUserDetails] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setUserDetails(null);
      setErrorMsg('');
      setActiveTab('overview');
      return;
    }

    if (initialUser) {
      setUserDetails(initialUser);
    }

    const fetchFullDetails = async () => {
      const targetId = userId || initialUser?._id;
      if (!targetId) return;

      setLoading(true);
      setErrorMsg('');
      try {
        const res = await api.get(`/admin/users/${targetId}`);
        if (res.data.success && res.data.user) {
          setUserDetails(res.data.user);
        } else {
          setErrorMsg(res.data.message || 'Failed to fetch complete user profile');
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
        setErrorMsg(err.response?.data?.message || 'Server error while loading user details');
      } finally {
        setLoading(false);
      }
    };

    fetchFullDetails();
  }, [isOpen, userId, initialUser?._id]);

  if (!isOpen) return null;

  const user = userDetails || initialUser;

  const handleCopyId = () => {
    if (!user?._id) return;
    navigator.clipboard.writeText(user._id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Not provided';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Not provided';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Not available';
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Not available';
    }
  };

  const profile = user?.profile || {};
  const teachingSkills = profile.teachingSkills || [];
  const learningSkills = profile.learningSkills || [];
  const reportStats = user?.reportStats || {
    totalSubmitted: user?.reportsSubmittedCount ?? 0,
    pendingSubmitted: 0,
    underReviewSubmitted: 0,
    resolvedSubmitted: 0,
    rejectedSubmitted: 0,
    totalAgainst: user?.reportsAgainstCount ?? 0
  };
  const submittedReports = user?.submittedReports || [];
  const reportsAgainst = user?.reportsAgainst || [];

  // Determine functional role badge
  const isSysAdmin = user?.role === 'admin';
  const roleLabel = isSysAdmin ? 'Administrator' : teachingSkills.length > 0 ? 'Teacher & Student' : 'Student';

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 rounded-3xl w-full max-w-3xl my-auto shadow-2xl relative text-[#24364B] dark:text-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#E5EAE7] dark:border-slate-800 bg-[#FAF9F5]/80 dark:bg-[#0D1527]/70 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <UserAvatar user={user} size="lg" className="ring-2 ring-[#07866D]/40 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-extrabold text-base sm:text-xl text-[#102B50] dark:text-white font-display truncate">
                  {user?.name || 'Community Member'}
                </h2>
                {/* Role badge */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    isSysAdmin
                      ? 'bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border-[#07866D]/30'
                      : 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-500/30'
                  }`}
                >
                  {roleLabel}
                </span>

                {/* Account status badge */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    user?.isSuspended
                      ? 'bg-rose-50 dark:bg-rose-950/50 text-[#DC5555] dark:text-rose-400 border-[#DC5555]/30'
                      : 'bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border-[#07866D]/30'
                  }`}
                >
                  {user?.isSuspended ? 'Suspended' : 'Active Account'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#708096] dark:text-slate-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#07866D]" />
                  <span>{user?.email || 'Not provided'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#07866D]" />
                  <span>{profile?.city || 'Pakistan'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#07866D]" />
                  <span>Joined {formatDate(user?.createdAt)}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#708096] hover:text-[#102B50] dark:hover:text-slate-200 rounded-full hover:bg-black/5 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#E5EAE7] dark:border-slate-800 px-5 sm:px-6 bg-white dark:bg-[#0E1526] shrink-0 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#07866D] text-[#07866D] dark:text-emerald-400'
                : 'border-transparent text-[#708096] dark:text-slate-400 hover:text-[#102B50] dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Account</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3 px-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'skills'
                ? 'border-[#07866D] text-[#07866D] dark:text-emerald-400'
                : 'border-transparent text-[#708096] dark:text-slate-400 hover:text-[#102B50] dark:hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Skills & Goals ({teachingSkills.length + learningSkills.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 px-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-[#07866D] text-[#07866D] dark:text-emerald-400'
                : 'border-transparent text-[#708096] dark:text-slate-400 hover:text-[#102B50] dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Reports & Activity</span>
            {reportStats.totalSubmitted > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border border-[#07866D]/20">
                {reportStats.totalSubmitted}
              </span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {loading && !userDetails && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#07866D] animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#708096] dark:text-slate-400 uppercase tracking-wider">
                Loading complete user records...
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-[#DC5555]/30 text-[#DC5555] dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW & PERSONAL INFO */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Personal Headline & Bio */}
              <div className="card-clean p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#07866D] dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Personal Headline & Bio</span>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-sm sm:text-base text-[#102B50] dark:text-white">
                    {user?.headline || 'Skill Enthusiast from Pakistan'}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#708096] dark:text-slate-300 leading-relaxed font-normal">
                    {profile?.bio || 'Passionate about sharing skills and learning together in Pakistan.'}
                  </p>
                </div>
              </div>

              {/* Personal & Account Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Personal Information */}
                <div className="card-clean p-4 sm:p-5 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#102B50] dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-[#07866D]" />
                    <span>Personal Information</span>
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-[#E5EAE7]/60 dark:border-slate-800/60">
                      <span className="text-[#708096] dark:text-slate-400 font-medium">Full Name</span>
                      <span className="font-bold text-[#102B50] dark:text-white">{user?.name || 'Not provided'}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-[#E5EAE7]/60 dark:border-slate-800/60">
                      <span className="text-[#708096] dark:text-slate-400 font-medium">Email Address</span>
                      <span className="font-bold text-[#102B50] dark:text-white truncate max-w-[200px]" title={user?.email}>
                        {user?.email || 'Not provided'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-[#E5EAE7]/60 dark:border-slate-800/60">
                      <span className="text-[#708096] dark:text-slate-400 font-medium">City</span>
                      <span className="font-bold text-[#102B50] dark:text-white flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#07866D]" />
                        {profile?.city || 'Pakistan'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-[#E5EAE7]/60 dark:border-slate-800/60">
                      <span className="text-[#708096] dark:text-slate-400 font-medium">User ID</span>
                      <button
                        onClick={handleCopyId}
                        className="font-mono text-[11px] text-[#07866D] dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        title="Click to copy full ID"
                      >
                        <span>{user?._id ? `${user._id.slice(0, 8)}...${user._id.slice(-6)}` : 'N/A'}</span>
                        {copiedId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-[#708096] dark:text-slate-400 font-medium">Registration Date</span>
                      <span className="font-bold text-[#102B50] dark:text-white">{formatDate(user?.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Account & Security Information */}
                <div className="card-clean p-4 sm:p-5 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#102B50] dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#07866D]" />
                    <span>Account Status & Security</span>
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-[#E5EAE7]/60 dark:border-slate-800/60">
                      <span className="text-[#708096] dark:text-slate-400 font-medium">Account Status</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          user?.isSuspended
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-[#DC5555] dark:text-rose-400 border border-[#DC5555]/30'
                            : 'bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border border-[#07866D]/30'
                        }`}
                      >
                        {user?.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-[#E5EAE7]/60 dark:border-slate-800/60">
                      <span className="text-[#708096] dark:text-slate-400 font-medium">User Role</span>
                      <span className="font-bold text-[#102B50] dark:text-white uppercase text-[11px]">
                        {user?.role || 'user'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-[#E5EAE7]/60 dark:border-slate-800/60">
                      <span className="text-[#708096] dark:text-slate-400 font-medium">Email Verification</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-[#E5EAE7]/60 dark:border-slate-800/60">
                      <span className="text-[#708096] dark:text-slate-400 font-medium">Last Login / Active</span>
                      <span className="font-bold text-[#102B50] dark:text-white text-[11px]">
                        {formatDateTime(user?.lastActiveAt || user?.updatedAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-[#708096] dark:text-slate-400 font-medium">Learning Mode</span>
                      <span className="font-bold text-[#102B50] dark:text-white">
                        {profile?.learningMode || 'Both (Online & Physical)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suspension Reason Card if user is suspended */}
              {user?.isSuspended && (
                <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-[#DC5555]/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-[#DC5555] dark:text-rose-400">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Account Currently Suspended</span>
                  </div>
                  <p className="text-xs text-[#DC5555] dark:text-rose-300 font-medium">
                    <span className="font-bold">Reason for suspension:</span>{' '}
                    {user?.suspensionReason || 'Administrative moderation policy action.'}
                  </p>
                  {user?.suspendedAt && (
                    <p className="text-[11px] text-[#DC5555]/80 dark:text-rose-400/80">
                      Suspended on: {formatDateTime(user.suspendedAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Barter Platform Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 text-center">
                  <span className="text-[10px] font-black uppercase text-[#708096] dark:text-slate-400 tracking-wider">
                    Teaching Skills
                  </span>
                  <p className="text-lg font-extrabold text-[#102B50] dark:text-white mt-1">
                    {teachingSkills.length}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 text-center">
                  <span className="text-[10px] font-black uppercase text-[#708096] dark:text-slate-400 tracking-wider">
                    Learning Goals
                  </span>
                  <p className="text-lg font-extrabold text-[#102B50] dark:text-white mt-1">
                    {learningSkills.length}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 text-center">
                  <span className="text-[10px] font-black uppercase text-[#708096] dark:text-slate-400 tracking-wider">
                    Swaps Completed
                  </span>
                  <p className="text-lg font-extrabold text-[#102B50] dark:text-white mt-1">
                    {profile?.completedSwapsCount ?? 0}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 text-center">
                  <span className="text-[10px] font-black uppercase text-[#708096] dark:text-slate-400 tracking-wider">
                    Platform Rating
                  </span>
                  <p className="text-lg font-extrabold text-[#07866D] dark:text-emerald-400 mt-1">
                    {profile?.rating ? `★ ${profile.rating.toFixed(1)}` : '★ 5.0'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS & GOALS */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Teaching Skills Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm sm:text-base text-[#102B50] dark:text-white font-display flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#07866D]" />
                    <span>Teaching Skills ({teachingSkills.length})</span>
                  </h3>
                  <span className="text-xs text-[#708096] dark:text-slate-400 font-medium">
                    Skills offered for peer barter
                  </span>
                </div>

                {teachingSkills.length === 0 ? (
                  <div className="card-clean p-6 text-center text-xs text-[#708096] dark:text-slate-400 italic">
                    No teaching skills listed yet by this user.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {teachingSkills.map((ts, idx) => (
                      <div
                        key={ts._id || idx}
                        className="card-clean p-4 space-y-2.5 border-l-4 border-l-[#07866D]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-extrabold text-sm text-[#102B50] dark:text-white">
                              {ts.skill?.name || 'Skill'}
                            </h4>
                            <span className="text-[11px] text-[#708096] dark:text-slate-400 font-medium">
                              {ts.skill?.category || 'General'}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border border-[#07866D]/20">
                            {ts.level || 'Intermediate'}
                          </span>
                        </div>

                        {ts.experienceYears !== undefined && (
                          <div className="text-[11px] text-[#24364B] dark:text-slate-300 font-semibold flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-[#708096]" />
                            <span>{ts.experienceYears} year{ts.experienceYears === 1 ? '' : 's'} experience</span>
                          </div>
                        )}

                        {ts.description && (
                          <p className="text-xs text-[#708096] dark:text-slate-300 italic bg-[#FAF9F5] dark:bg-[#0D1527] p-2.5 rounded-xl border border-[#E5EAE7]/60 dark:border-slate-800/60">
                            "{ts.description}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Learning Skills / Learning Goals Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm sm:text-base text-[#102B50] dark:text-white font-display flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    <span>Learning Goals & Skills Wanted ({learningSkills.length})</span>
                  </h3>
                  <span className="text-xs text-[#708096] dark:text-slate-400 font-medium">
                    Skills the user wants to acquire
                  </span>
                </div>

                {learningSkills.length === 0 ? (
                  <div className="card-clean p-6 text-center text-xs text-[#708096] dark:text-slate-400 italic">
                    No learning goals listed yet by this user.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {learningSkills.map((ls, idx) => (
                      <div
                        key={ls._id || idx}
                        className="card-clean p-4 space-y-2.5 border-l-4 border-l-sky-500"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-extrabold text-sm text-[#102B50] dark:text-white">
                              {ls.skill?.name || 'Skill Goal'}
                            </h4>
                            <span className="text-[11px] text-[#708096] dark:text-slate-400 font-medium">
                              {ls.skill?.category || 'General'}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              ls.priority === 'High'
                                ? 'bg-rose-50 dark:bg-rose-950/50 text-[#DC5555] dark:text-rose-400 border-[#DC5555]/30'
                                : ls.priority === 'Medium'
                                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300'
                            }`}
                          >
                            {ls.priority || 'High'} Priority
                          </span>
                        </div>

                        {ls.notes && (
                          <p className="text-xs text-[#708096] dark:text-slate-300 italic bg-[#FAF9F5] dark:bg-[#0D1527] p-2.5 rounded-xl border border-[#E5EAE7]/60 dark:border-slate-800/60">
                            "{ls.notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: REPORTS & ACTIVITY */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Reports Metrics Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
                <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 text-center">
                  <span className="text-[10px] font-black uppercase text-[#708096] dark:text-slate-400 tracking-wider">
                    Submitted
                  </span>
                  <p className="text-base sm:text-lg font-extrabold text-[#102B50] dark:text-white mt-0.5">
                    {reportStats.totalSubmitted}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-500/20 text-center">
                  <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                    Pending
                  </span>
                  <p className="text-base sm:text-lg font-extrabold text-amber-700 dark:text-amber-300 mt-0.5">
                    {reportStats.pendingSubmitted}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-500/20 text-center">
                  <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider">
                    In Review
                  </span>
                  <p className="text-base sm:text-lg font-extrabold text-sky-700 dark:text-sky-300 mt-0.5">
                    {reportStats.underReviewSubmitted}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/20 text-center">
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                    Resolved
                  </span>
                  <p className="text-base sm:text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {reportStats.resolvedSubmitted}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-800/50 border border-slate-300/40 dark:border-slate-700 text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-black uppercase text-[#708096] dark:text-slate-400 tracking-wider">
                    Rejected
                  </span>
                  <p className="text-base sm:text-lg font-extrabold text-[#708096] dark:text-slate-300 mt-0.5">
                    {reportStats.rejectedSubmitted}
                  </p>
                </div>
              </div>

              {/* Reports Submitted by User List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#102B50] dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#07866D]" />
                    <span>Reports Submitted by this User ({submittedReports.length})</span>
                  </h4>
                </div>

                {submittedReports.length === 0 ? (
                  <div className="card-clean p-6 text-center text-xs text-[#708096] dark:text-slate-400 italic">
                    This user has not submitted any reports yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submittedReports.map((rep) => (
                      <div
                        key={rep._id || rep.reportId}
                        className="card-clean p-4 space-y-2.5 transition-all hover:border-[#07866D]/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-black text-[#07866D] dark:text-emerald-400">
                                #{rep.reportId}
                              </span>
                              <h5 className="font-extrabold text-xs sm:text-sm text-[#102B50] dark:text-white truncate">
                                {rep.title || 'Platform Issue Report'}
                              </h5>
                              <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-[#FAF9F5] dark:bg-slate-800 text-[#708096] dark:text-slate-300 border border-[#E5EAE7] dark:border-slate-700">
                                {rep.category || 'General'}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#708096] dark:text-slate-400 mt-0.5 block">
                              Submitted {formatDateTime(rep.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Status badge */}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                ['Resolved', 'resolved'].includes(rep.status)
                                  ? 'bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border-[#07866D]/30'
                                  : ['Under Review', 'under review', 'In Progress'].includes(rep.status)
                                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-500/30'
                                  : ['Rejected', 'rejected'].includes(rep.status)
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300'
                                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {rep.status}
                            </span>

                            {onOpenReport && (
                              <button
                                onClick={() => {
                                  onClose();
                                  onOpenReport(rep.reportId);
                                }}
                                className="p-1 text-[#708096] hover:text-[#07866D] dark:hover:text-emerald-400 transition-colors"
                                title="Open Report Review"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {rep.description && (
                          <p className="text-xs text-[#24364B] dark:text-slate-300 bg-[#FAF9F5] dark:bg-[#0D1527] p-2.5 rounded-xl border border-[#E5EAE7]/60 dark:border-slate-800/60 line-clamp-2">
                            {rep.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reports Against this User (if any) */}
              {reportsAgainst.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#DC5555] dark:text-rose-400 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Reports Filed Against this User ({reportsAgainst.length})</span>
                  </h4>

                  <div className="space-y-2.5">
                    {reportsAgainst.map((rep) => (
                      <div
                        key={rep._id || rep.reportId}
                        className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-300/40 dark:border-rose-900/40 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-black text-rose-600 dark:text-rose-400">
                            #{rep.reportId}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-white dark:bg-slate-900 text-rose-600 border border-rose-200">
                            {rep.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#24364B] dark:text-slate-300 font-medium">
                          {rep.title || rep.reason || 'Reported for community guideline review'}
                        </p>
                        <span className="text-[10px] text-[#708096] dark:text-slate-400 block">
                          Filed on {formatDate(rep.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-[#E5EAE7] dark:border-slate-800 bg-[#FAF9F5]/80 dark:bg-[#0D1527]/70 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenSuspend && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSuspend(user);
                }}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  user?.isSuspended
                    ? 'bg-[#EAF6EF] dark:bg-emerald-950/40 hover:bg-[#EAF6EF]/80 text-[#07866D] dark:text-emerald-400 border-[#07866D]/30'
                    : 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-[#DC5555] dark:text-rose-400 border-[#DC5555]/30'
                }`}
              >
                {user?.isSuspended ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Reactivate Account</span>
                  </>
                ) : (
                  <>
                    <UserX className="w-3.5 h-3.5" />
                    <span>Suspend Account</span>
                  </>
                )}
              </button>
            )}

            {onRoleToggle && (
              <button
                type="button"
                onClick={() => {
                  onRoleToggle(user?._id, user?.role);
                }}
                className="btn-white !py-1.5 !px-3 !text-xs cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#07866D]" />
                <span>{user?.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-white !py-1.5 !px-4 !text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
