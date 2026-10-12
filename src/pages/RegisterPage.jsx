import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Camera,
  X,
  Upload,
  BookOpen,
  Share2,
  TrendingUp,
  ShieldCheck,
  Crop,
  Check,
  Trash2
} from 'lucide-react';
import { SKILL_CATEGORIES } from '../utils/skillsList';
import { PAKISTANI_CITIES } from '../utils/pakistanCities';
import SkillExchangeLogo from '../components/SkillExchangeLogo';
import ImageCropModal from '../components/ImageCropModal';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Lahore');
  const [learningMode, setLearningMode] = useState('Both');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [error, setError] = useState('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState('');
  const fileInputRef = React.useRef(null);

  const pakistaniCities = PAKISTANI_CITIES;

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const dataUrl = readerEvent.target?.result;
      if (typeof dataUrl === 'string') {
        setRawImageSrc(dataUrl);
        setCropModalOpen(true);
        setError('');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropApply = (croppedDataUrl) => {
    setAvatar(croppedDataUrl);
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
    setRawImageSrc('');
  };

  const handleOpenCropAdjust = () => {
    if (rawImageSrc || avatar) {
      setCropModalOpen(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await register({
      name,
      email,
      password,
      city,
      learningMode,
      headline: headline || 'Skill Enthusiast from Pakistan',
      bio: bio || 'Excited to barter skills across Pakistan!',
      avatar: avatar || ''
    });

    if (res.success) {
      navigate('/profile');
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-3 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-10 bg-[#FAF9F5] dark:bg-[#080B14] transition-colors duration-200">
      {/* 2-Column Split-Screen Layout (Spec 12) */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
        {/* A. Left Branding Panel (Spec 12-A) */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6 text-center lg:text-left order-2 lg:order-1">
          {/* Logo & Platform Badge */}
          <div className="flex flex-col lg:items-start items-center space-y-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-[#131B2E] border border-[#E5EAE7] dark:border-slate-800 shadow-sm p-2 flex items-center justify-center">
              <SkillExchangeLogo className="w-full h-full" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/40 text-[#07866D] dark:text-emerald-400 text-xs font-bold border border-[#07866D]/20 dark:border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-[#07866D] dark:bg-emerald-400" />
              Pakistan’s 1st Skill Exchange Platform
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102B50] dark:text-white leading-tight font-display">
              Join <span className="text-[#07866D] dark:text-emerald-400">SkillSwap PK</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#708096] dark:text-slate-400 mt-2 leading-relaxed">
              Exchange skills. Build connections. Grow together — across Pakistan.
            </p>
          </div>

          {/* 3 Compact Benefit Items */}
          <div className="space-y-3 pt-2 text-left">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 shadow-xs">
              <div className="p-2 rounded-xl bg-[#EAF6EF] dark:bg-emerald-950/50 text-[#07866D] dark:text-emerald-400 shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#102B50] dark:text-white">Learn New Skills</h4>
                <p className="text-[11px] text-[#708096] dark:text-slate-400 mt-0.5">
                  Learn from practicing designers, coders, and language masters across Pakistan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 shadow-xs">
              <div className="p-2 rounded-xl bg-[#EEF6FC] dark:bg-sky-950/50 text-[#183A60] dark:text-sky-300 shrink-0 mt-0.5">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#102B50] dark:text-white">Share Your Skills</h4>
                <p className="text-[11px] text-[#708096] dark:text-slate-400 mt-0.5">
                  Give back by mentoring someone in what you do best.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 shadow-xs">
              <div className="p-2 rounded-xl bg-[#EAF6EF] dark:bg-emerald-950/50 text-[#07866D] dark:text-emerald-400 shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#102B50] dark:text-white">Build Your Future</h4>
                <p className="text-[11px] text-[#708096] dark:text-slate-400 mt-0.5">
                  100% reciprocal barter: learn everything you need with 0 Rupees spent.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#708096] dark:text-slate-400 pt-1 justify-center lg:justify-start">
            <ShieldCheck className="w-4 h-4 text-[#07866D] dark:text-emerald-400" />
            <span>Safe &amp; Verified Pakistani Community</span>
          </div>
        </div>

        {/* B. Right Registration Card (Spec 12-B & 12-C) */}
        <div className="lg:col-span-7 card-clean p-4 xs:p-6 sm:p-8 shadow-md border border-[#E5EAE7] dark:border-slate-800 dark:bg-[#0E1526] order-1 lg:order-2">
          {/* Sign In / Register Tabs Toggle */}
          <div className="flex rounded-xl bg-[#FAF9F5] dark:bg-[#131B2E] p-1 border border-[#E5EAE7] dark:border-slate-700 mb-6">
            <Link
              to="/login"
              className="flex-1 py-2 rounded-lg text-xs font-bold text-[#708096] dark:text-slate-400 hover:text-[#102B50] dark:hover:text-white text-center transition-all"
            >
              Sign In
            </Link>
            <button
              type="button"
              className="flex-1 py-2 rounded-lg text-xs font-extrabold bg-[#07866D] text-white shadow-xs transition-all"
            >
              Register
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-[#102B50] dark:text-white">
              Create Your Free Account
            </h2>
            <p className="text-xs text-[#708096] dark:text-slate-400 mt-1">
              Start swapping skills today. Takes less than 60 seconds.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-[#DC5555]/30 dark:border-rose-800/40 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-[#DC5555] dark:text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture Upload & Live Adjustment Preview */}
            <div className="p-3.5 bg-[#FAF9F5] dark:bg-[#131B2E] rounded-2xl border border-[#E5EAE7] dark:border-slate-700 transition-all">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarSelect}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
              />
              <div className="flex items-center gap-4">
                {/* Live Avatar Preview Thumbnail */}
                <div className="relative shrink-0">
                  {avatar ? (
                    <div className="relative group">
                      <img
                        src={avatar}
                        alt="Live Profile Preview"
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#07866D] shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#07866D] text-white flex items-center justify-center text-[10px] ring-2 ring-white dark:ring-[#131B2E] shadow-2xs">
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#102B50] to-[#183A60] dark:from-slate-800 dark:to-slate-700 text-white font-black flex items-center justify-center text-sm shadow-xs border border-[#E5EAE7] dark:border-slate-700">
                      {name ? name.slice(0, 2).toUpperCase() : 'PK'}
                    </div>
                  )}
                </div>

                {/* Content & Action Buttons */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold text-[#102B50] dark:text-white truncate">
                      {avatar ? 'Profile Photo Ready' : 'Profile Photo (Optional)'}
                    </p>
                    {avatar && (
                      <span className="text-[10px] font-bold text-[#07866D] dark:text-emerald-400 bg-[#EAF6EF] dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        Cropped
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#708096] dark:text-slate-400 truncate mt-0.5">
                    {avatar ? 'Adjust crop area, change, or remove' : 'Upload and adjust your picture'}
                  </p>

                  {/* Action Buttons Row */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {avatar ? (
                      <>
                        <button
                          type="button"
                          onClick={handleOpenCropAdjust}
                          className="px-2.5 py-1 rounded-xl bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-300 hover:bg-[#07866D] hover:text-white dark:hover:bg-[#07866D] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                          title="Crop, zoom, or reposition this picture"
                        >
                          <Crop className="w-3.5 h-3.5" />
                          <span>Adjust &amp; Crop</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-[#E5EAE7] dark:border-slate-700 text-[#24364B] dark:text-slate-300 hover:text-[#07866D] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Select a different photo"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Change</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="px-2 py-1 rounded-xl text-[#DC5555] hover:bg-[#DC5555]/10 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 hover:bg-[#07866D] hover:text-white dark:hover:bg-[#07866D] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload &amp; Adjust Photo</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-[#708096]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Daniyal Siddiqui"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#708096]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="daniyal@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#708096]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] mb-1.5">
                  Pakistani City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] cursor-pointer"
                >
                  {pakistaniCities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] mb-1.5">
                  Learning Mode
                </label>
                <select
                  value={learningMode}
                  onChange={(e) => setLearningMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] cursor-pointer"
                >
                  <option value="Online">Online Video (Zoom/Meet)</option>
                  <option value="Physical">In-Person Only</option>
                  <option value="Both">Both (Hybrid)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#708096] mb-1.5 flex items-center justify-between">
                <span>Personal Headline (IT Field & Skills)</span>
                <span className="text-[10px] text-[#708096] normal-case font-normal">(Optional)</span>
              </label>
              <select
                id="register-headline-skills"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#24364B] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D] cursor-pointer"
              >
                <option value="">-- Select Your IT Course / Skill --</option>
                {SKILL_CATEGORIES.map((group) => (
                  <optgroup
                    key={group.category}
                    label={`── ${group.category} ──`}
                    className="font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
                  >
                    {group.skills.map((skillName) => (
                      <option
                        key={skillName}
                        value={skillName}
                        className="font-normal text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                      >
                        {skillName}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-emerald !w-full !py-3 !rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm shadow-[#07866D]/20 cursor-pointer"
            >
              <span>{loading ? 'Creating Profile...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#708096] dark:text-slate-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-extrabold text-[#07866D] dark:text-emerald-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Image Adjustment & Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawImageSrc || avatar}
        onClose={() => setCropModalOpen(false)}
        onApply={handleCropApply}
        title="Adjust Profile Picture"
      />
    </div>
  );
}
