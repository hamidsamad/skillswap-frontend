import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { X, Calendar, Clock, Video, FileText, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProposeSwapModal({ isOpen, onClose, targetProfile, onSuccess }) {
  const { user, profile } = useAuth();
  const [allSkills, setAllSkills] = useState([]);
  const [offeredSkillId, setOfferedSkillId] = useState('');
  const [requestedSkillId, setRequestedSkillId] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(2);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(60);
  const [learningMode, setLearningMode] = useState('Online');
  const [venue, setVenue] = useState('Google Meet / Zoom');
  const [terms, setTerms] = useState('Mutual commitment of 1 hour weekly exchange. No commercial fee.');
  const [initialMessage, setInitialMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch full list of skills for fallback pickers
  useEffect(() => {
    async function loadSkills() {
      try {
        const res = await api.get('/skills');
        if (res.data.success) {
          setAllSkills(res.data.skills);
        }
      } catch (e) {
        console.error('Failed to load skills:', e);
      }
    }
    loadSkills();
  }, []);

  // Pre-fill skills intelligently when targetProfile changes
  useEffect(() => {
    if (targetProfile) {
      const targetTeaches = targetProfile.teachingSkills || [];
      if (targetTeaches.length > 0) {
        const firstSkill = targetTeaches[0].skill;
        setRequestedSkillId(firstSkill?._id || firstSkill || '');
      }

      const myTeaches = profile?.teachingSkills || [];
      if (myTeaches.length > 0) {
        const firstSkill = myTeaches[0].skill;
        setOfferedSkillId(firstSkill?._id || firstSkill || '');
      }

      setInitialMessage(
        `Salam ${targetProfile.user?.name}! I would love to exchange skills with you on SkillSwap PK. Looking forward to learning together!`
      );
    }
  }, [targetProfile, profile]);

  if (!isOpen || !targetProfile) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!offeredSkillId || !requestedSkillId) {
      setError('Please select both the skill you offer and the skill you request.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        recipientId: targetProfile.user?._id || targetProfile.user,
        offeredSkillId,
        requestedSkillId,
        durationWeeks: Number(durationWeeks),
        sessionsPerWeek: Number(sessionsPerWeek),
        sessionDurationMinutes: Number(sessionDurationMinutes),
        learningMode,
        venue,
        terms,
        initialMessage
      };

      const res = await api.post('/swaps', payload);
      if (res.data.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (onSuccess) onSuccess(res.data.swap);
        onClose();
      } else {
        setError(res.data.message || 'Failed to submit proposal');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error submitting proposal');
    } finally {
      setLoading(false);
    }
  };

  const myTeachingList = (profile?.teachingSkills || []).map(ts => ts.skill).filter(Boolean);
  const targetTeachingList = (targetProfile?.teachingSkills || []).map(ts => ts.skill).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 rounded-2xl xs:rounded-3xl w-full max-w-2xl p-4 xs:p-6 sm:p-8 shadow-2xl relative max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 text-[#708096] hover:text-[#102B50] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
          title="Close proposal modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            <span className="p-2 sm:p-2.5 rounded-2xl bg-[#EAF6EF] text-[#07866D] border border-[#07866D]/20 shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg xs:text-xl font-extrabold text-[#102B50] dark:text-white">
                Propose 1-on-1 Skill Barter
              </h3>
              <p className="text-xs text-[#708096] dark:text-slate-400 mt-0.5 font-medium">
                Create a transparent exchange agreement with <span className="font-bold text-[#07866D]">{targetProfile.user?.name}</span>
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-[#DC5555]/30 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-[#DC5555]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Two Distinct Skill Selection Panels (Pale Mint for Offer, Pale Blue for Request) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Skill You Offer (Pale Mint) */}
            <div className="p-4 rounded-2xl bg-[#EAF6EF] dark:bg-emerald-950/40 border border-[#07866D]/20 dark:border-emerald-800/40">
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#07866D] dark:text-emerald-400 mb-1.5">
                Skill You Will Teach (Your Offer)
              </label>
              <select
                value={offeredSkillId}
                onChange={(e) => setOfferedSkillId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-[#07866D]/30 dark:border-emerald-700/50 rounded-xl text-xs text-[#102B50] dark:text-white focus:ring-2 focus:ring-[#07866D] outline-none font-medium cursor-pointer"
              >
                <option value="">Select skill you offer...</option>
                {myTeachingList.length > 0 && (
                  <optgroup label="From Your Teaching Skills">
                    {myTeachingList.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="All Platform Skills">
                  {allSkills.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.category})</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Skill You Request (Pale Blue) */}
            <div className="p-4 rounded-2xl bg-[#EEF6FC] dark:bg-sky-950/40 border border-[#183A60]/15 dark:border-sky-800/40">
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#183A60] dark:text-sky-300 mb-1.5">
                Skill You Want To Learn (Their Offer)
              </label>
              <select
                value={requestedSkillId}
                onChange={(e) => setRequestedSkillId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-[#183A60]/30 dark:border-sky-700/50 rounded-xl text-xs text-[#102B50] dark:text-white focus:ring-2 focus:ring-[#183A60] outline-none font-medium cursor-pointer"
              >
                <option value="">Select skill to learn...</option>
                {targetTeachingList.length > 0 && (
                  <optgroup label={`Taught by ${targetProfile.user?.name}`}>
                    {targetTeachingList.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="All Platform Skills">
                  {allSkills.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.category})</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Logistics Row: Duration, Sessions, Length */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] dark:text-slate-400 mb-1.5">
                Duration (Weeks)
              </label>
              <select
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] font-medium cursor-pointer"
              >
                <option value={2}>2 Weeks (Sprint)</option>
                <option value={4}>4 Weeks (Standard Month)</option>
                <option value={6}>6 Weeks (Deep Dive)</option>
                <option value={8}>8 Weeks (Comprehensive)</option>
                <option value={12}>12 Weeks (Quarterly)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] dark:text-slate-400 mb-1.5">
                Sessions / Week
              </label>
              <select
                value={sessionsPerWeek}
                onChange={(e) => setSessionsPerWeek(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] font-medium cursor-pointer"
              >
                <option value={1}>1 Session / Week</option>
                <option value={2}>2 Sessions / Week</option>
                <option value={3}>3 Sessions / Week</option>
                <option value={4}>4 Sessions / Week</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] dark:text-slate-400 mb-1.5">
                Session Length
              </label>
              <select
                value={sessionDurationMinutes}
                onChange={(e) => setSessionDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] font-medium cursor-pointer"
              >
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (Standard)</option>
                <option value={90}>90 Minutes</option>
                <option value={120}>120 Minutes</option>
              </select>
            </div>
          </div>

          {/* Mode & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] dark:text-slate-400 mb-1.5">
                Exchange Mode
              </label>
              <select
                value={learningMode}
                onChange={(e) => setLearningMode(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] font-medium cursor-pointer"
              >
                <option value="Online">Online Video (Google Meet / Zoom)</option>
                <option value="Physical">In-Person (Cafe / Incubator)</option>
                <option value="Both">Hybrid (Both)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] dark:text-slate-400 mb-1.5">
                Venue or Video Platform
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Google Meet, Discord, or e.g. NIC Karachi / Daftarkhwan Lahore"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] font-medium"
              />
            </div>
          </div>

          {/* Introductory Message */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] dark:text-slate-400 mb-1.5">
              Personalized Intro & Learning Goals
            </label>
            <textarea
              rows={3}
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Explain why you are excited to barter with them and what milestones you hope to accomplish..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] font-medium"
            />
          </div>

          <div className="pt-2 flex flex-col-reverse xs:flex-row gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-white flex-1 !py-2.5 min-h-[44px] !text-xs !rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-emerald flex-1 !py-2.5 min-h-[44px] !text-xs !rounded-xl flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending Proposal...' : 'Send Swap Proposal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
