import React from 'react';
import { X, CheckCircle, MapPin, Laptop, Sparkles, ArrowRightLeft, BookOpen, GraduationCap } from 'lucide-react';
import UserAvatar from './UserAvatar';

export default function CompatibilityModal({ isOpen, onClose, targetUser, compatibility }) {
  if (!isOpen || !compatibility) return null;

  const { totalScore, baseScore, isMutual, matchType, bonuses, matchingSkills } = compatibility;
  const sameCity = bonuses?.sameCity?.active;
  const modeOverlap = bonuses?.modeOverlap?.active;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 rounded-3xl w-full max-w-xl p-4 xs:p-6 md:p-8 shadow-2xl relative max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
        <button
          onClick={onClose}
          className="absolute top-3 xs:top-4 right-3 xs:right-4 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#708096] hover:text-[#102B50] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 xs:gap-4 mb-6">
          <div className="relative">
            <UserAvatar
              user={targetUser?.user}
              size="xl"
              className="ring-2 ring-[#07866D]/30 shadow-sm"
            />
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-[#07866D] text-white text-[10px] font-black rounded-full shadow-xs">
              {totalScore}%
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-[#102B50] dark:text-white">
                Compatibility Breakdown
              </h3>
            </div>
            <p className="text-xs text-[#708096] dark:text-slate-400 mt-0.5 font-medium">
              Deterministic barter match score with <span className="font-bold text-[#07866D]">{targetUser?.user?.name}</span>
            </p>
          </div>
        </div>

        {/* Overall Score Highlight */}
        <div className="p-4 mb-6 rounded-2xl bg-[#EAF6EF] dark:bg-emerald-950/40 border border-[#07866D]/20 dark:border-emerald-800/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-black tracking-wider text-[#07866D] dark:text-emerald-400">
              Total Algorithmic Match
            </div>
            <div className="text-3xl font-black text-[#102B50] dark:text-white flex items-center gap-2 mt-0.5">
              <span>{totalScore}%</span>
              {isMutual ? (
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 bg-white dark:bg-slate-800 text-[#07866D] dark:text-emerald-400 rounded-full border border-[#07866D]/30 dark:border-emerald-800/40 shadow-xs">
                  Direct 2-Way Loop
                </span>
              ) : (
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 bg-white dark:bg-slate-800 text-[#183A60] dark:text-sky-300 rounded-full border border-[#183A60]/20 dark:border-sky-800/40 shadow-xs">
                  One-Way Exchange
                </span>
              )}
            </div>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#07866D] dark:text-emerald-400 font-black text-2xl shadow-xs border border-[#07866D]/20 dark:border-emerald-800/40">
            🤝
          </div>
        </div>

        {/* Factor Breakdown List */}
        <div className="space-y-3 mb-6">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-[#708096] dark:text-slate-400">
            Scoring Factor Weights
          </h4>

          {/* Factor 1: Base Barter Loop */}
          <div className="p-3.5 rounded-2xl border border-[#E5EAE7] dark:border-slate-800 bg-[#FAF9F5] dark:bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#EAF6EF] dark:bg-emerald-950/50 text-[#07866D] dark:text-emerald-400">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#102B50] dark:text-white">
                  Base Barter Reciprocity
                </div>
                <div className="text-[11px] text-[#708096] dark:text-slate-400 mt-0.5">
                  {isMutual
                    ? '100% — You teach what they want AND they teach what you want'
                    : '50% — One-way skill alignment between teacher and student'}
                </div>
              </div>
            </div>
            <span className="font-extrabold text-xs text-[#07866D] dark:text-emerald-400">
              +{baseScore}%
            </span>
          </div>

          {/* Factor 2: Same-City Bonus */}
          <div className="p-3.5 rounded-2xl border border-[#E5EAE7] dark:border-slate-800 bg-[#FAF9F5] dark:bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#EEF6FC] dark:bg-sky-950/50 text-[#183A60] dark:text-sky-300">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#102B50] dark:text-white">
                  Regional Proximity Bonus
                </div>
                <div className="text-[11px] text-[#708096] dark:text-slate-400 mt-0.5">
                  {sameCity
                    ? `Active (+15%) — Both located in ${targetUser?.city || 'the same Pakistani city'}`
                    : 'Inactive (0%) — Different Pakistani cities'}
                </div>
              </div>
            </div>
            <span className={`font-extrabold text-xs ${sameCity ? 'text-[#07866D] dark:text-emerald-400' : 'text-slate-400'}`}>
              {sameCity ? `+${bonuses?.sameCity?.weight}%` : '0%'}
            </span>
          </div>

          {/* Factor 3: Learning Mode Overlap */}
          <div className="p-3.5 rounded-2xl border border-[#E5EAE7] dark:border-slate-800 bg-[#FAF9F5] dark:bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#EAF6EF] dark:bg-emerald-950/50 text-[#07866D] dark:text-emerald-400">
                <Laptop className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#102B50] dark:text-white">
                  Learning Mode Overlap
                </div>
                <div className="text-[11px] text-[#708096] dark:text-slate-400 mt-0.5">
                  {modeOverlap
                    ? `Active (+15%) — Compatible preferred learning modes`
                    : 'Inactive (0%) — Incompatible learning formats'}
                </div>
              </div>
            </div>
            <span className={`font-extrabold text-xs ${modeOverlap ? 'text-[#07866D] dark:text-emerald-400' : 'text-slate-400'}`}>
              {modeOverlap ? `+${bonuses?.modeOverlap?.weight}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Matching Skills Matrix */}
        {matchingSkills && (matchingSkills.theyWantWhatYouTeach?.length > 0 || matchingSkills.youWantWhatTheyTeach?.length > 0) && (
          <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-slate-900/60 border border-[#E5EAE7] dark:border-slate-800 space-y-3 mb-6">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-[#102B50] dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#07866D] dark:text-emerald-400" />
              <span>Matching Skills Inventory</span>
            </h4>

            {matchingSkills.theyWantWhatYouTeach?.length > 0 && (
              <div>
                <div className="text-[11px] text-[#708096] dark:text-slate-400 font-bold mb-1.5 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#07866D] dark:text-emerald-400" />
                  <span>You Teach → They Want:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchingSkills.theyWantWhatYouTeach.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/40 text-[#07866D] dark:text-emerald-400 text-[11px] font-bold border border-[#07866D]/20 dark:border-emerald-800/40">
                      {s.skill?.name || s.name || s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {matchingSkills.youWantWhatTheyTeach?.length > 0 && (
              <div className="pt-2 border-t border-[#E5EAE7] dark:border-slate-800">
                <div className="text-[11px] text-[#708096] dark:text-slate-400 font-bold mb-1.5 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#183A60] dark:text-sky-300" />
                  <span>They Teach → You Want:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchingSkills.youWantWhatTheyTeach.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-[#EEF6FC] dark:bg-sky-950/40 text-[#183A60] dark:text-sky-300 text-[11px] font-bold border border-[#183A60]/15 dark:border-sky-800/40">
                      {s.skill?.name || s.name || s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="btn-white !w-full !py-2.5 min-h-[44px] !text-xs !rounded-xl"
        >
          Close Breakdown
        </button>
      </div>
    </div>
  );
}
