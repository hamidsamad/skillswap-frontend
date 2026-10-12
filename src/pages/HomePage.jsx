import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRightLeft,
  Search,
  MapPin,
  Users,
  GraduationCap,
  ArrowRight,
  Star,
  Play,
  Code2,
  Palette,
  Languages,
  Music,
  Video,
  FileText,
  TrendingUp,
  Camera,
  Laptop,
  BookOpen,
  MessageSquare,
  X,
  Lightbulb,
  Shield,
  Zap
} from 'lucide-react';
import SkillExchangeLogo from '../components/SkillExchangeLogo';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Close video modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowVideoModal(false);
    };
    if (showVideoModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showVideoModal]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/matches?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/matches');
    }
  };

  // 5 Recommended Skill Partners matching reference design
  const recommendedPartners = [
    {
      id: 'ali-raza',
      name: 'Ali Raza',
      city: 'Lahore',
      rating: '4.8',
      reviews: 32,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      teaches: [
        { name: 'Web Development', icon: Code2 },
        { name: 'UI/UX Design', icon: Palette }
      ],
      learns: [
        { name: 'Graphic Design', icon: Palette },
        { name: 'Photography', icon: Camera }
      ]
    },
    {
      id: 'ayesha-khan',
      name: 'Ayesha Khan',
      city: 'Islamabad',
      rating: '4.7',
      reviews: 28,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      teaches: [
        { name: 'English Speaking', icon: Languages },
        { name: 'Content Writing', icon: FileText }
      ],
      learns: [
        { name: 'Python', icon: Code2 },
        { name: 'Data Analysis', icon: TrendingUp }
      ]
    },
    {
      id: 'usman-ahmad',
      name: 'Usman Ahmad',
      city: 'Karachi',
      rating: '4.9',
      reviews: 41,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      teaches: [
        { name: 'Video Editing', icon: Video },
        { name: 'Graphic Design', icon: Palette }
      ],
      learns: [
        { name: 'Digital Marketing', icon: TrendingUp },
        { name: 'SEO', icon: Search }
      ]
    },
    {
      id: 'sara-malik',
      name: 'Sara Malik',
      city: 'Lahore',
      rating: '4.6',
      reviews: 24,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      teaches: [
        { name: 'Programming', icon: Code2 },
        { name: 'Mathematics', icon: BookOpen }
      ],
      learns: [
        { name: 'Music (Guitar)', icon: Music },
        { name: 'Public Speaking', icon: Users }
      ]
    },
    {
      id: 'bilal-hassan',
      name: 'Bilal Hassan',
      city: 'Islamabad',
      rating: '4.8',
      reviews: 36,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      teaches: [
        { name: 'Photography', icon: Camera },
        { name: 'Video Editing', icon: Video }
      ],
      learns: [
        { name: 'UI/UX Design', icon: Palette },
        { name: 'App Development', icon: Laptop }
      ]
    }
  ];

  return (
    <div className="relative overflow-hidden space-y-16 sm:space-y-20 pb-20 bg-[#FAF9F5]/70 dark:bg-transparent">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Matching Exact Reference Layout)                         */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Badge, Headline, Subtitle, CTAs, Wide Search Bar */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Pill Badge: Pakistan's 1st Skill Exchange Platform */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/40 border border-[#D5EAE0] dark:border-emerald-800/40 text-[#0E7057] dark:text-emerald-400 text-xs font-semibold shadow-2xs">
              <svg className="w-3.5 h-3.5 text-[#0E7057] dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
              <span>Pakistan’s 1st Skill Exchange Platform</span>
            </div>

            {/* Giant Bold Headline: "Skills Have No Borders" */}
            <div className="space-y-1">
              <h1 className="text-[28px] xs:text-4xl sm:text-5xl lg:text-[60px] xl:text-[62px] font-black text-[#0F243B] dark:text-white leading-[1.12] sm:leading-[1.08] tracking-tight font-display">
                Skills Have <br />
                <span className="font-hand text-[#0E7057] dark:text-emerald-400 text-3xl xs:text-4xl sm:text-6xl lg:text-[72px] font-bold inline-block mr-2 -rotate-3 select-none">
                  No
                </span>
                <span>Borders</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-xs xs:text-sm sm:text-base text-[#64748B] dark:text-slate-400 leading-relaxed max-w-lg font-normal">
              Teach, Learn, Grow. <br />
              Together — Across Pakistan.
            </p>

            {/* CTAs: Find a Match & Watch Video */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
              <Link
                to="/matches"
                className="w-full xs:w-auto px-6 sm:px-7 py-3 rounded-full bg-[#0F243B] dark:bg-emerald-600 hover:bg-[#1A385C] dark:hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] min-h-[44px]"
              >
                <span>Find a Match</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="w-full xs:w-auto px-5 sm:px-6 py-3 rounded-full bg-white dark:bg-[#131B2E] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0F243B] dark:text-slate-100 border border-[#E2E8F0] dark:border-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
              >
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[#0F243B] dark:text-slate-100">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <span>Watch Video</span>
              </button>
            </div>

            {/* Prominent Hero Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="pt-2 max-w-lg"
            >
              <div className="rounded-full bg-white dark:bg-[#0E1526] border border-[#E2E8F0] dark:border-slate-800 p-1.5 pl-3 xs:pl-3.5 sm:pl-4 flex items-center gap-2 shadow-xs focus-within:border-[#0E7057] focus-within:ring-2 focus-within:ring-[#0E7057]/15 transition-all min-h-[44px]">
                <Search className="w-4 h-4 text-[#708096] dark:text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search skills (e.g. Python, Graphic Design...)"
                  className="w-full text-xs sm:text-sm text-[#0F243B] dark:text-white placeholder-[#94A3B8] dark:placeholder-slate-400 font-medium bg-transparent outline-none p-0"
                />
                <button
                  type="submit"
                  className="px-3.5 xs:px-5 sm:px-6 py-2 rounded-full bg-[#0E7057] hover:bg-[#0A5743] text-white text-xs font-bold shrink-0 shadow-2xs transition-colors cursor-pointer min-h-[36px]"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Layered Visual Image Collage Matching Reference Image */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[320px] xs:min-h-[360px] sm:min-h-[440px] overflow-hidden sm:overflow-visible">
            <div className="relative w-full max-w-[480px] h-[320px] xs:h-[360px] sm:h-[420px]">
              
              {/* Handwritten annotation: "Real People Real Skills" with curved pointer */}
              <div className="absolute -top-3 sm:-top-4 left-2 xs:left-4 sm:left-6 z-30 select-none text-left pointer-events-none">
                <span className="font-hand text-base xs:text-lg sm:text-xl font-bold text-[#0E4759] dark:text-emerald-400 leading-tight block -rotate-6">
                  Real People <br /> Real Skills
                </span>
                <svg
                  className="w-5 xs:w-7 h-5 xs:h-7 text-[#0E4759] dark:text-emerald-400 ml-6 xs:ml-8 -mt-0.5 -rotate-6"
                  viewBox="0 0 40 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M10 5 C 18 14, 22 22, 19 32" />
                  <path d="M14 27 L 19 32 L 25 28" />
                </svg>
              </div>

              {/* CARD 1 (Left - Female student with notebook & "Learn" badge) */}
              <div className="absolute left-1 xs:left-2 sm:left-4 top-10 xs:top-12 sm:top-16 w-28 xs:w-32 sm:w-44 rounded-2xl overflow-hidden bg-white dark:bg-[#0E1526] p-1.5 shadow-lg border-2 border-white dark:border-slate-800 -rotate-6 hover:rotate-0 transition-transform duration-300 z-10">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80"
                  alt="Pakistani Student Learning"
                  className="w-full h-28 xs:h-36 sm:h-52 object-cover rounded-xl"
                />
                <div className="absolute bottom-2 xs:bottom-3 left-1/2 -translate-x-1/2 bg-white dark:bg-[#131B2E] px-2 xs:px-2.5 py-0.5 xs:py-1 rounded-full text-[9px] xs:text-[10px] font-bold text-[#0E7057] dark:text-emerald-400 border border-[#E2E8F0] dark:border-slate-700 shadow-2xs flex items-center gap-1 whitespace-nowrap">
                  <BookOpen className="w-2.5 xs:w-3 h-2.5 xs:h-3 text-[#0E7057] dark:text-emerald-400" />
                  <span>Learn</span>
                </div>
              </div>

              {/* CARD 2 (Top Right - Scenic Northern Pakistan Lake & Mountains) */}
              <div className="absolute right-1 xs:right-2 sm:right-4 top-0 sm:top-2 w-36 xs:w-44 sm:w-56 rounded-2xl overflow-hidden bg-white dark:bg-[#0E1526] p-1.5 shadow-lg border-2 border-white dark:border-slate-800 rotate-6 hover:rotate-3 transition-transform duration-300 z-10">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=600&auto=format&fit=crop&q=80"
                    alt="Pakistan Mountains & Lake"
                    className="w-full h-24 xs:h-28 sm:h-38 object-cover rounded-xl"
                  />
                  {/* Badge & Text Overlays */}
                  <div className="absolute top-1.5 left-1.5 bg-black/40 backdrop-blur-xs px-1.5 xs:px-2 py-0.5 rounded-full text-[8px] xs:text-[9px] font-bold text-white flex items-center gap-1">
                    <MapPin className="w-2 xs:w-2.5 h-2 xs:h-2.5 text-white" />
                    <span>Pakistan</span>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 text-white font-hand text-[11px] xs:text-xs sm:text-sm font-bold drop-shadow-md leading-tight">
                    Beautiful Places Bigger Dreams
                  </div>
                </div>
              </div>

              {/* CARD 3 (Center Foreground - Male student in navy hoodie & "Teach" badge) */}
              <div className="absolute left-16 xs:left-20 sm:left-32 bottom-2 sm:bottom-4 w-28 xs:w-36 sm:w-48 rounded-2xl overflow-hidden bg-white dark:bg-[#0E1526] p-1.5 shadow-xl border-2 border-white dark:border-slate-800 rotate-1 hover:rotate-0 transition-transform duration-300 z-20">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80"
                  alt="Pakistani Male Student Teaching"
                  className="w-full h-28 xs:h-36 sm:h-50 object-cover rounded-xl"
                />
                <div className="absolute bottom-2 xs:bottom-3 left-1/2 -translate-x-1/2 bg-white dark:bg-[#131B2E] px-2 xs:px-3 py-0.5 xs:py-1 rounded-full text-[9px] xs:text-[10px] font-bold text-[#0E7057] dark:text-emerald-400 border border-[#E2E8F0] dark:border-slate-700 shadow-2xs flex items-center gap-1 whitespace-nowrap">
                  <Lightbulb className="w-2.5 xs:w-3 h-2.5 xs:h-3 text-[#0E7057] dark:text-emerald-400" />
                  <span>Teach</span>
                </div>
              </div>

              {/* CARD 4 (Right Foreground - Female student in black hijab & "Grow" badge) */}
              <div className="absolute right-0 sm:right-2 bottom-4 xs:bottom-6 sm:bottom-8 w-24 xs:w-28 sm:w-40 rounded-2xl overflow-hidden bg-white dark:bg-[#0E1526] p-1.5 shadow-lg border-2 border-white dark:border-slate-800 rotate-3 hover:rotate-0 transition-transform duration-300 z-20">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                  alt="Pakistani Female Student Growing Skills"
                  className="w-full h-24 xs:h-30 sm:h-44 object-cover rounded-xl"
                />
                <div className="absolute bottom-2 xs:bottom-3 left-1/2 -translate-x-1/2 bg-white dark:bg-[#131B2E] px-2 xs:px-2.5 py-0.5 xs:py-1 rounded-full text-[9px] xs:text-[10px] font-bold text-[#0E7057] dark:text-emerald-400 border border-[#E2E8F0] dark:border-slate-700 shadow-2xs flex items-center gap-1 whitespace-nowrap">
                  <TrendingUp className="w-2.5 xs:w-3 h-2.5 xs:h-3 text-[#0E7057] dark:text-emerald-400" />
                  <span>Grow</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PLATFORM STATISTICS STRIP (Matching Exact Reference Layout)            */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#EAF6EF] dark:bg-[#0E1526] border border-[#D5EAE0] dark:border-slate-800 rounded-2xl sm:rounded-full py-4 sm:py-5 px-4 sm:px-10 shadow-2xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 sm:divide-x divide-[#0E7057]/15 dark:divide-slate-800">
            
            {/* Stat 1: Active Members */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 p-1 sm:p-0 sm:pl-2">
              <div className="text-[#0E7057] dark:text-emerald-400 shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
              </div>
              <div className="min-w-0">
                <div className="text-lg xs:text-xl sm:text-2xl font-black text-[#0F243B] dark:text-white font-display leading-tight">
                  2,450+
                </div>
                <div className="text-[10px] xs:text-[11px] text-[#64748B] dark:text-slate-400 font-medium truncate">
                  Active Members
                </div>
              </div>
            </div>

            {/* Stat 2: Successful Swaps */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 p-1 sm:p-0 sm:pl-6">
              <div className="text-[#0E7057] dark:text-emerald-400 shrink-0">
                <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
              </div>
              <div className="min-w-0">
                <div className="text-lg xs:text-xl sm:text-2xl font-black text-[#0F243B] dark:text-white font-display leading-tight">
                  1,230+
                </div>
                <div className="text-[10px] xs:text-[11px] text-[#64748B] dark:text-slate-400 font-medium truncate">
                  Successful Swaps
                </div>
              </div>
            </div>

            {/* Stat 3: Skills Available */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 p-1 sm:p-0 sm:pl-6">
              <div className="text-[#0E7057] dark:text-emerald-400 shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
              </div>
              <div className="min-w-0">
                <div className="text-lg xs:text-xl sm:text-2xl font-black text-[#0F243B] dark:text-white font-display leading-tight">
                  520+
                </div>
                <div className="text-[10px] xs:text-[11px] text-[#64748B] dark:text-slate-400 font-medium truncate">
                  Skills Available
                </div>
              </div>
            </div>

            {/* Stat 4: Major Cities */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 p-1 sm:p-0 sm:pl-6">
              <div className="text-[#0E7057] dark:text-emerald-400 shrink-0">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
              </div>
              <div className="min-w-0">
                <div className="text-lg xs:text-xl sm:text-2xl font-black text-[#0F243B] dark:text-white font-display leading-tight">
                  3
                </div>
                <div className="text-[10px] xs:text-[11px] text-[#64748B] dark:text-slate-400 font-medium truncate">
                  Major Cities
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. RECOMMENDED SKILL PARTNERS SECTION (5 Cards Matching Reference)        */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0E7057] dark:text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-black text-[#0F243B] dark:text-white tracking-tight font-display">
                Recommended Skill Partners
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#708096] dark:text-slate-400 mt-0.5">
              Meet amazing people from your city and start swapping skills today.
            </p>
          </div>
          <Link
            to="/matches"
            className="text-xs font-bold text-[#0E7057] dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 5 Partner Cards Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {recommendedPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white dark:bg-[#0E1526] rounded-2xl border border-[#E5EAE7] dark:border-slate-800 p-4 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Header: Photo, Name, City, Rating */}
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={partner.avatar}
                    alt={partner.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-[#0E7057]/15 dark:ring-emerald-500/20 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#0F243B] dark:text-white truncate">
                      {partner.name}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] text-[#708096] dark:text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#708096] dark:text-slate-400 shrink-0" />
                      <span className="truncate">{partner.city}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#E7A62C] mt-0.5">
                      <Star className="w-3 h-3 fill-current shrink-0" />
                      <span>{partner.rating} ({partner.reviews})</span>
                    </div>
                  </div>
                </div>

                {/* Teaches Box */}
                <div className="p-2.5 rounded-xl bg-[#EAF6EF] dark:bg-emerald-950/30 border border-[#0E7057]/15 dark:border-emerald-800/30 mb-2 space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase text-[#0E7057] dark:text-emerald-400 flex items-center gap-1 tracking-wider">
                    <span>→ Teaches</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    {partner.teaches.map((skill, sIdx) => {
                      const Icon = skill.icon;
                      return (
                        <div key={sIdx} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0F243B] dark:text-slate-200">
                          <Icon className="w-3.5 h-3.5 text-[#0E7057] dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{skill.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Learns Box */}
                <div className="p-2.5 rounded-xl bg-[#EEF6FC] dark:bg-sky-950/30 border border-[#183A60]/10 dark:border-sky-800/30 mb-3 space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase text-[#183A60] dark:text-sky-300 flex items-center gap-1 tracking-wider">
                    <span>→ Learns</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    {partner.learns.map((skill, sIdx) => {
                      const Icon = skill.icon;
                      return (
                        <div key={sIdx} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0F243B] dark:text-slate-200">
                          <Icon className="w-3.5 h-3.5 text-[#183A60] dark:text-sky-400 shrink-0" />
                          <span className="truncate">{skill.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Chat & Propose */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#F0F4F1] dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => navigate('/chat')}
                  className="w-full py-1.5 rounded-full bg-white dark:bg-[#131B2E] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0F243B] dark:text-slate-100 border border-[#E2E8F0] dark:border-slate-700 hover:border-[#0E7057] text-xs font-bold flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3 h-3 text-[#0E7057] dark:text-emerald-400" />
                  <span>Chat</span>
                </button>
                <Link
                  to={`/matches?search=${encodeURIComponent(partner.teaches[0]?.name || '')}`}
                  className="w-full py-1.5 rounded-full bg-[#0E7057] hover:bg-[#0A5743] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-2xs transition-all text-center"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>Propose</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THE 2-WAY DETERMINISTIC RECIPROCAL BARTER LOOP (Preserved)              */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0E7057] dark:text-emerald-400 bg-[#EAF6EF] dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-[#0E7057]/20 dark:border-emerald-800/40">
            Algorithmic Matching Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F243B] dark:text-white mt-3 font-display">
            The 2-Way Reciprocal Barter Loop
          </h2>
          <p className="text-xs sm:text-sm text-[#708096] dark:text-slate-400 max-w-xl mx-auto mt-1 leading-relaxed">
            Our engine pairs learners who teach exactly what each other wants, enabling an equitable, tuition-free knowledge barter.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0E1526] rounded-3xl p-6 sm:p-10 relative overflow-hidden border border-[#E5EAE7] dark:border-slate-800 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
            {/* Person A */}
            <div className="md:col-span-5 p-5 rounded-2xl bg-[#FAFBF9] dark:bg-[#131B2E] border border-[#E5EAE7] dark:border-slate-700 shadow-2xs">
              <div className="flex items-center gap-3.5 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                  alt="Ali Khan"
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#0E7057] shadow-xs"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-[#0F243B] dark:text-white">Ali Khan</h4>
                  <div className="flex items-center gap-1 text-xs text-[#0E7057] dark:text-emerald-400 font-bold">
                    <MapPin className="w-3.5 h-3.5" /> Karachi (Clifton)
                  </div>
                  <span className="text-[11px] text-[#708096] dark:text-slate-400">MERN Developer (5 yrs exp)</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#EAF6EF] dark:bg-emerald-950/40 border border-[#0E7057]/20 dark:border-emerald-800/40">
                  <span className="font-black text-[#0E7057] dark:text-emerald-400 block mb-0.5 text-[10px] uppercase tracking-wider">TEACHES (Gives):</span>
                  <span className="font-bold text-[#0F243B] dark:text-white">Full-Stack React & Node.js</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#EEF6FC] dark:bg-sky-950/40 border border-[#183A60]/15 dark:border-sky-800/40">
                  <span className="font-black text-[#183A60] dark:text-sky-300 block mb-0.5 text-[10px] uppercase tracking-wider">SEEKS (Wants):</span>
                  <span className="font-bold text-[#0F243B] dark:text-white">Figma UI/UX & Design Systems</span>
                </div>
              </div>
            </div>

            {/* Middle Loop Indicator */}
            <div className="md:col-span-1 flex flex-col items-center justify-center text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#131B2E] border border-[#E5EAE7] dark:border-slate-700 flex items-center justify-center shadow-xs p-2">
                <SkillExchangeLogo className="w-full h-full" />
              </div>
              <span className="text-[10px] font-black uppercase text-[#0E7057] dark:text-emerald-400 mt-2 tracking-wider bg-[#EAF6EF] dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-[#0E7057]/20 dark:border-emerald-800/40">
                100% Loop
              </span>
            </div>

            {/* Person B */}
            <div className="md:col-span-5 p-5 rounded-2xl bg-[#FAFBF9] dark:bg-[#131B2E] border border-[#E5EAE7] dark:border-slate-700 shadow-2xs">
              <div className="flex items-center gap-3.5 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                  alt="Fatima Noor"
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#0E7057] shadow-xs"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-[#0F243B] dark:text-white">Fatima Noor</h4>
                  <div className="flex items-center gap-1 text-xs text-[#0E7057] dark:text-emerald-400 font-bold">
                    <MapPin className="w-3.5 h-3.5" /> Lahore (Gulberg)
                  </div>
                  <span className="text-[11px] text-[#708096] dark:text-slate-400">Lead Product & UI/UX Designer</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#EEF6FC] dark:bg-sky-950/40 border border-[#183A60]/15 dark:border-sky-800/40">
                  <span className="font-black text-[#183A60] dark:text-sky-300 block mb-0.5 text-[10px] uppercase tracking-wider">TEACHES (Gives):</span>
                  <span className="font-bold text-[#0F243B] dark:text-white">Figma UI/UX & Design Systems</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#EAF6EF] dark:bg-emerald-950/40 border border-[#0E7057]/20 dark:border-emerald-800/40">
                  <span className="font-black text-[#0E7057] dark:text-emerald-400 block mb-0.5 text-[10px] uppercase tracking-wider">SEEKS (Wants):</span>
                  <span className="font-bold text-[#0F243B] dark:text-white">Full-Stack React & Node.js</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E5EAE7] dark:border-slate-800 text-center">
            <Link
              to="/matches"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0E7057] hover:bg-[#0A5743] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <span>Explore All Barter Matches</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. VIDEO MODAL (Functional for Watch Video CTA)                           */}
      {/* ========================================================================= */}
      {showVideoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="bg-white dark:bg-[#0E1526] rounded-3xl max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto relative shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 pr-8">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  How SkillSwap PK Works
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Watch how Pakistani students & professionals trade skills 1-on-1 with 0 PKR tuition cost.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              title="Close video"
              aria-label="Close video"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video rounded-2xl bg-black flex items-center justify-center relative overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
              <video
                src="/video.mp4"
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain rounded-2xl bg-black"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                💡 Trade skills 1-on-1 across Pakistan
              </span>
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-5 py-2 rounded-full bg-[#0F243B] dark:bg-emerald-600 text-white text-xs font-bold hover:bg-[#1A385C] dark:hover:bg-emerald-500 transition-colors cursor-pointer"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
