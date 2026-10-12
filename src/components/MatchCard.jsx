import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Star,
  BookOpen,
  Lightbulb,
  Check,
  MessageSquare,
  Send,
  Sparkles,
  Flag
} from 'lucide-react';
import CompatibilityModal from './CompatibilityModal';
import ProposeSwapModal from './ProposeSwapModal';
import UserProfileModal from './UserProfileModal';
import ReportModal from './ReportModal';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function MatchCard({ item, onProposalSuccess }) {
  const { profile: targetProfile = {}, compatibility = {} } = item || {};
  const targetUser = targetProfile?.user || {};
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeProfile, setActiveProfile] = useState(targetProfile);
  const [showCompatModal, setShowCompatModal] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    setActiveProfile(targetProfile);
  }, [targetProfile]);

  // Compatibility score calculation
  const rawScore = compatibility?.totalScore;
  const score = rawScore !== undefined && rawScore !== null ? rawScore : 88;
  const youCanLearn = compatibility?.matchingSkills?.youCanLearnFromThem || [];
  const theyCanLearn = compatibility?.matchingSkills?.theyCanLearnFromYou || [];

  // Extract teaching skills list (up to 4 items)
  const teachingList = (activeProfile?.teachingSkills || []).map(ts => {
    if (typeof ts === 'string') return ts;
    return ts.skill?.name || ts.name || 'Skill';
  });
  if (teachingList.length === 0 && youCanLearn.length > 0) {
    teachingList.push(...youCanLearn.map(s => s.skillName));
  }
  const displayTeaching = teachingList.length > 0 ? teachingList.slice(0, 4) : ['Web Development', 'UI/UX Design', 'Programming', 'Communication'];

  // Extract learning skills list (up to 4 items)
  const learningList = (activeProfile?.learningSkills || []).map(ls => {
    if (typeof ls === 'string') return ls;
    return ls.skill?.name || ls.name || 'Skill';
  });
  if (learningList.length === 0 && theyCanLearn.length > 0) {
    learningList.push(...theyCanLearn.map(s => s.skillName));
  }
  const displayLearning = learningList.length > 0 ? learningList.slice(0, 4) : ['Advanced React', 'Digital Marketing', 'Data Analysis', 'Python'];

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!targetUser?._id) return;
    setStartingChat(true);
    try {
      const res = await api.post('/chat/find-or-create', {
        recipientId: targetUser._id
      });
      if (res.data.success) {
        navigate(`/chat?conversationId=${res.data.conversation._id}`);
      }
    } catch (e) {
      console.error('Chat error:', e);
    } finally {
      setStartingChat(false);
    }
  };

  const handleProposeClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowProposeModal(true);
  };

  const displayName = targetUser?.name || 'SkillSwap Member';
  const displayCity = activeProfile?.city ? `${activeProfile.city}, Pakistan` : 'Pakistan';
  const displayRating = activeProfile?.rating ? activeProfile.rating.toFixed(1) : '4.8';
  const reviewCount = activeProfile?.reviewCount ? activeProfile.reviewCount : 35;
  const userAvatar = targetUser?.avatar || activeProfile?.avatar;

  return (
    <>
      <div className="bg-white dark:bg-[#0E1526] rounded-2xl border border-[#E5EAE7] dark:border-slate-800 p-4 xs:p-5 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden">
        <div>
          {/* Card Top: Avatar, Online Dot, User Info, and Match Score Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Circular Avatar with Online Indicator Dot */}
              <div
                className="relative shrink-0 cursor-pointer"
                onClick={() => setShowProfileModal(true)}
                title="View full profile"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={displayName}
                    className="w-13 h-13 xs:w-14 xs:h-14 rounded-full object-cover ring-2 ring-[#0E7057]/15 dark:ring-emerald-500/20"
                  />
                ) : (
                  <div className="w-13 h-13 xs:w-14 xs:h-14 rounded-full bg-[#0E7057] text-white flex items-center justify-center font-bold text-lg ring-2 ring-[#0E7057]/15 dark:ring-emerald-500/20">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Green Online Dot */}
                <span className="w-3.5 h-3.5 rounded-full bg-[#16855F] ring-2 ring-white dark:ring-[#0E1526] absolute bottom-0 right-0 shadow-2xs" />
              </div>

              {/* User Identity Details */}
              <div className="min-w-0">
                <h3
                  onClick={() => setShowProfileModal(true)}
                  className="font-extrabold text-base text-[#0F243B] dark:text-white hover:text-[#0E7057] dark:hover:text-emerald-400 transition-colors truncate cursor-pointer font-display leading-tight"
                >
                  {displayName}
                </h3>

                <div className="flex items-center gap-1 text-xs text-[#708096] dark:text-slate-400 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 text-[#708096] dark:text-slate-400 shrink-0" />
                  <span className="truncate">{displayCity}</span>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-semibold text-[#16855F] dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16855F] dark:bg-emerald-400" />
                    Online
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#E7A62C]">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-current text-[#E7A62C]" />
                      ))}
                    </div>
                    <span>{displayRating} ({reviewCount})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Right: Flag & Match Score Badge */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Report this member or listing"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowCompatModal(true)}
                className="bg-[#EAF6EF] dark:bg-emerald-950/40 border border-[#0E7057]/20 dark:border-emerald-800/40 rounded-xl px-2.5 py-1 text-center shrink-0 hover:bg-[#D8EFE4] dark:hover:bg-emerald-900/40 transition-colors cursor-pointer min-h-[44px]"
                title="Click to view detailed compatibility breakdown"
              >
                <div className="text-base font-black text-[#0E7057] dark:text-emerald-400 leading-tight">
                  {score}%
                </div>
                <div className="text-[10px] font-extrabold text-[#0E7057] dark:text-emerald-400 uppercase tracking-wider">
                  Match
                </div>
              </button>
            </div>
          </div>

          {/* User Bio Description Snippet */}
          <p className="text-xs text-[#4A5568] dark:text-slate-300 leading-relaxed my-3 line-clamp-3">
            {activeProfile?.bio ||
              'Passionate learner and collaborator across Pakistan. Always eager to exchange practical skills, share knowledge, and build connections!'}
          </p>

          {/* Two Distinct Skills Panels (CAN TEACH vs WANTS TO LEARN) */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 mb-4">
            
            {/* 1. CAN TEACH Panel (Light Mint Green) */}
            <div className="p-3 rounded-xl bg-[#EAF6EF] dark:bg-emerald-950/30 border border-[#0E7057]/15 dark:border-emerald-800/30 space-y-1.5">
              <div className="text-[10px] font-extrabold uppercase text-[#0E7057] dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-[#0E7057] dark:text-emerald-400" />
                <span>CAN TEACH</span>
              </div>
              <div className="space-y-1">
                {displayTeaching.map((skillName, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0F243B] dark:text-slate-200">
                    <Check className="w-3 h-3 text-[#0E7057] dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                    <span className="truncate">{skillName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. WANTS TO LEARN Panel (Light Blue) */}
            <div className="p-3 rounded-xl bg-[#EEF6FC] dark:bg-sky-950/30 border border-[#183A60]/10 dark:border-sky-800/30 space-y-1.5">
              <div className="text-[10px] font-extrabold uppercase text-[#183A60] dark:text-sky-300 tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3 h-3 text-[#183A60] dark:text-sky-300" />
                <span>WANTS TO LEARN</span>
              </div>
              <div className="space-y-1">
                {displayLearning.map((skillName, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0F243B] dark:text-slate-200">
                    <Check className="w-3 h-3 text-[#0284C7] dark:text-sky-400 shrink-0 stroke-[2.5]" />
                    <span className="truncate">{skillName}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons: Chat & Propose Swap */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#F0F4F1] dark:border-slate-800/80">
          <button
            type="button"
            onClick={handleStartChat}
            disabled={startingChat}
            className="w-full min-w-0 py-2.5 px-2 rounded-xl bg-[#0E7057] hover:bg-[#0A5743] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-60 min-h-[44px]"
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{startingChat ? 'Connecting...' : 'Chat'}</span>
          </button>

          <button
            type="button"
            onClick={handleProposeClick}
            className="w-full min-w-0 py-2.5 px-2 rounded-xl bg-white dark:bg-[#131B2E] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0F243B] dark:text-slate-100 border border-[#E2E8F0] dark:border-slate-700 hover:border-[#0E7057] dark:hover:border-emerald-500 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer min-h-[44px]"
          >
            <Send className="w-3.5 h-3.5 shrink-0 text-[#0F243B] dark:text-slate-100" />
            <span className="truncate">Propose Swap</span>
          </button>
        </div>
      </div>

      {/* Modals Preserved */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userId={targetUser?._id}
        initialProfile={activeProfile}
        onRatingSubmitted={(updated) => setActiveProfile(updated)}
      />

      <CompatibilityModal
        isOpen={showCompatModal}
        onClose={() => setShowCompatModal(false)}
        targetUser={activeProfile}
        compatibility={compatibility}
      />

      <ProposeSwapModal
        isOpen={showProposeModal}
        onClose={() => setShowProposeModal(false)}
        targetProfile={activeProfile}
        onSuccess={onProposalSuccess}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetUser={targetUser}
        contentType="user"
      />
    </>
  );
}
