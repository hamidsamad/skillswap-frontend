import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Star,
  MapPin,
  Laptop,
  Clock,
  BookOpen,
  GraduationCap,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Send,
  UserCheck,
  Calendar,
  Loader2,
  Flag
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import ReportModal from './ReportModal';

export default function UserProfileModal({
  isOpen,
  onClose,
  userId,
  initialProfile = null,
  onRatingSubmitted = null
}) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [selectedScore, setSelectedScore] = useState(5);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  const targetUserId = userId || initialProfile?.user?._id || initialProfile?.user;
  const isOwnProfile = currentUser && targetUserId && String(currentUser._id) === String(targetUserId);

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login');
      return;
    }
    setStartingChat(true);
    try {
      const res = await api.post('/chat/conversations', { recipientId: targetUserId });
      if (res.data.success && res.data.conversation?._id) {
        onClose();
        navigate(`/chat?conversationId=${res.data.conversation._id}`);
      }
    } catch (err) {
      console.error('Failed to open chat:', err);
    } finally {
      setStartingChat(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !targetUserId) return;

    async function fetchProfile() {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await api.get(`/profiles/${targetUserId}`);
        if (res.data.success) {
          setProfile(res.data.profile);
          // Check if current user already rated
          const existing = (res.data.profile.ratings || []).find(
            r => String(r.rater?._id || r.rater) === String(currentUser?._id)
          );
          if (existing) {
            setSelectedScore(existing.score || 5);
            setComment(existing.comment || '');
          } else {
            setSelectedScore(5);
            setComment('');
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setErrorMsg('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [isOpen, targetUserId, currentUser]);

  if (!isOpen) return null;

  const targetUser = profile?.user || {};
  const currentRating = profile?.rating || 0;
  const reviewCount = profile?.reviewCount || 0;
  const ratingsList = profile?.ratings || [];

  const existingUserRating = ratingsList.find(
    r => String(r.rater?._id || r.rater) === String(currentUser?._id)
  );

  const scoreLabels = {
    1: 'Needs Improvement',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Outstanding!'
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setErrorMsg('Please sign in to rate this user.');
      return;
    }

    if (isOwnProfile) {
      setErrorMsg('You cannot rate your own profile.');
      return;
    }

    setSubmittingRating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post(`/profiles/${targetUserId}/rate`, {
        score: selectedScore,
        comment
      });

      if (res.data.success) {
        setProfile(res.data.profile);
        setSuccessMsg(res.data.message || 'Rating successfully recorded!');
        if (onRatingSubmitted) {
          onRatingSubmitted(res.data.profile);
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 rounded-2xl xs:rounded-3xl w-full max-w-2xl p-4 xs:p-6 sm:p-8 shadow-2xl relative max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain space-y-5 sm:space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 text-[#708096] hover:text-[#102B50] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10 cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
          title="Close profile view"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-20 text-center text-[#708096]">
            <div className="relative w-10 h-10 mx-auto mb-3">
              <div className="w-10 h-10 rounded-full border-4 border-[#07866D]/20 border-t-[#07866D] animate-spin" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider">Loading member profile...</p>
          </div>
        ) : (
          <>
            {/* Header Badge */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 pb-5 border-b border-[#E5EAE7] dark:border-slate-800">
              <UserAvatar
                user={targetUser}
                size="2xl"
                className="ring-4 ring-[#07866D]/20 shadow-md shrink-0"
              />

              <div className="flex-1 text-center sm:text-left space-y-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-lg xs:text-xl sm:text-2xl font-black text-[#102B50] dark:text-white">
                    {targetUser.name || 'SkillSwap Member'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EAF6EF] text-[#07866D] text-xs font-bold border border-[#07866D]/20">
                    {profile?.city || 'Pakistan'}
                  </span>
                </div>

                <p className="text-xs text-[#708096] dark:text-slate-400 font-medium">
                  {targetUser.headline || 'SkillSwap Pakistan Member'}
                </p>

                {/* Real Community Rating & Swaps */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 pt-1.5 text-xs">
                  {reviewCount > 0 ? (
                    <span className="flex items-center gap-1.5 text-[#E7A62C] font-bold bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                      <Star className="w-4 h-4 fill-[#E7A62C]" />
                      <span>{currentRating.toFixed(1)}</span>
                      <span className="text-[#708096] font-normal">
                        ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[#708096] dark:text-slate-400 font-semibold bg-[#FAF9F5] dark:bg-slate-900/60 px-2.5 py-1 rounded-xl border border-[#E5EAE7] dark:border-slate-800">
                      <Star className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      <span>Not Rated Yet (0 reviews)</span>
                    </span>
                  )}
                  <span className="text-[#E5EAE7] hidden xs:inline">•</span>
                  <span className="text-[#07866D] font-bold">
                    {profile?.completedSwapsCount || 0} Swaps Completed
                  </span>
                </div>

                {!isOwnProfile && (
                  <div className="pt-2.5 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleStartChat}
                      disabled={startingChat}
                      className="btn-emerald !py-2 !px-4 !text-xs !rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      {startingChat ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <MessageSquare className="w-3.5 h-3.5" />
                      )}
                      <span>Start Live Chat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowReportModal(true)}
                      className="py-2 px-3 text-xs font-bold text-slate-500 hover:text-rose-600 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer flex items-center gap-1.5"
                      title="Report this member for community guideline violations"
                    >
                      <Flag className="w-3.5 h-3.5 text-rose-500" />
                      <span>Report Member</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bio & Details */}
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-black uppercase tracking-wider text-[#708096] text-[10px] mb-1.5">
                  About Member
                </h3>
                <p className="text-[#24364B] dark:text-slate-300 leading-relaxed bg-[#FAF9F5] dark:bg-slate-900/50 p-4 rounded-2xl border border-[#E5EAE7] dark:border-slate-800">
                  {profile?.bio || 'No bio provided yet.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#FAF9F5] dark:bg-slate-900/50 rounded-2xl border border-[#E5EAE7] dark:border-slate-800 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#EEF6FC] text-[#183A60]">
                    <Laptop className="w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#708096] uppercase font-black block">Mode</span>
                    <span className="text-[#102B50] dark:text-slate-200 font-bold">{profile?.learningMode || 'Both'}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAF9F5] dark:bg-slate-900/50 rounded-2xl border border-[#E5EAE7] dark:border-slate-800 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#EAF6EF] text-[#07866D]">
                    <Clock className="w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#708096] uppercase font-black block">Availability</span>
                    <span className="text-[#102B50] dark:text-slate-200 font-bold">{profile?.availability || 'Flexible'}</span>
                  </div>
                </div>
              </div>

              {/* Skills Offered (Pale Mint) */}
              <div>
                <h3 className="font-black uppercase tracking-wider text-[#708096] text-[10px] mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#07866D]" />
                  <span>Teaching Skills (What They Offer)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(profile?.teachingSkills || []).length === 0 ? (
                    <span className="text-[#708096] italic">No skills listed yet</span>
                  ) : (
                    profile.teachingSkills.map((ts, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-[#EAF6EF] text-[#07866D] border border-[#07866D]/20 font-bold text-xs"
                      >
                        {ts.skill?.name || ts.skill} ({ts.level})
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Learning Goals (Pale Blue) */}
              <div>
                <h3 className="font-black uppercase tracking-wider text-[#708096] text-[10px] mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#183A60]" />
                  <span>Learning Goals (What They Want to Learn)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(profile?.learningSkills || []).length === 0 ? (
                    <span className="text-[#708096] italic">No goals listed yet</span>
                  ) : (
                    profile.learningSkills.map((ls, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-[#EEF6FC] text-[#183A60] border border-[#183A60]/20 font-bold text-xs"
                      >
                        {ls.skill?.name || ls.skill}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Rating Section */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF9F5] dark:bg-slate-900/60 border border-[#E5EAE7] dark:border-slate-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-extrabold text-sm text-[#102B50] dark:text-white flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#E7A62C] fill-[#E7A62C]" />
                    <span>Rate {targetUser.name || 'Member'}</span>
                  </h3>
                  <p className="text-[11px] text-[#708096] dark:text-slate-400 font-medium mt-0.5">
                    Ratings are given by other users to calculate this member's overall community score.
                  </p>
                </div>

                {existingUserRating && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/40 text-[#07866D] dark:text-emerald-400 text-[10px] font-black border border-[#07866D]/20 dark:border-emerald-800/40">
                    You Rated: {existingUserRating.score} ★
                  </span>
                )}
              </div>

              {isOwnProfile ? (
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 text-[#708096] dark:text-slate-300 text-xs flex items-center gap-2.5 leading-relaxed border border-[#E5EAE7] dark:border-slate-700">
                  <AlertCircle className="w-4 h-4 text-[#07866D] shrink-0" />
                  <span>
                    This is your own profile. You cannot rate yourself. Your overall rating is calculated automatically as other members view your profile and submit ratings.
                  </span>
                </div>
              ) : !isAuthenticated ? (
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 text-[#708096] dark:text-slate-300 text-xs font-medium border border-[#E5EAE7] dark:border-slate-700">
                  Please log in to your account to rate this member.
                </div>
              ) : (
                <form onSubmit={handleRateSubmit} className="space-y-3.5">
                  {successMsg && (
                    <div className="p-3 bg-[#EAF6EF] dark:bg-emerald-950/40 border border-[#07866D]/30 dark:border-emerald-800/40 rounded-2xl text-xs text-[#07866D] dark:text-emerald-400 flex items-center gap-2 font-bold">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-[#DC5555]/30 dark:border-rose-800/40 rounded-2xl text-xs text-[#DC5555] dark:text-rose-400 flex items-center gap-2 font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Star Rating Selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#102B50] dark:text-white">
                      Your Rating:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = (hoverScore || selectedScore) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverScore(star)}
                            onMouseLeave={() => setHoverScore(0)}
                            onClick={() => setSelectedScore(star)}
                            className="p-1 text-slate-300 hover:scale-125 transition-transform cursor-pointer"
                            title={`${star} Star - ${scoreLabels[star]}`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                isFilled
                                  ? 'text-[#E7A62C] fill-[#E7A62C]'
                                  : 'text-[#E5EAE7] dark:text-slate-700'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-black text-[#E7A62C] ml-2">
                      {scoreLabels[hoverScore || selectedScore]}
                    </span>
                  </div>

                  {/* Feedback comment input */}
                  <div>
                    <textarea
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Optional feedback: e.g. Polite, highly skilled, great barter partner..."
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] transition-all font-medium"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingRating}
                      className="btn-emerald !py-2 !px-4 !text-xs !rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>{submittingRating ? 'Saving...' : existingUserRating ? 'Update Rating' : 'Submit Rating'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Peer Reviews History */}
            <div className="space-y-3 pt-2">
              <h3 className="font-black text-xs uppercase tracking-wider text-[#708096] dark:text-slate-400 flex items-center justify-between">
                <span>Reviews from Other Members</span>
                <span className="text-[#102B50] dark:text-white font-bold">{ratingsList.length} total</span>
              </h3>

              {ratingsList.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-slate-900/50 border border-[#E5EAE7] dark:border-slate-800 text-center text-xs text-[#708096] dark:text-slate-400 italic font-medium">
                  No peer reviews yet. Be the first to rate this member!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {ratingsList.map((r, i) => (
                    <div
                      key={r._id || i}
                      className="p-3.5 bg-white dark:bg-slate-900/60 rounded-2xl border border-[#E5EAE7] dark:border-slate-800 text-xs flex items-start gap-3"
                    >
                      <UserAvatar
                        user={r.rater}
                        size="sm"
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-[#102B50] dark:text-white truncate">
                            {r.rater?.name || 'SkillSwap Member'}
                          </span>
                          <div className="flex items-center gap-0.5 text-[#E7A62C] shrink-0">
                            {[...Array(5)].map((_, s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s < r.score ? 'fill-[#E7A62C]' : 'text-slate-200 dark:text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {r.comment && (
                          <p className="text-[#708096] dark:text-slate-400 text-[11px] mt-1 leading-snug font-medium">
                            "{r.comment}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetUser={targetUser}
        contentType="profile"
      />
    </div>
  );
}
