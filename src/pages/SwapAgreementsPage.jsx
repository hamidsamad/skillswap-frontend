import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  FileCheck,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertCircle,
  MapPin,
  Sparkles,
  ArrowRightLeft,
  ChevronRight,
  Send,
  Star,
  Flag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import UserAvatar from '../components/UserAvatar';
import UserProfileModal from '../components/UserProfileModal';
import ReportModal from '../components/ReportModal';

export default function SwapAgreementsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Pending', 'Active', 'Completed'
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSwapData, setReportSwapData] = useState(null);

  const fetchSwaps = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'All') {
        params.status = activeTab;
      }
      const res = await api.get('/swaps', { params });
      if (res.data.success) {
        setSwaps(res.data.swaps);
      }
    } catch (e) {
      console.error('Error fetching swaps:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, [activeTab]);

  const handleStatusChange = async (swapId, newStatus) => {
    setActionLoading(swapId);
    try {
      const res = await api.patch(`/swaps/${swapId}/status`, { status: newStatus });
      if (res.data.success) {
        if (newStatus === 'Accepted' || newStatus === 'Completed') {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
        fetchSwaps();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleMilestone = async (swapId, milestoneId) => {
    try {
      const res = await api.patch(`/swaps/${swapId}/milestones/${milestoneId}`);
      if (res.data.success) {
        setSwaps(prev =>
          prev.map(s => (s._id === swapId ? res.data.swap : s))
        );
      }
    } catch (e) {
      console.error('Failed to toggle milestone:', e);
    }
  };

  const handleGoToChat = async (targetUserId) => {
    try {
      const res = await api.post('/chat/find-or-create', {
        recipientId: targetUserId
      });
      if (res.data.success) {
        navigate(`/chat?conversationId=${res.data.conversation._id}`);
      }
    } catch (e) {
      console.error('Chat error:', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Page Header (Spec 10-A) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 sm:p-2.5 rounded-2xl bg-[#EAF6EF] text-[#07866D] border border-[#07866D]/20 shadow-xs">
              <FileCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102B50] dark:text-white font-display">
              Swap Agreements Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#708096] dark:text-slate-400 mt-1.5">
            Make every skill exchange clear, fair, and trackable.
          </p>
        </div>

        <button
          onClick={() => navigate('/matches')}
          className="btn-emerald !py-2.5 !px-5 !text-xs self-start sm:self-auto min-h-[44px] flex items-center gap-1.5"
        >
          <span>Find New Barter</span>
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs Row (Pill Style, Spec 10-B) */}
      <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar touch-scroll">
        {[
          { id: 'All', label: 'All Agreements' },
          { id: 'Pending', label: 'Pending Proposals' },
          { id: 'Active', label: 'Active Swaps' },
          { id: 'Completed', label: 'Completed' },
          { id: 'Declined', label: 'Declined / Cancelled' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 sm:px-4 py-2 min-h-[40px] rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-xs active:scale-95 ${
              activeTab === tab.id
                ? 'bg-[#07866D] text-white shadow-sm'
                : 'bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 text-[#24364B] dark:text-slate-300 hover:border-[#07866D]/40 hover:text-[#07866D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Main Agreements + Right Sidebar (Spec 10-H) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Swaps Listing (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="py-24 text-center card-clean">
              <div className="w-10 h-10 border-4 border-[#07866D]/20 border-t-[#07866D] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-bold text-[#708096] uppercase tracking-wider">Loading your barter agreements...</p>
            </div>
          ) : swaps.length === 0 ? (
            <div className="card-clean p-12 text-center">
              <span className="text-5xl mb-3 block">📜</span>
              <h3 className="text-lg font-extrabold text-[#102B50] dark:text-white">No Agreements Found</h3>
              <p className="text-xs text-[#708096] dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
                You don't have any barter agreements in this tab yet. Explore compatible learners across Pakistan and propose your first swap!
              </p>
              <button
                onClick={() => navigate('/matches')}
                className="btn-emerald !py-2.5 !px-6 !text-xs mx-auto"
              >
                Explore Compatible Learners
              </button>
            </div>
          ) : (
            swaps.map(swap => {
              const isProposer = String(swap.proposer?._id) === String(user?._id);
              const otherParty = isProposer ? swap.recipient : swap.proposer;
              const youOffer = isProposer ? swap.offeredSkill : swap.requestedSkill;
              const youReceive = isProposer ? swap.requestedSkill : swap.offeredSkill;
              const milestones = swap.milestones || [];
              const completedMilestones = milestones.filter(m => m.completed).length;
              const progressPercent =
                milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

              const isPending = swap.status === 'Pending';
              const isActive = swap.status === 'Accepted';
              const isCompleted = swap.status === 'Completed';

              return (
                <div
                  key={swap._id}
                  className="card-clean p-4 sm:p-6 sm:p-7 space-y-5 sm:space-y-6 hover:shadow-md transition-all duration-300"
                >
                  {/* Header: Partner Info & Status Badge (Spec 10-C) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-[#E5EAE7] dark:border-slate-800">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                      <UserAvatar
                        user={otherParty}
                        size="lg"
                        className="ring-2 ring-[#07866D]/20 shadow-xs shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h3 className="font-extrabold text-sm sm:text-base text-[#102B50] dark:text-white truncate">
                            Barter with {otherParty?.name}
                          </h3>
                          <span className="text-[10px] sm:text-[11px] font-bold text-[#708096] bg-[#FAF9F5] dark:bg-slate-800 border border-[#E5EAE7] dark:border-slate-700 px-2 sm:px-2.5 py-0.5 rounded-full shrink-0">
                            {isProposer ? 'You Proposed' : 'They Proposed'}
                          </span>
                        </div>
                        <p className="text-xs text-[#708096] dark:text-slate-400 mt-0.5 truncate">
                          {otherParty?.headline || `${otherParty?.city || 'Pakistan'} • Skill Enthusiast`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-black border uppercase tracking-wider ${
                          isActive
                            ? 'bg-[#EAF6EF] text-[#16855F] border-[#16855F]/30'
                            : isPending
                            ? 'bg-amber-50 text-[#E7A62C] border-[#E7A62C]/30'
                            : isCompleted
                            ? 'bg-[#EEF6FC] text-[#183A60] border-[#183A60]/20'
                            : 'bg-rose-50 text-[#DC5555] border-[#DC5555]/30'
                        }`}
                      >
                        {swap.status === 'Accepted' ? 'Active Swap' : swap.status}
                      </span>

                      <button
                        onClick={() => handleGoToChat(otherParty?._id)}
                        className="btn-white !py-1.5 !px-2.5 sm:!px-3 !text-xs !rounded-xl flex items-center gap-1.5 min-h-[38px]"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#07866D]" />
                        <span>Chat</span>
                      </button>

                      <button
                        onClick={() => setSelectedUserForProfile(otherParty?._id)}
                        className="btn-white !py-1.5 !px-2.5 sm:!px-3 !text-xs !rounded-xl flex items-center gap-1.5 min-h-[38px]"
                        title="View partner profile & rate"
                      >
                        <Star className="w-3.5 h-3.5 fill-[#E7A62C] text-[#E7A62C]" />
                        <span>Profile &amp; Rate</span>
                      </button>
                    </div>
                  </div>

                  {/* Two Skill Panels (Spec 10-D: Pale Mint for Teach, Pale Blue for Learn) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* You Will Teach (Pale Mint) */}
                    <div className="p-4 rounded-2xl bg-[#EAF6EF] dark:bg-emerald-950/20 border border-[#07866D]/20 shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#07866D] dark:text-emerald-400">
                          You Will Teach (Your Commitment)
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800 text-[#07866D] font-bold border border-[#07866D]/20">
                          {youOffer?.category || 'Skill'}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-[#102B50] dark:text-white">
                        {youOffer?.name || 'Selected Skill'}
                      </h4>
                      <p className="text-xs text-[#24364B]/80 dark:text-slate-300 mt-1 line-clamp-2">
                        {youOffer?.description || 'Hands-on practical mentoring and knowledge transfer.'}
                      </p>
                    </div>

                    {/* You Will Learn (Pale Blue) */}
                    <div className="p-4 rounded-2xl bg-[#EEF6FC] dark:bg-sky-950/20 border border-[#183A60]/15 shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#183A60] dark:text-sky-400">
                          You Will Learn (Their Commitment)
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800 text-[#183A60] font-bold border border-[#183A60]/20">
                          {youReceive?.category || 'Skill'}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-[#102B50] dark:text-white">
                        {youReceive?.name || 'Selected Skill'}
                      </h4>
                      <p className="text-xs text-[#24364B]/80 dark:text-slate-300 mt-1 line-clamp-2">
                        {youReceive?.description || 'Reciprocal learning sessions and milestone guidance.'}
                      </p>
                    </div>
                  </div>

                  {/* Agreement Details / Logistics (Spec 10-E) */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-slate-900/60 border border-[#E5EAE7] dark:border-slate-800">
                      <span className="text-[#708096] flex items-center gap-1.5 mb-1 text-[11px] font-bold">
                        <Calendar className="w-3.5 h-3.5 text-[#07866D]" /> Duration
                      </span>
                      <span className="font-extrabold text-[#102B50] dark:text-white text-sm">
                        {swap.durationWeeks} Weeks
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-slate-900/60 border border-[#E5EAE7] dark:border-slate-800">
                      <span className="text-[#708096] flex items-center gap-1.5 mb-1 text-[11px] font-bold">
                        <Clock className="w-3.5 h-3.5 text-[#07866D]" /> Cadence
                      </span>
                      <span className="font-extrabold text-[#102B50] dark:text-white text-sm">
                        {swap.sessionsPerWeek}x / wk ({swap.sessionDurationMinutes}m)
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-slate-900/60 border border-[#E5EAE7] dark:border-slate-800">
                      <span className="text-[#708096] flex items-center gap-1.5 mb-1 text-[11px] font-bold">
                        <Video className="w-3.5 h-3.5 text-[#07866D]" /> Mode
                      </span>
                      <span className="font-extrabold text-[#102B50] dark:text-white text-sm">
                        {swap.learningMode}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-slate-900/60 border border-[#E5EAE7] dark:border-slate-800">
                      <span className="text-[#708096] flex items-center gap-1.5 mb-1 text-[11px] font-bold">
                        <MapPin className="w-3.5 h-3.5 text-[#07866D]" /> Venue / Link
                      </span>
                      <span className="font-extrabold text-[#102B50] dark:text-white truncate block text-sm" title={swap.venue}>
                        {swap.venue}
                      </span>
                    </div>
                  </div>

                  {/* Initial proposal message if present */}
                  {swap.initialMessage && (
                    <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-slate-900/40 border border-[#E5EAE7] dark:border-slate-800 text-xs italic text-[#708096] dark:text-slate-300">
                      "{swap.initialMessage}"
                    </div>
                  )}

                  {/* Milestones and Progress (Spec 10-F) */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black uppercase tracking-wider text-[#708096] dark:text-slate-400">
                        Milestone Checklist ({completedMilestones}/{milestones.length})
                      </span>
                      <span className="font-black text-[#07866D] dark:text-emerald-400">
                        {progressPercent}% Complete
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-[#E5EAE7] dark:bg-slate-800 overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-[#07866D] to-[#16855F] rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="space-y-2 pt-1">
                      {milestones.map((m, idx) => (
                        <label
                          key={m._id}
                          className={`flex items-start gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                            m.completed
                              ? 'bg-[#EAF6EF]/80 dark:bg-emerald-950/20 border-[#07866D]/30 text-[#102B50] dark:text-slate-200'
                              : 'bg-white dark:bg-slate-900/60 border-[#E5EAE7] dark:border-slate-800 text-[#24364B] dark:text-slate-400 hover:border-[#07866D]/40'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={m.completed}
                            onChange={() => handleToggleMilestone(swap._id, m._id)}
                            className="mt-0.5 w-4 h-4 rounded text-[#07866D] focus:ring-[#07866D] cursor-pointer accent-[#07866D]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                              <span className={`break-words ${m.completed ? 'line-through text-[#708096] font-medium' : 'font-bold text-[#102B50] dark:text-white'}`}>
                                {m.title}
                              </span>
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                                  m.completed
                                    ? 'bg-[#16855F]/15 text-[#16855F]'
                                    : 'bg-slate-100 dark:bg-slate-800 text-[#708096]'
                                }`}
                              >
                                {m.completed ? 'Completed' : `Milestone ${idx + 1}`}
                              </span>
                            </div>
                            {m.description && (
                              <p className="text-[11px] text-[#708096] mt-0.5 break-words">
                                {m.description}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Agreement Actions (Spec 10-G) */}
                  <div className="pt-4 border-t border-[#E5EAE7] dark:border-slate-800 flex flex-col xs:flex-row items-stretch xs:items-center justify-end gap-2.5 sm:gap-3">
                    {/* Recipient Pending Controls */}
                    {isPending && !isProposer && (
                      <>
                        <button
                          onClick={() => handleStatusChange(swap._id, 'Declined')}
                          disabled={actionLoading === swap._id}
                          className="w-full xs:w-auto px-4 py-2.5 min-h-[42px] text-xs font-bold text-[#DC5555] border border-[#DC5555]/30 hover:bg-[#DC5555]/10 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleStatusChange(swap._id, 'Accepted')}
                          disabled={actionLoading === swap._id}
                          className="w-full xs:w-auto btn-emerald !py-2.5 !px-5 !text-xs min-h-[42px] flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept Barter Proposal</span>
                        </button>
                      </>
                    )}

                    {/* Proposer Waiting Notice */}
                    {isPending && isProposer && (
                      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2.5 w-full">
                        <span className="text-xs text-[#E7A62C] font-bold">
                          Waiting for {otherParty?.name} to accept proposal
                        </span>
                        <button
                          onClick={() => handleStatusChange(swap._id, 'Cancelled')}
                          disabled={actionLoading === swap._id}
                          className="px-3.5 py-2 min-h-[40px] text-xs font-bold text-[#708096] hover:text-[#DC5555] transition-colors cursor-pointer self-start xs:self-auto"
                        >
                          Cancel Proposal
                        </button>
                      </div>
                    )}

                    {/* Active Swap Controls */}
                    {isActive && (
                      <>
                        <button
                          onClick={() => handleStatusChange(swap._id, 'Cancelled')}
                          disabled={actionLoading === swap._id}
                          className="w-full xs:w-auto px-3.5 py-2.5 min-h-[42px] text-xs font-bold text-[#708096] hover:text-[#DC5555] transition-colors cursor-pointer flex items-center justify-center"
                        >
                          Terminate Swap
                        </button>
                        <button
                          onClick={() => handleStatusChange(swap._id, 'Completed')}
                          disabled={actionLoading === swap._id}
                          className="w-full xs:w-auto btn-emerald !py-2.5 !px-5 !text-xs min-h-[42px] flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Mark As Completed</span>
                        </button>
                      </>
                    )}

                    {/* Completed Swap Controls */}
                    {isCompleted && (
                      <button
                        onClick={() => setSelectedUserForProfile(otherParty?._id)}
                        className="w-full xs:w-auto btn-white !py-2.5 !px-4 !text-xs !rounded-xl min-h-[42px] flex items-center justify-center gap-1.5"
                      >
                        <Star className="w-4 h-4 fill-[#E7A62C] text-[#E7A62C]" />
                        <span>Rate Barter Partner</span>
                      </button>
                    )}

                    {/* Report Dispute Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setReportSwapData({
                          swapId: swap._id,
                          targetUser: otherParty,
                          title: `${swap.offeredSkill?.name || 'Skill'} ⇄ ${swap.requestedSkill?.name || 'Skill'}`
                        });
                        setShowReportModal(true);
                      }}
                      className="w-full xs:w-auto px-3.5 py-2.5 min-h-[42px] text-xs font-bold text-slate-500 hover:text-rose-600 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      title="Report an issue or breach of barter terms with this agreement"
                    >
                      <Flag className="w-3.5 h-3.5 text-rose-500" />
                      <span>Report Issue</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Sidebar (Spec 10-H) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Agreement Summary */}
          <div className="card-clean p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E5EAE7] dark:border-slate-800">
              <Sparkles className="w-4 h-4 text-[#07866D]" />
              <h3 className="font-extrabold text-sm text-[#102B50] dark:text-white">
                Agreement Summary
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#EAF6EF] dark:bg-emerald-950/40 border border-[#07866D]/20 dark:border-emerald-800/40">
                <span className="text-[10px] font-bold text-[#07866D] dark:text-emerald-400 uppercase tracking-wider block">
                  Active Swaps
                </span>
                <span className="text-2xl font-extrabold text-[#102B50] dark:text-white">
                  {swaps.filter(s => s.status === 'Accepted').length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#EEF6FC] dark:bg-sky-950/40 border border-[#183A60]/15 dark:border-sky-800/40">
                <span className="text-[10px] font-bold text-[#183A60] dark:text-sky-400 uppercase tracking-wider block">
                  Completed
                </span>
                <span className="text-2xl font-extrabold text-[#102B50] dark:text-white">
                  {swaps.filter(s => s.status === 'Completed').length}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#708096] dark:text-slate-400 pt-1">
              <span>Pending Proposals:</span>
              <span className="font-bold text-[#102B50] dark:text-white">
                {swaps.filter(s => s.status === 'Pending').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#708096] dark:text-slate-400">
              <span>Total Agreements:</span>
              <span className="font-bold text-[#102B50] dark:text-white">
                {swaps.length}
              </span>
            </div>
          </div>

          {/* 2. Milestones Overview */}
          <div className="card-clean p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E5EAE7] dark:border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-[#07866D]" />
              <h3 className="font-extrabold text-sm text-[#102B50] dark:text-white">
                Milestones Overview
              </h3>
            </div>

            {(() => {
              const allMilestones = swaps.flatMap(s => s.milestones || []);
              const finished = allMilestones.filter(m => m.completed).length;
              const rate = allMilestones.length > 0 ? Math.round((finished / allMilestones.length) * 100) : 0;
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#708096] dark:text-slate-400">Overall Completion</span>
                    <span className="font-extrabold text-[#07866D] dark:text-emerald-400">{rate}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E5EAE7] dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-[#07866D] rounded-full transition-all duration-300"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#708096] dark:text-slate-400 leading-relaxed">
                    {finished} of {allMilestones.length} learning goals completed across all your agreements.
                  </p>
                </div>
              );
            })()}
          </div>

          {/* 3. Next Session Info */}
          <div className="card-clean p-6 space-y-3 bg-gradient-to-br from-white to-[#F1F8F2] dark:from-[#0E1526] dark:to-[#0A1222]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#07866D] dark:text-emerald-400" />
              <h4 className="font-extrabold text-sm text-[#102B50] dark:text-white">Next Session Tips</h4>
            </div>
            <p className="text-xs text-[#708096] dark:text-slate-400 leading-relaxed">
              Always agree on session agendas 24 hours in advance via Live Chat to maximize reciprocal learning output.
            </p>
            <button
              onClick={() => navigate('/chat')}
              className="btn-white !w-full !py-2 !text-xs !rounded-xl text-center"
            >
              Open Live Chat
            </button>
          </div>

          {/* 4. Community Encouragement Panel */}
          <div className="card-clean p-6 space-y-3 border-[#07866D]/30 bg-[#EAF6EF]/60 dark:bg-emerald-950/30 dark:border-emerald-800/40">
            <span className="text-xl">🤝</span>
            <h4 className="font-extrabold text-sm text-[#102B50] dark:text-white">
              SkillSwap PK Guarantee
            </h4>
            <p className="text-xs text-[#24364B]/80 dark:text-slate-300 leading-relaxed">
              Our barter policy protects both parties: equal commitment, respectful communication, and zero monetary friction. Teach with passion, learn with curiosity!
            </p>
          </div>
        </div>
      </div>

      {/* User Profile & Rating Modal */}
      <UserProfileModal
        isOpen={Boolean(selectedUserForProfile)}
        onClose={() => setSelectedUserForProfile(null)}
        userId={selectedUserForProfile}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setReportSwapData(null);
        }}
        targetUser={reportSwapData?.targetUser}
        targetContentId={reportSwapData?.swapId}
        contentType="swap_agreement"
        contentSnapshot={reportSwapData ? `Swap Agreement: ${reportSwapData.title}` : null}
      />
    </div>
  );
}
