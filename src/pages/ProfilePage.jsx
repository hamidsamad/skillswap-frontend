import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Users,
  Compass,
  MessageSquare,
  ArrowRightLeft,
  User,
  Bell,
  HelpCircle,
  LogOut,
  MapPin,
  GraduationCap,
  Clock,
  Save,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Camera,
  Check,
  X,
  Search,
  ChevronDown,
  Target,
  FileText,
  Star,
  RefreshCw,
  Trash2,
  Menu,
  Link2
} from 'lucide-react';
import ReauthModal from '../components/ReauthModal';
import DeleteAccountModal from '../components/DeleteAccountModal';
import UserNotificationDropdown from '../components/UserNotificationDropdown';
import { SKILL_CATEGORIES } from '../utils/skillsList';
import { PAKISTANI_CITIES } from '../utils/pakistanCities';

// Client-side image optimizer to keep avatar uploads lightweight and instant
function optimizeImage(file, maxWidth = 500, maxHeight = 500, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file format'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const webpUrl = canvas.toDataURL('image/webp', quality);
          if (webpUrl && webpUrl.startsWith('data:image/webp')) {
            resolve(webpUrl);
            return;
          }
        } catch (err) {
          // Fallback to jpeg
        }
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const { user, profile, updateProfileData, updateUserData, refreshMe, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Sync fresh profile data on mount to ensure latest stats and reviews
  useEffect(() => {
    if (refreshMe) {
      refreshMe();
    }
  }, [refreshMe]);

  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Form states matching existing database models
  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [city, setCity] = useState(profile?.city || 'Lahore');
  const [learningMode, setLearningMode] = useState(profile?.learningMode || 'Both');
  const [availability, setAvailability] = useState(profile?.availability || 'Evenings & Weekends (PKT)');

  // Direct image URL input toggle
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');

  // Teaching skills array [{ skill, level, experienceYears, description }]
  const [teachingSkills, setTeachingSkills] = useState(
    (profile?.teachingSkills || []).map(ts => ({
      skill: ts.skill?._id || ts.skill,
      level: ts.level || 'Intermediate',
      experienceYears: ts.experienceYears || 1,
      description: ts.description || ''
    }))
  );

  // Learning skills array [{ skill, priority, notes }]
  const [learningSkills, setLearningSkills] = useState(
    (profile?.learningSkills || []).map(ls => ({
      skill: ls.skill?._id || ls.skill,
      priority: ls.priority || 'High',
      notes: ls.notes || ''
    }))
  );

  const pakistaniCities = PAKISTANI_CITIES;

  // Fetch all available skills from backend for instant selection
  useEffect(() => {
    async function loadSkills() {
      try {
        const res = await api.get('/skills');
        if (res.data.success) {
          setAllSkills(res.data.skills);
        }
      } catch (e) {
        console.error('Error fetching skills:', e);
      }
    }
    loadSkills();
  }, []);

  // Sync state when profile or user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHeadline(user.headline || '');
      setAvatar(user.avatar || '');
    }
    if (profile) {
      setBio(profile.bio || '');
      setCity(profile.city || 'Lahore');
      setLearningMode(profile.learningMode || 'Both');
      setAvailability(profile.availability || 'Evenings & Weekends (PKT)');
      setTeachingSkills(
        (profile.teachingSkills || []).map(ts => ({
          skill: ts.skill?._id || ts.skill,
          level: ts.level || 'Intermediate',
          experienceYears: ts.experienceYears || 1,
          description: ts.description || ''
        }))
      );
      setLearningSkills(
        (profile.learningSkills || []).map(ls => ({
          skill: ls.skill?._id || ls.skill,
          priority: ls.priority || 'High',
          notes: ls.notes || ''
        }))
      );
    }
  }, [user, profile]);

  // Helper to resolve skill name from ID or string
  const getSkillName = (val) => {
    if (!val) return '';
    const found = allSkills.find(s => s._id === val || s.name === val);
    return found ? found.name : val;
  };

  // Avatar upload handler
  const processAndSaveFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG or WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB. Please choose a smaller photo.');
      return;
    }

    setUploadingAvatar(true);
    setErrorMsg('');

    try {
      const optimizedDataUrl = await optimizeImage(file, 500, 500);
      setAvatar(optimizedDataUrl);

      const res = await api.put('/auth/profile', { avatar: optimizedDataUrl });
      if (res.data.success) {
        updateUserData(res.data.user);
        setSuccessMsg('Profile picture updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to process/upload image:', err);
      setErrorMsg('Could not process this image. Please try another file.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processAndSaveFile(file);
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    setErrorMsg('');

    try {
      const res = await api.put('/auth/profile', { avatar: '' });
      if (res.data.success) {
        setAvatar('');
        updateUserData(res.data.user);
        setSuccessMsg('Profile picture removed successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to remove profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleApplyUrl = async (e) => {
    e.preventDefault();
    const trimmed = urlInputValue.trim();
    if (!trimmed) return;

    setUploadingAvatar(true);
    setErrorMsg('');

    try {
      const res = await api.put('/auth/profile', { avatar: trimmed });
      if (res.data.success) {
        setAvatar(trimmed);
        updateUserData(res.data.user);
        setShowUrlInput(false);
        setUrlInputValue('');
        setSuccessMsg('Profile photo URL updated!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update photo URL');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Add / Remove Learning Skills (Tags chip management)
  const addLearningSkillByName = (skillName) => {
    if (!skillName) return;
    const doc = allSkills.find(s => s.name === skillName);
    const identifier = doc?._id || skillName;

    // Check if already in list
    const alreadyExists = learningSkills.some(ls => (ls.skill?._id || ls.skill) === identifier);
    if (!alreadyExists) {
      setLearningSkills(prev => [
        ...prev,
        { skill: identifier, priority: 'High', notes: '' }
      ]);
    }
  };

  const removeLearningSkill = (index) => {
    setLearningSkills(prev => prev.filter((_, i) => i !== index));
  };

  // Add / Remove Teaching Skills (Tags chip management)
  const addTeachingSkillByName = (skillName) => {
    if (!skillName) return;
    const doc = allSkills.find(s => s.name === skillName);
    const identifier = doc?._id || skillName;

    const alreadyExists = teachingSkills.some(ts => (ts.skill?._id || ts.skill) === identifier);
    if (!alreadyExists) {
      setTeachingSkills(prev => [
        ...prev,
        { skill: identifier, level: 'Intermediate', experienceYears: 1, description: '' }
      ]);
    }
  };

  const removeTeachingSkill = (index) => {
    setTeachingSkills(prev => prev.filter((_, i) => i !== index));
  };

  // Save profile submission
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const profileRes = await api.put('/profiles/me', {
        name,
        avatar,
        headline,
        bio,
        city,
        learningMode,
        availability,
        teachingSkills,
        learningSkills
      });

      if (profileRes.data.success) {
        if (profileRes.data.user) {
          updateUserData(profileRes.data.user);
        }
        updateProfileData(profileRes.data.profile);
      }

      try {
        const userRes = await api.put('/auth/profile', { name, headline, avatar });
        if (userRes.data?.success && userRes.data?.user) {
          updateUserData(userRes.data.user);
        }
      } catch (authErr) {
        console.warn('Auth sync notice:', authErr.message);
      }

      setSuccessMsg('Profile and preferences successfully saved!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/skills?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Default display values matching reference presentation
  const displayName = name || user?.name || 'Zarshen Khan';
  const displayCity = city || 'Lahore';

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#080B14] py-6 sm:py-8 px-3 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Hidden file input for picture upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Main Rounded App Card Layout Matching Reference Design */}
      <div className="max-w-[1240px] mx-auto bg-white dark:bg-[#0E1526] rounded-3xl md:rounded-[32px] border border-[#E5EAE7] dark:border-slate-800 shadow-[0_15px_45px_-12px_rgba(16,43,80,0.06)] overflow-hidden transition-colors">
        
        {/* Mobile Header with Hamburger for Sidebar */}
        <div className="lg:hidden flex items-center justify-between p-3.5 sm:p-4 border-b border-[#E5EAE7] dark:border-slate-800 bg-[#FAF9F5] dark:bg-[#0A0F1D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#102B50] dark:bg-slate-800 p-1.5 flex items-center justify-center shrink-0">
              <img
                src="/skillswap-icon.png"
                alt="SkillSwap Logo"
                className="w-full h-full object-contain filter invert brightness-125"
              />
            </div>
            <span className="font-extrabold text-base text-[#102B50] dark:text-white">SkillSwap PK</span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 min-w-[42px] min-h-[42px] flex items-center justify-center rounded-xl text-[#102B50] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle profile navigation menu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5 text-rose-500" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[820px]">
          
          {/* ========================================================= */}
          {/* LEFT SIDEBAR NAVIGATION (Matching Reference Design)       */}
          {/* ========================================================= */}
          <aside className={`lg:col-span-3 border-r border-[#E5EAE7] dark:border-slate-800 p-4 sm:p-6 flex flex-col justify-between bg-[#FAF9F5]/80 dark:bg-[#0A0F1D]/90 ${mobileSidebarOpen ? 'block border-b lg:border-b-0' : 'hidden lg:flex'}`}>
            <div className="space-y-6">
              {/* Brand Logo Header */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#102B50] dark:bg-slate-800 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                  <img
                    src="/skillswap-icon.png"
                    alt="SkillSwap"
                    className="w-full h-full object-contain filter invert brightness-125"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg text-[#102B50] dark:text-white tracking-tight font-display">
                      SkillSwap
                    </span>
                    <span className="bg-[#D8EFE4] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded leading-none border border-transparent dark:border-emerald-800/40">
                      PK
                    </span>
                  </div>
                  <div className="text-[9px] font-bold tracking-widest text-[#708096] dark:text-slate-400 uppercase">
                    SKILL EXCHANGE
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1 pt-2">
                <Link
                  to="/"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 min-h-[42px] rounded-xl text-xs font-semibold text-[#4A5568] dark:text-slate-300 hover:bg-[#EEF4F0] dark:hover:bg-[#131B2E] hover:text-[#0F243B] dark:hover:text-white transition-colors"
                >
                  <Home className="w-4 h-4 text-[#708096] dark:text-slate-400" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/matches"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 min-h-[42px] rounded-xl text-xs font-semibold text-[#4A5568] dark:text-slate-300 hover:bg-[#EEF4F0] dark:hover:bg-[#131B2E] hover:text-[#0F243B] dark:hover:text-white transition-colors"
                >
                  <Search className="w-4 h-4 text-[#708096] dark:text-slate-400" />
                  <span>Match Finder</span>
                </Link>

                <Link
                  to="/skills"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 min-h-[42px] rounded-xl text-xs font-semibold text-[#4A5568] dark:text-slate-300 hover:bg-[#EEF4F0] dark:hover:bg-[#131B2E] hover:text-[#0F243B] dark:hover:text-white transition-colors"
                >
                  <Compass className="w-4 h-4 text-[#708096] dark:text-slate-400" />
                  <span>Skills Directory</span>
                </Link>

                <Link
                  to="/chat"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 min-h-[42px] rounded-xl text-xs font-semibold text-[#4A5568] dark:text-slate-300 hover:bg-[#EEF4F0] dark:hover:bg-[#131B2E] hover:text-[#0F243B] dark:hover:text-white transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-[#708096] dark:text-slate-400" />
                  <span>Live Chat</span>
                </Link>

                <Link
                  to="/swaps"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 min-h-[42px] rounded-xl text-xs font-semibold text-[#4A5568] dark:text-slate-300 hover:bg-[#EEF4F0] dark:hover:bg-[#131B2E] hover:text-[#0F243B] dark:hover:text-white transition-colors"
                >
                  <ArrowRightLeft className="w-4 h-4 text-[#708096] dark:text-slate-400" />
                  <span>Swap Agreements</span>
                </Link>

                <div className="pt-2 pb-1" />

                {/* Profile Settings (Selected / Active State in Reference Design) */}
                <div className="flex items-center gap-3 px-3.5 py-2.5 min-h-[42px] rounded-xl text-xs font-bold bg-[#EAF6EF] dark:bg-emerald-950/40 text-[#0E7057] dark:text-emerald-400 border border-transparent dark:border-emerald-800/40 shadow-2xs">
                  <User className="w-4 h-4 text-[#0E7057] dark:text-emerald-400" />
                  <span>Profile Settings</span>
                </div>

                <Link
                  to="/chat"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 min-h-[42px] rounded-xl text-xs font-semibold text-[#4A5568] dark:text-slate-300 hover:bg-[#EEF4F0] dark:hover:bg-[#131B2E] hover:text-[#0F243B] dark:hover:text-white transition-colors"
                >
                  <Bell className="w-4 h-4 text-[#708096] dark:text-slate-400" />
                  <span>Notifications</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    setSuccessMsg('SkillSwap Support is ready to assist at support@skillswap.pk');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 min-h-[42px] rounded-xl text-xs font-semibold text-[#4A5568] dark:text-slate-300 hover:bg-[#EEF4F0] dark:hover:bg-[#131B2E] hover:text-[#0F243B] dark:hover:text-white transition-colors text-left cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-[#708096] dark:text-slate-400" />
                  <span>Help & Support</span>
                </button>
              </nav>
            </div>

            {/* Bottom Section: Better Skills Card & Log Out */}
            <div className="pt-6 space-y-4">
              {/* Better Skills / Bigger Opportunities Promo Banner */}
              <div className="bg-[#EAF6EF]/90 dark:bg-emerald-950/30 border border-[#D5EAE0] dark:border-emerald-800/40 rounded-2xl p-4 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-[#D8EFE4] dark:bg-emerald-900/60 text-[#0E7057] dark:text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h4 className="text-xs font-extrabold text-[#0F243B] dark:text-white leading-tight font-display">
                  Better Skills <br />
                  Bigger Opportunities
                </h4>
                <p className="text-[11px] text-[#708096] dark:text-slate-400 pt-1">
                  Learn. Share. Grow.
                </p>
              </div>

              {/* Log Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-2 py-2 text-xs font-bold text-[#64748B] dark:text-slate-400 hover:text-[#DC5555] dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* RIGHT CONTENT AREA: Top Bar + Profile Form + Stats Cards  */}
          {/* ========================================================= */}
          <div className="lg:col-span-9 flex flex-col bg-white dark:bg-[#0E1526]">
            
            {/* Top Navigation Bar Matching Reference Image */}
            <div className="border-b border-[#E5EAE7] dark:border-slate-800 px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2.5 sm:gap-4">
              {/* Search Bar Input */}
              <form onSubmit={handleSearchSubmit} className="flex-1 max-w-[200px] xs:max-w-xs sm:max-w-md">
                <div className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-full bg-[#FAF9F5] dark:bg-[#131B2E] border border-[#E5EAE7] dark:border-slate-700 focus-within:border-[#07866D] focus-within:bg-white dark:focus-within:bg-[#18233c] transition-all">
                  <Search className="w-3.5 h-3.5 text-[#708096] dark:text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search skills, people..."
                    className="w-full text-xs text-[#102B50] dark:text-white placeholder-[#8C9BAE] dark:placeholder-slate-400 bg-transparent outline-none font-medium"
                  />
                </div>
              </form>

              {/* Right Controls: Notifications & User Profile Chip */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                {/* Notification Dropdown */}
                <UserNotificationDropdown />

                {/* User Dropdown Pill */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 pl-1.5 pr-2 py-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={displayName}
                      className="w-7 h-7 rounded-full object-cover border border-[#E5EAE7] dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#07866D] text-white flex items-center justify-center font-bold text-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-bold text-[#102B50] dark:text-white hidden sm:inline max-w-[100px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#708096] dark:text-slate-400" />
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-3.5 xs:p-4 sm:p-6 sm:p-8 space-y-5 sm:space-y-6">
              
              {/* Profile & Settings Page Header */}
              <div>
                <h1 className="text-2xl font-extrabold text-[#102B50] dark:text-white font-display">
                  Profile & Settings
                </h1>
                <p className="text-xs text-[#708096] dark:text-slate-400 mt-0.5">
                  Manage your profile, skills and preferences
                </p>
              </div>

              {/* Status Alert Messages */}
              {successMsg && (
                <div className="p-3.5 rounded-xl bg-[#EAF6EF] dark:bg-emerald-950/40 border border-[#07866D]/30 dark:border-emerald-800/40 flex items-center gap-2.5 text-xs font-bold text-[#07866D] dark:text-emerald-400 shadow-2xs">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-[#DC5555]/30 dark:border-rose-800/40 flex items-center gap-2.5 text-xs font-bold text-[#DC5555] dark:text-rose-400 shadow-2xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 2-Column Split: Form (Left) & Info Cards (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ---------------------------------------------------- */}
                {/* CENTER/LEFT: Avatar Card + Form                      */}
                {/* ---------------------------------------------------- */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-5">
                  
                  {/* 1. Upload Profile Picture Card */}
                  <div className="rounded-2xl border border-[#E5EAE7] dark:border-slate-800 p-4 sm:p-5 bg-white dark:bg-[#131B2E] shadow-2xs flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 transition-colors">
                    <div className="relative shrink-0">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={displayName}
                          className="w-20 h-20 rounded-full object-cover ring-4 ring-[#EAF6EF] dark:ring-emerald-950/50 border border-[#D5EAE0] dark:border-emerald-800/40"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-[#0E7057] text-white flex items-center justify-center font-bold text-2xl ring-4 ring-[#EAF6EF] dark:ring-emerald-950/50">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Green Camera Icon Overlay Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute bottom-0 right-0 p-1.5 bg-[#0E7057] hover:bg-[#0A5743] text-white rounded-full shadow-md transition-colors cursor-pointer"
                        title="Upload Profile Picture"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h3 className="text-xs font-bold text-[#0F243B] dark:text-white">
                          Upload Profile Picture
                        </h3>
                        <p className="text-[11px] text-[#708096] dark:text-slate-400 mt-0.5">
                          JPG, PNG or WEBP (Max 5MB)
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="px-3.5 py-1.5 rounded-xl bg-[#0E7057] hover:bg-[#0A5743] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          {uploadingAvatar && <RefreshCw className="w-3 h-3 animate-spin" />}
                          <span>Change Photo</span>
                        </button>

                        {avatar && (
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            disabled={uploadingAvatar}
                            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#0E1526] border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-[#64748B] dark:text-slate-300 hover:text-[#DC5555] dark:hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                            showUrlInput
                              ? 'bg-[#EAF6EF] dark:bg-emerald-950/60 border-[#0E7057] text-[#0E7057] dark:text-emerald-400'
                              : 'bg-white dark:bg-[#0E1526] border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0F243B] dark:text-slate-200 hover:border-[#0E7057]/50'
                          }`}
                          title="Set profile photo using an image URL"
                        >
                          <Link2 className="w-3.5 h-3.5 text-[#0E7057] dark:text-emerald-400" />
                          <span>{showUrlInput ? 'Hide Photo URL' : 'Use Photo URL'}</span>
                        </button>
                      </div>

                      {showUrlInput && (
                        <form onSubmit={handleApplyUrl} className="pt-2 flex flex-col xs:flex-row items-center gap-2 w-full max-w-md animate-in fade-in duration-200">
                          <div className="relative flex-1 w-full">
                            <Link2 className="w-3.5 h-3.5 text-[#708096] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="url"
                              required
                              value={urlInputValue}
                              onChange={(e) => setUrlInputValue(e.target.value)}
                              placeholder="https://example.com/avatar.jpg"
                              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#0E1526] border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs text-[#0F243B] dark:text-white outline-none focus:border-[#0E7057] focus:ring-2 focus:ring-[#0E7057]/15 font-medium transition-all"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 w-full xs:w-auto shrink-0">
                            <button
                              type="submit"
                              disabled={uploadingAvatar || !urlInputValue.trim()}
                              className="flex-1 xs:flex-none px-3.5 py-1.5 bg-[#0E7057] hover:bg-[#0A5743] text-white rounded-xl text-xs font-bold cursor-pointer transition-all disabled:opacity-50 shadow-2xs flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              {uploadingAvatar && <RefreshCw className="w-3 h-3 animate-spin" />}
                              <span>Apply Photo</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowUrlInput(false);
                                setUrlInputValue('');
                              }}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#708096] dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* 2. Main Profile Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Row 1: Full Name & Pakistan City (2 columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold text-[#0F243B] dark:text-slate-200 mb-1.5">
                          Full Name <span className="text-[#DC5555]">*</span>
                        </label>
                        <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2.5 flex items-center gap-2.5 focus-within:border-[#0E7057] focus-within:ring-2 focus-within:ring-[#0E7057]/15 transition-all">
                          <User className="w-4 h-4 text-[#708096] dark:text-slate-400 shrink-0" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full text-xs text-[#0F243B] dark:text-white font-medium outline-none bg-transparent p-0 leading-tight"
                          />
                        </div>
                      </div>

                      {/* Pakistan City */}
                      <div>
                        <label className="block text-xs font-bold text-[#0F243B] dark:text-slate-200 mb-1.5">
                          Pakistan City <span className="text-[#DC5555]">*</span>
                        </label>
                        <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2.5 flex items-center gap-2.5 focus-within:border-[#0E7057] focus-within:ring-2 focus-within:ring-[#0E7057]/15 transition-all">
                          <MapPin className="w-4 h-4 text-[#708096] dark:text-slate-400 shrink-0" />
                          <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full text-xs text-[#0F243B] dark:text-white dark:bg-[#131B2E] font-medium outline-none bg-transparent p-0 cursor-pointer"
                          >
                            {pakistaniCities.map(c => (
                              <option key={c} value={c} className="dark:bg-[#131B2E] dark:text-white">{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Learning Mode */}
                    <div>
                      <label className="block text-xs font-bold text-[#0F243B] dark:text-slate-200 mb-1.5">
                        Learning Mode <span className="text-[#DC5555]">*</span>
                      </label>
                      <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2.5 flex items-center gap-2.5 focus-within:border-[#0E7057] focus-within:ring-2 focus-within:ring-[#0E7057]/15 transition-all">
                        <GraduationCap className="w-4 h-4 text-[#708096] dark:text-slate-400 shrink-0" />
                        <select
                          value={learningMode}
                          onChange={(e) => setLearningMode(e.target.value)}
                          className="w-full text-xs text-[#0F243B] dark:text-white dark:bg-[#131B2E] font-medium outline-none bg-transparent p-0 cursor-pointer"
                        >
                          <option value="Both" className="dark:bg-[#131B2E] dark:text-white">Both (Hybrid)</option>
                          <option value="Online" className="dark:bg-[#131B2E] dark:text-white">Online Video Only (Zoom/Meet)</option>
                          <option value="Physical" className="dark:bg-[#131B2E] dark:text-white">In-Person Only (Cafes/Incubators)</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 3: Skills You Want to Learn (Interactive Tag Box from Reference Image) */}
                    <div>
                      <label className="block text-xs font-bold text-[#0F243B] dark:text-slate-200 mb-1.5">
                        Skills You Want to Learn <span className="text-[#DC5555]">*</span>
                      </label>
                      <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131B2E] p-3 space-y-2.5 focus-within:border-[#0E7057] focus-within:ring-2 focus-within:ring-[#0E7057]/15 transition-all">
                        {/* Selected Tag Chips */}
                        <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
                          {learningSkills.length === 0 ? (
                            <span className="text-xs text-[#94A3B8] dark:text-slate-500 italic">
                              No learning skills selected yet. Choose from dropdown below.
                            </span>
                          ) : (
                            learningSkills.map((ls, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-[#F0F4F2] dark:bg-slate-800 text-[#0F243B] dark:text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 border border-[#E0E8E3] dark:border-slate-700"
                              >
                                <span>{getSkillName(ls.skill)}</span>
                                <button
                                  type="button"
                                  onClick={() => removeLearningSkill(idx)}
                                  className="text-[#708096] dark:text-slate-400 hover:text-[#DC5555] dark:hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                                  title="Remove skill"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>

                        {/* Search or Add More Skills Select */}
                        <div className="pt-1 border-t border-[#F0F4F1] dark:border-slate-700">
                          <select
                            onChange={(e) => {
                              addLearningSkillByName(e.target.value);
                              e.target.value = '';
                            }}
                            defaultValue=""
                            className="w-full text-xs text-[#708096] dark:text-slate-300 dark:bg-[#131B2E] bg-transparent outline-none cursor-pointer"
                          >
                            <option value="" disabled className="dark:bg-[#131B2E] dark:text-slate-400">Search or add more skills...</option>
                            {SKILL_CATEGORIES.map((group) => (
                              <optgroup key={group.category} label={`── ${group.category} ──`} className="dark:bg-[#131B2E] dark:text-slate-300">
                                {group.skills.map((skillName) => (
                                  <option key={skillName} value={skillName} className="dark:bg-[#131B2E] dark:text-white">{skillName}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Row 3b: Skills You Can Teach (What You Offer) */}
                    <div>
                      <label className="block text-xs font-bold text-[#0F243B] dark:text-slate-200 mb-1.5">
                        Skills You Can Teach <span className="text-[#DC5555]">*</span>
                      </label>
                      <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131B2E] p-3 space-y-2.5 focus-within:border-[#0E7057] focus-within:ring-2 focus-within:ring-[#0E7057]/15 transition-all">
                        {/* Selected Teaching Tag Chips */}
                        <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
                          {teachingSkills.length === 0 ? (
                            <span className="text-xs text-[#94A3B8] dark:text-slate-500 italic">
                              No teaching skills added yet. Select skills you are ready to teach.
                            </span>
                          ) : (
                            teachingSkills.map((ts, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-[#EAF6EF] dark:bg-emerald-950/40 text-[#0E7057] dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1.5 border border-[#0E7057]/20 dark:border-emerald-800/40"
                              >
                                <span>{getSkillName(ts.skill)}</span>
                                <button
                                  type="button"
                                  onClick={() => removeTeachingSkill(idx)}
                                  className="text-[#0E7057]/70 dark:text-emerald-400/70 hover:text-[#DC5555] dark:hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                                  title="Remove skill"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>

                        {/* Add Teaching Skills Select */}
                        <div className="pt-1 border-t border-[#F0F4F1] dark:border-slate-700">
                          <select
                            onChange={(e) => {
                              addTeachingSkillByName(e.target.value);
                              e.target.value = '';
                            }}
                            defaultValue=""
                            className="w-full text-xs text-[#708096] dark:text-slate-300 dark:bg-[#131B2E] bg-transparent outline-none cursor-pointer"
                          >
                            <option value="" disabled className="dark:bg-[#131B2E] dark:text-slate-400">Search or add more skills to teach...</option>
                            {SKILL_CATEGORIES.map((group) => (
                              <optgroup key={group.category} label={`── ${group.category} ──`} className="dark:bg-[#131B2E] dark:text-slate-300">
                                {group.skills.map((skillName) => (
                                  <option key={skillName} value={skillName} className="dark:bg-[#131B2E] dark:text-white">{skillName}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Row 4: Your Availability */}
                    <div>
                      <label className="block text-xs font-bold text-[#0F243B] dark:text-slate-200 mb-1.5">
                        Your Availability <span className="text-[#DC5555]">*</span>
                      </label>
                      <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3.5 py-2.5 flex items-center gap-2.5 focus-within:border-[#0E7057] focus-within:ring-2 focus-within:ring-[#0E7057]/15 transition-all">
                        <Clock className="w-4 h-4 text-[#708096] dark:text-slate-400 shrink-0" />
                        <select
                          value={availability}
                          onChange={(e) => setAvailability(e.target.value)}
                          className="w-full text-xs text-[#0F243B] dark:text-white dark:bg-[#131B2E] font-medium outline-none bg-transparent p-0 cursor-pointer"
                        >
                          <option value="Evenings & Weekends (PKT)" className="dark:bg-[#131B2E] dark:text-white">Evenings & Weekends (PKT)</option>
                          <option value="Weekdays (PKT)" className="dark:bg-[#131B2E] dark:text-white">Weekdays (PKT)</option>
                          <option value="Weekends Only (PKT)" className="dark:bg-[#131B2E] dark:text-white">Weekends Only (PKT)</option>
                          <option value="Flexible Schedule (PKT)" className="dark:bg-[#131B2E] dark:text-white">Flexible Schedule (PKT)</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 5: About You Textarea */}
                    <div>
                      <label className="block text-xs font-bold text-[#0F243B] dark:text-slate-200 mb-1.5">
                        About You <span className="text-[#DC5555]">*</span>
                      </label>
                      <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131B2E] p-3 space-y-1 focus-within:border-[#0E7057] focus-within:ring-2 focus-within:ring-[#0E7057]/15 transition-all">
                        <textarea
                          rows={4}
                          maxLength={500}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="I'm a passionate learner and developer. I love building modern web applications, exploring new technologies and connecting with people who can help me grow. Always open to learn, share and collaborate!"
                          className="w-full text-xs text-[#0F243B] dark:text-white font-medium outline-none bg-transparent resize-none leading-relaxed"
                        />
                        <div className="flex justify-end text-[10px] text-[#708096] dark:text-slate-400">
                          {bio.length}/500
                        </div>
                      </div>
                    </div>

                    {/* Row 6: Save Changes Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading || uploadingAvatar}
                        className="w-full py-3 rounded-xl bg-[#0E7057] hover:bg-[#0A5743] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99] disabled:opacity-75"
                      >
                        <Save className="w-4 h-4" />
                        <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* ---------------------------------------------------- */}
                {/* RIGHT COLUMN: Information Cards from Reference Image */}
                {/* ---------------------------------------------------- */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-5">
                  
                  {/* Card 1: Great skills create great connections! */}
                  <div className="rounded-2xl border border-[#D5EAE0] dark:border-emerald-800/40 bg-[#EAF6EF] dark:bg-emerald-950/30 p-5 relative overflow-hidden space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#D8EFE4] dark:bg-emerald-900/60 text-[#0E7057] dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#0F243B] dark:text-white leading-snug font-display">
                          Great skills <br />
                          create great connections!
                        </h3>
                        <p className="text-xs text-[#4A5568] dark:text-slate-300 mt-1 leading-relaxed">
                          Update your profile to get better matches and more opportunities.
                        </p>
                      </div>
                    </div>

                    {/* Decorative Sprout / Leaf Graphic */}
                    <div className="flex justify-end pt-1">
                      <svg className="w-6 h-6 text-[#0E7057] dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 20h10" />
                        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4.1 5.5.8z" />
                        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4.1.9-4.9 2z" />
                      </svg>
                    </div>
                  </div>

                  {/* Card 2: Quick Stats Card */}
                  <div className="rounded-2xl border border-[#E5EAE7] dark:border-slate-800 bg-white dark:bg-[#131B2E] p-5 shadow-2xs space-y-4 transition-colors">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#07866D] dark:text-emerald-400" />
                      <h3 className="text-xs font-bold text-[#102B50] dark:text-white">Quick Stats</h3>
                    </div>

                    <div className="space-y-3.5">
                      {/* Stat 1: Skills You Can Teach */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border border-[#07866D]/20 dark:border-emerald-800/40 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-[#102B50] dark:text-white leading-none">
                            {teachingSkills.length || 12}
                          </div>
                          <div className="text-[11px] text-[#708096] dark:text-slate-400 mt-0.5">
                            Skills You Can Teach
                          </div>
                        </div>
                      </div>

                      {/* Stat 2: Skills You Want to Learn */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EEF6FC] dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-400 border border-[#183A60]/15 dark:border-sky-800/40 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-[#102B50] dark:text-white leading-none">
                            {learningSkills.length || 8}
                          </div>
                          <div className="text-[11px] text-[#708096] dark:text-slate-400 mt-0.5">
                            Skills You Want to Learn
                          </div>
                        </div>
                      </div>

                      {/* Stat 3: Active Swap Agreements */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border border-[#07866D]/20 dark:border-emerald-800/40 flex items-center justify-center shrink-0">
                          <ArrowRightLeft className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-[#102B50] dark:text-white leading-none">
                            {profile?.activeSwapsCount || 5}
                          </div>
                          <div className="text-[11px] text-[#708096] dark:text-slate-400 mt-0.5">
                            Active Swap Agreements
                          </div>
                        </div>
                      </div>

                      {/* Stat 4: Successful Swaps */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border border-[#07866D]/20 dark:border-emerald-800/40 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-[#102B50] dark:text-white leading-none">
                            {profile?.completedSwapsCount || 3}
                          </div>
                          <div className="text-[11px] text-[#708096] dark:text-slate-400 mt-0.5">
                            Successful Swaps
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Learning Goals Card */}
                  <div className="rounded-2xl border border-[#E5EAE7] dark:border-slate-800 bg-white dark:bg-[#131B2E] p-5 shadow-2xs space-y-3.5 transition-colors">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#07866D] dark:text-emerald-400" />
                      <h3 className="text-xs font-bold text-[#102B50] dark:text-white">Learning Goals</h3>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5 text-xs text-[#24364B] dark:text-slate-200">
                        <div className="w-4 h-4 rounded-full bg-[#07866D] text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>
                          {learningSkills[0]?.skill ? `Improve ${getSkillName(learningSkills[0].skill)}` : 'Improve React & Next.js'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-[#24364B] dark:text-slate-200">
                        <div className="w-4 h-4 rounded-full bg-[#07866D] text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>
                          {learningSkills[1]?.skill ? `Learn ${getSkillName(learningSkills[1].skill)}` : 'Learn UI/UX Design'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-[#24364B] dark:text-slate-200">
                        <div className="w-4 h-4 rounded-full bg-[#07866D] text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>Build real projects</span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-[#24364B] dark:text-slate-200">
                        <div className="w-4 h-4 rounded-full bg-[#07866D] text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>Find a mentor</span>
                      </div>
                    </div>
                  </div>

                  {/* Community Reviews (Preserved from original Profile Page) */}
                  {profile?.ratings && profile.ratings.length > 0 && (
                    <div className="rounded-2xl border border-[#E5EAE7] dark:border-slate-800 bg-white dark:bg-[#131B2E] p-5 shadow-2xs space-y-3 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#102B50] dark:text-white">
                          <Star className="w-3.5 h-3.5 text-[#E7A62C] fill-[#E7A62C]" />
                          <span>Community Reviews ({profile.ratings.length})</span>
                        </div>
                        <span className="text-xs font-bold text-[#07866D] dark:text-emerald-400">
                          ★ {profile.rating?.toFixed(1) || '5.0'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {profile.ratings.slice(0, 2).map((r, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 text-[11px]">
                            <div className="font-bold text-[#102B50] dark:text-white">{r.rater?.name || 'Member'}</div>
                            {r.comment && <p className="text-[#708096] dark:text-slate-400 italic mt-0.5">"{r.comment}"</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Danger Zone: Delete Account */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/60 hover:bg-rose-100/80 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-[#DC5555] dark:text-rose-400 text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2 hover:border-[#DC5555]/40 active:scale-95 group"
                      title="Permanently delete your SkillSwap Pakistan account"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#DC5555] dark:text-rose-400 group-hover:scale-110 transition-transform" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal Dialog (Preserved) */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />

      {/* Inline Re-Authentication Modal (Preserved) */}
      <ReauthModal />
    </div>
  );
}
