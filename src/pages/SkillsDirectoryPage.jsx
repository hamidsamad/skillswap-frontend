import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import {
  Search,
  BookOpen,
  ArrowRight,
  ArrowRightLeft,
  Users,
  ShieldCheck,
  MapPin,
  Sparkles,
  RotateCcw,
  X,
  Code,
  Palette,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Gamepad2,
  Laptop,
  Target,
  Brain,
  Layout,
  PenTool,
  Smartphone,
  TrendingUp,
  Video,
  BarChart,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';

/**
 * Center Illustration Component
 * Scalable vector illustration matching the reference image:
 * Central learning laptop with graduation cap, floating circular badges (code, bulb, palette, users, chart),
 * delicate dotted connecting arcs, and handwritten "Learn, Share, Grow" script.
 */
function SkillsHeroIllustration() {
  return (
    <div className="relative w-full max-w-[340px] xs:max-w-[360px] lg:max-w-[400px] mx-auto select-none py-1 overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 410 230"
        className="w-full h-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle Decorative Dotted Connecting Paths / Orbits */}
        <ellipse
          cx="175"
          cy="120"
          rx="135"
          ry="78"
          stroke="#07866D"
          strokeWidth="1.2"
          strokeDasharray="3 4"
          strokeOpacity="0.32"
        />
        <path
          d="M 65 115 C 80 50, 270 45, 290 115 C 305 175, 120 195, 65 115"
          stroke="#07866D"
          strokeWidth="1"
          strokeDasharray="4 4"
          strokeOpacity="0.22"
        />

        {/* Curved branch lines to individual floating nodes */}
        <path d="M 175 90 Q 170 58 175 42" stroke="#07866D" strokeWidth="1.2" strokeDasharray="3 3" strokeOpacity="0.35" />
        <path d="M 142 108 Q 98 88 78 72" stroke="#07866D" strokeWidth="1.2" strokeDasharray="3 3" strokeOpacity="0.35" />
        <path d="M 208 108 Q 248 88 272 72" stroke="#07866D" strokeWidth="1.2" strokeDasharray="3 3" strokeOpacity="0.35" />
        <path d="M 142 136 Q 95 148 78 158" stroke="#07866D" strokeWidth="1.2" strokeDasharray="3 3" strokeOpacity="0.35" />
        <path d="M 208 136 Q 252 148 272 160" stroke="#07866D" strokeWidth="1.2" strokeDasharray="3 3" strokeOpacity="0.35" />

        {/* Decorative Floating Accent Dots */}
        <circle cx="115" cy="50" r="2.5" fill="#07866D" opacity="0.3" />
        <circle cx="235" cy="46" r="3" fill="#086B57" opacity="0.3" />
        <circle cx="110" cy="188" r="2.5" fill="#07866D" opacity="0.35" />
        <circle cx="242" cy="192" r="3" fill="#086B57" opacity="0.3" />
        <circle cx="48" cy="120" r="2" fill="#07866D" opacity="0.25" />

        {/* Central Laptop Graphic */}
        <g id="center-laptop">
          {/* Soft drop shadow */}
          <ellipse cx="175" cy="158" rx="60" ry="6" fill="#102B50" opacity="0.08" />

          {/* Screen Outer Frame */}
          <rect
            x="134"
            y="76"
            width="82"
            height="58"
            rx="6"
            fill="#FFFFFF"
            stroke="#07866D"
            strokeWidth="2.5"
          />
          {/* Inner Screen Display */}
          <rect
            x="138"
            y="80"
            width="74"
            height="50"
            rx="3"
            fill="#EAF6EF"
          />

          {/* Graduation Cap on Screen */}
          <g transform="translate(175, 102)">
            {/* Mortarboard rhomboid top */}
            <polygon points="0,-12 19,-4 0,4 -19,-4" fill="#07866D" />
            {/* Skullcap underneath */}
            <path d="M -11 0 Q 0 6 11 0 L 11 6 Q 0 11 -11 6 Z" fill="#07866D" />
            {/* Tassel */}
            <path d="M 14 -2 L 18 7" stroke="#07866D" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="18" cy="8.5" r="1.5" fill="#07866D" />
          </g>

          {/* Laptop Base and Hinge */}
          <path
            d="M 122 134 L 228 134 L 222 144 L 128 144 Z"
            fill="#07866D"
          />
          {/* Trackpad */}
          <rect x="165" y="136" width="20" height="2" rx="1" fill="#FFFFFF" opacity="0.75" />
        </g>

        {/* 1. Floating Circular Node: Code </> (Top-Left) */}
        <g transform="translate(74, 68)">
          <circle cx="0" cy="0" r="19" fill="#FFFFFF" stroke="#07866D" strokeWidth="1.5" />
          <path d="M -6 -5 L -11 0 L -6 5" stroke="#102B50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 6 -5 L 11 0 L 6 5" stroke="#102B50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 2 -7 L -2 7" stroke="#07866D" strokeWidth="1.8" strokeLinecap="round" />
        </g>

        {/* 2. Floating Circular Node: Lightbulb (Top-Center) */}
        <g transform="translate(175, 34)">
          <circle cx="0" cy="0" r="19" fill="#FFFFFF" stroke="#07866D" strokeWidth="1.5" />
          <path
            d="M -5 -3 C -5 -7, 5 -7, 5 -3 C 5 -1, 3 1, 3 4 L -3 4 C -3 1, -5 -1, -5 -3 Z"
            fill="#EAF6EF"
            stroke="#07866D"
            strokeWidth="1.6"
          />
          <path d="M -2 6 L 2 6" stroke="#07866D" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="0" y1="-10" x2="0" y2="-12.5" stroke="#07866D" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="-8" y1="-8" x2="-10" y2="-10" stroke="#07866D" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="-8" x2="10" y2="-10" stroke="#07866D" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* 3. Floating Circular Node: Artist Palette (Top-Right) */}
        <g transform="translate(276, 68)">
          <circle cx="0" cy="0" r="19" fill="#FFFFFF" stroke="#07866D" strokeWidth="1.5" />
          <path
            d="M -8 3 C -10 -4, -4 -9, 3 -8 C 9 -7, 10 -2, 7 4 C 6 6, 2 5, 0 7 C -2 9, -7 8, -8 3 Z"
            fill="#EAF6EF"
            stroke="#07866D"
            strokeWidth="1.6"
          />
          <circle cx="-3" cy="-4" r="1.5" fill="#07866D" />
          <circle cx="2" cy="-3.5" r="1.5" fill="#102B50" />
          <circle cx="4" cy="1" r="1.5" fill="#07866D" />
        </g>

        {/* 4. Floating Circular Node: Users / People (Bottom-Left) */}
        <g transform="translate(74, 162)">
          <circle cx="0" cy="0" r="19" fill="#FFFFFF" stroke="#07866D" strokeWidth="1.5" />
          <circle cx="-3" cy="-3" r="3" fill="#07866D" />
          <path d="M -9 7 C -9 3, 3 3, 3 7" stroke="#07866D" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <circle cx="5" cy="-2" r="2.3" fill="#102B50" />
          <path d="M 4 7 C 4 4.5, 9 4.5, 9 7" stroke="#102B50" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </g>

        {/* 5. Floating Circular Node: Analytics / Growth Chart (Bottom-Right) */}
        <g transform="translate(276, 162)">
          <circle cx="0" cy="0" r="19" fill="#FFFFFF" stroke="#07866D" strokeWidth="1.5" />
          <rect x="-8" y="0" width="3" height="6" fill="#07866D" rx="0.5" />
          <rect x="-3" y="-3" width="3" height="9" fill="#07866D" rx="0.5" />
          <rect x="2" y="-7" width="3" height="13" fill="#07866D" rx="0.5" />
          <path d="M -7 -1 L -1 -5 L 6 -9" stroke="#102B50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 4 -9 L 6 -9 L 6 -7" stroke="#102B50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Handwritten Phrase to the Right: "Learn", "Share", "Grow" */}
        <g id="handwritten-learn-share-grow" transform="translate(306, 44)">
          <text
            x="8"
            y="32"
            fontFamily="'Caveat', cursive, sans-serif"
            fontSize="26"
            fontWeight="700"
            fill="#07866D"
            transform="rotate(-4 8 32)"
          >
            Learn
          </text>
          <text
            x="12"
            y="62"
            fontFamily="'Caveat', cursive, sans-serif"
            fontSize="26"
            fontWeight="700"
            fill="#07866D"
            transform="rotate(1 12 62)"
          >
            Share
          </text>
          <text
            x="18"
            y="94"
            fontFamily="'Caveat', cursive, sans-serif"
            fontSize="28"
            fontWeight="700"
            fill="#07866D"
            transform="rotate(-2 18 94)"
          >
            Grow
          </text>
        </g>
      </svg>
    </div>
  );
}

// 6 Core Category Card Definitions from Reference Design
const REFERENCE_CATEGORIES = [
  {
    id: 'software-web',
    title: 'Software & Web Development',
    description: 'Learn programming, web development and modern technologies.',
    iconName: 'Code',
    defaultBadge: '24+ Skills',
    matchingSubcategories: [
      'Software & Web Development',
      'Software & Tech',
      'Mobile Application Development',
      'Cloud Computing & DevOps',
      'Cybersecurity & Ethical Hacking',
      'Network Engineering & Infrastructure',
      'Database Administration & Big Data',
      'Software Quality Assurance (QA) & Testing'
    ]
  },
  {
    id: 'design-creative',
    title: 'Design & Creative',
    description: 'Explore graphic design, UI/UX, video editing and creative skills.',
    iconName: 'Palette',
    defaultBadge: '18+ Skills',
    matchingSubcategories: [
      'Design & Creative',
      'UI/UX Design & Digital Products'
    ]
  },
  {
    id: 'language-communication',
    title: 'Language & Communication',
    description: 'Improve your language skills and communication abilities.',
    iconName: 'MessageSquare',
    defaultBadge: '12+ Skills',
    matchingSubcategories: [
      'Language & Arts',
      'Language & Communication'
    ]
  },
  {
    id: 'business-freelancing',
    title: 'Business & Freelancing',
    description: 'Learn business, marketing, freelancing and entrepreneurship skills.',
    iconName: 'Briefcase',
    defaultBadge: '16+ Skills',
    matchingSubcategories: [
      'Business & Freelancing',
      'CMS, E-Commerce & No-Code'
    ]
  },
  {
    id: 'academics-science',
    title: 'Academics & Science',
    description: 'Explore academic subjects, research and scientific skills.',
    iconName: 'GraduationCap',
    defaultBadge: '14+ Skills',
    matchingSubcategories: [
      'Academics & Science',
      'Data Science & Business Intelligence'
    ]
  },
  {
    id: 'gaming-multimedia',
    title: 'Gaming & Multimedia',
    description: 'Learn game development, animation, video production and more.',
    iconName: 'Gamepad2',
    defaultBadge: '10+ Skills',
    matchingSubcategories: [
      'Gaming & Multimedia',
      'Game Development & 3D Interactive Tech'
    ]
  }
];

export default function SkillsDirectoryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary Data State
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skill') || 'All');
  const [learningMode, setLearningMode] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');

  // Load All Skills from Backend API
  useEffect(() => {
    async function loadSkills() {
      setLoading(true);
      try {
        const res = await api.get('/skills');
        if (res.data.success) {
          setSkills(res.data.skills || []);
        }
      } catch (e) {
        console.error('Error fetching skills directory:', e);
      } finally {
        setLoading(false);
      }
    }
    loadSkills();
  }, []);

  // Sync state if URL query changes
  useEffect(() => {
    const qSearch = searchParams.get('search');
    const qCategory = searchParams.get('category');
    const qSkill = searchParams.get('skill');

    if (qSearch !== null) setSearch(qSearch);
    if (qCategory !== null) setSelectedCategory(qCategory);
    if (qSkill !== null) setSelectedSkill(qSkill);
  }, [searchParams]);

  // Skill Icon Resolver
  const getSkillIcon = (iconName, category) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-5 h-5 text-[#07866D]" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-indigo-500" />;
      case 'Layout':
        return <Layout className="w-5 h-5 text-purple-500" />;
      case 'PenTool':
        return <PenTool className="w-5 h-5 text-emerald-600" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 text-cyan-600" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-amber-500" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-rose-500" />;
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5 text-teal-600" />;
      case 'Video':
        return <Video className="w-5 h-5 text-red-500" />;
      case 'BarChart':
        return <BarChart className="w-5 h-5 text-orange-500" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-blue-600" />;
      default:
        if (category?.includes('Web') || category?.includes('Software')) {
          return <Code className="w-5 h-5 text-[#07866D]" />;
        }
        if (category?.includes('Design') || category?.includes('Creative')) {
          return <Palette className="w-5 h-5 text-rose-500" />;
        }
        if (category?.includes('Language') || category?.includes('Arts')) {
          return <MessageSquare className="w-5 h-5 text-teal-600" />;
        }
        if (category?.includes('Business') || category?.includes('Commerce')) {
          return <Briefcase className="w-5 h-5 text-amber-600" />;
        }
        if (category?.includes('Data') || category?.includes('Science') || category?.includes('Academic')) {
          return <GraduationCap className="w-5 h-5 text-indigo-600" />;
        }
        if (category?.includes('Game') || category?.includes('Multimedia')) {
          return <Gamepad2 className="w-5 h-5 text-purple-600" />;
        }
        return <Sparkles className="w-5 h-5 text-[#07866D]" />;
    }
  };

  // Get Icon Component for Category Card
  const getCategoryCardIcon = (iconName) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-6 h-6 text-[#07866D]" />;
      case 'Palette':
        return <Palette className="w-6 h-6 text-[#07866D]" />;
      case 'MessageSquare':
        return <MessageSquare className="w-6 h-6 text-[#07866D]" />;
      case 'Briefcase':
        return <Briefcase className="w-6 h-6 text-[#07866D]" />;
      case 'GraduationCap':
        return <GraduationCap className="w-6 h-6 text-[#07866D]" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-6 h-6 text-[#07866D]" />;
      default:
        return <BookOpen className="w-6 h-6 text-[#07866D]" />;
    }
  };

  // Unique Dropdown Options
  const skillOptions = useMemo(() => {
    const names = skills.map((s) => s.name).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [skills]);

  const categoryOptions = useMemo(() => {
    const list = [
      'Software & Web Development',
      'Design & Creative',
      'Language & Communication',
      'Business & Freelancing',
      'Academics & Science',
      'Gaming & Multimedia'
    ];
    // Also include any other specific raw categories present in DB
    const dbCats = skills.map((s) => s.category).filter(Boolean);
    dbCats.forEach((c) => {
      if (!list.includes(c)) list.push(c);
    });
    return list;
  }, [skills]);

  // Skill Count Calculator per Category Card (Uses real database count)
  const getCategoryCount = (catDef) => {
    const count = skills.filter((s) =>
      catDef.matchingSubcategories.some(
        (sub) => sub.toLowerCase() === (s.category || '').toLowerCase()
      )
    ).length;
    return count > 0 ? `${count}+ Skills` : catDef.defaultBadge;
  };

  // Check if a skill matches a reference category or selected filter
  const isSkillMatchingCategory = (skill, categoryName) => {
    if (!categoryName || categoryName === 'All') return true;

    // Check if categoryName matches one of our 6 reference categories
    const refCat = REFERENCE_CATEGORIES.find(
      (rc) => rc.title.toLowerCase() === categoryName.toLowerCase()
    );

    if (refCat) {
      return refCat.matchingSubcategories.some(
        (sub) => sub.toLowerCase() === (skill.category || '').toLowerCase()
      );
    }

    // Direct match against skill's raw category
    return (skill.category || '').toLowerCase() === categoryName.toLowerCase();
  };

  // Filtered Skills List
  const filteredSkills = useMemo(() => {
    let result = [...skills];

    // Search query filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q) ||
          (s.category || '').toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((s) => isSkillMatchingCategory(s, selectedCategory));
    }

    // Specific Skill filter
    if (selectedSkill !== 'All') {
      result = result.filter(
        (s) => (s.name || '').toLowerCase() === selectedSkill.toLowerCase()
      );
    }

    // Sorting
    if (sortBy === 'Alphabetical') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'Popular') {
      result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    }

    return result;
  }, [skills, search, selectedCategory, selectedSkill, sortBy]);

  // Display Categories sorted according to "Sort by"
  const sortedCategories = useMemo(() => {
    let list = [...REFERENCE_CATEGORIES];
    if (sortBy === 'Alphabetical') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'Count') {
      list.sort((a, b) => {
        const countA = skills.filter((s) =>
          a.matchingSubcategories.some((sub) => sub.toLowerCase() === (s.category || '').toLowerCase())
        ).length;
        const countB = skills.filter((s) =>
          b.matchingSubcategories.some((sub) => sub.toLowerCase() === (s.category || '').toLowerCase())
        ).length;
        return countB - countA;
      });
    }
    return list;
  }, [skills, sortBy]);

  // Handle clicking "Explore Skills" on a Category Card
  const handleExploreCategory = (cat) => {
    setSelectedCategory(cat.title);
    // Smooth scroll down to skills list section
    setTimeout(() => {
      const section = document.getElementById('skills-explorer-results');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // Reset Filters
  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedSkill('All');
    setLearningMode('All');
    setSortBy('Popular');
    setSearchParams({});
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedSkill !== 'All' ||
    learningMode !== 'All';

  return (
    <div className="w-full bg-[#FAF9F5] dark:bg-[#080B14] min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10">

        {/* ========================================================= */}
        {/* SECTION 3: HERO SECTION                                   */}
        {/* 3-Column Layout: Left Copy | Center Graphic | Right Card  */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-3.5">
            {/* Mint Green Pill Badge */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 text-xs font-bold border border-[#07866D]/20 shadow-2xs">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explore &amp; Grow</span>
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#102B50] dark:text-white tracking-tight leading-[1.15] font-display">
              Explore Skills
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-[#708096] dark:text-slate-400 leading-relaxed max-w-sm">
              Discover skills, share your knowledge, and find your next learning opportunity.
            </p>
          </div>

          {/* Center Illustration Column */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <SkillsHeroIllustration />
          </div>

          {/* Right Information Card */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-[#0E1526] rounded-2xl sm:rounded-3xl border border-[#E5EAE7] dark:border-slate-800 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(16,43,80,0.06)] space-y-4 sm:space-y-4.5">
              
              {/* Row 1: Real People */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-[#07866D]/15 mt-0.5">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#102B50] dark:text-white leading-tight">
                    Real People
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#708096] dark:text-slate-400 leading-snug mt-0.5">
                    Connect with learners and professionals.
                  </p>
                </div>
              </div>

              {/* Row 2: Safe & Secure */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-[#07866D]/15 mt-0.5">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#102B50] dark:text-white leading-tight">
                    Safe &amp; Secure
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#708096] dark:text-slate-400 leading-snug mt-0.5">
                    Built for trust and transparency.
                  </p>
                </div>
              </div>

              {/* Row 3: Reciprocal Learning */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-[#07866D]/15 mt-0.5">
                  <ArrowRightLeft className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#102B50] dark:text-white leading-tight">
                    Reciprocal Learning
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#708096] dark:text-slate-400 leading-snug mt-0.5">
                    Teach what you know, learn what you need.
                  </p>
                </div>
              </div>

              {/* Row 4: Across Pakistan */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-[#07866D]/15 mt-0.5">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#102B50] dark:text-white leading-tight">
                    Across Pakistan
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#708096] dark:text-slate-400 leading-snug mt-0.5">
                    From big cities to small towns.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </section>

        {/* ========================================================= */}
        {/* SECTION 5: SKILLS CATEGORIES SECTION HEADER               */}
        {/* Teal Book Icon | Title & Subtitle | Sort by: Popular      */}
        {/* ========================================================= */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-[#07866D]/20 shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-[#102B50] dark:text-white font-display">
                Skills Categories
              </h2>
              <p className="text-xs sm:text-sm text-[#708096] dark:text-slate-400 mt-0.5">
                Browse through different skill categories and find what interests you.
              </p>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-xs font-bold text-[#708096] dark:text-slate-400 whitespace-nowrap">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-1.5 bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 rounded-xl text-xs font-bold text-[#102B50] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D]/30 focus:border-[#07866D] shadow-2xs cursor-pointer"
            >
              <option value="Popular">Popular</option>
              <option value="Alphabetical">Alphabetical (A-Z)</option>
              <option value="Count">Skill Count (High to Low)</option>
            </select>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 6: SKILLS CATEGORY CARDS GRID                     */}
        {/* Responsive 3-Column Grid matching Reference Image exactly */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {sortedCategories.map((cat) => {
            const isSelected = selectedCategory === cat.title;
            const skillBadge = getCategoryCount(cat);

            return (
              <div
                key={cat.id}
                className={`bg-white dark:bg-[#0E1526] rounded-2xl sm:rounded-3xl border ${
                  isSelected
                    ? 'border-[#07866D] ring-2 ring-[#07866D]/20 shadow-[0_8px_30px_rgba(7,134,109,0.12)]'
                    : 'border-[#E5EAE7] dark:border-slate-800 shadow-[0_2px_14px_rgba(16,43,80,0.04)]'
                } p-6 sm:p-7 flex flex-col justify-between hover:shadow-[0_8px_28px_rgba(16,43,80,0.08)] hover:-translate-y-1 transition-all duration-300 group`}
              >
                <div>
                  {/* Top: Icon + Skill Count Badge */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 flex items-center justify-center border border-[#07866D]/15 group-hover:scale-105 transition-transform duration-200">
                      {getCategoryCardIcon(cat.iconName)}
                    </div>
                    <span className="px-3 py-1 bg-[#EAF6EF] dark:bg-emerald-950/50 text-[#07866D] dark:text-emerald-400 text-xs font-extrabold rounded-full border border-[#07866D]/20 shadow-2xs">
                      {skillBadge}
                    </span>
                  </div>

                  {/* Category Title */}
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#102B50] dark:text-white mb-2 group-hover:text-[#07866D] dark:group-hover:text-emerald-400 transition-colors">
                    {cat.title}
                  </h3>

                  {/* Category Description */}
                  <p className="text-xs sm:text-sm text-[#708096] dark:text-slate-400 leading-relaxed mb-6">
                    {cat.description}
                  </p>
                </div>

                {/* Explore Skills Button */}
                <button
                  onClick={() => handleExploreCategory(cat)}
                  className="btn-emerald w-full !py-3 !rounded-xl !text-xs sm:!text-sm font-bold shadow-sm hover:shadow active:scale-95 cursor-pointer"
                >
                  <span>Explore Skills</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-200" />
                </button>
              </div>
            );
          })}
        </section>

        {/* ========================================================= */}
        {/* SKILLS DIRECTORY EXPLORER RESULTS                         */}
        {/* Real-time reactive skills listing matching search/filter  */}
        {/* ========================================================= */}
        <section id="skills-explorer-results" className="pt-6 space-y-6">
          {/* Active Filter Banner or Results Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0E1526] p-4 sm:p-5 rounded-2xl border border-[#E5EAE7] dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#102B50] dark:text-white">
                  {selectedCategory !== 'All'
                    ? `Showing: ${selectedCategory}`
                    : search.trim()
                    ? `Search results for "${search}"`
                    : 'All Skills Directory'}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#708096] dark:text-slate-400">
                  {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''} available for 1-on-1 barters across Pakistan
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full xs:w-auto">
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="btn-white flex-1 xs:flex-none justify-center !py-2 !px-3 !text-xs"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() =>
                  navigate(
                    `/matches${
                      selectedCategory !== 'All'
                        ? `?search=${encodeURIComponent(selectedCategory)}`
                        : search.trim()
                        ? `?search=${encodeURIComponent(search.trim())}`
                        : ''
                    }`
                  )
                }
                className="btn-emerald flex-1 xs:flex-none justify-center !py-2 !px-3.5 !text-xs"
              >
                <span>Find Match Partners</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="py-20 text-center bg-white dark:bg-[#0E1526] rounded-2xl border border-[#E5EAE7] dark:border-slate-800 p-8">
              <div className="w-10 h-10 border-4 border-[#07866D]/20 border-t-[#07866D] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-bold text-[#708096] uppercase tracking-wider">
                Loading skills directory...
              </p>
            </div>
          ) : filteredSkills.length === 0 ? (
            /* Empty State */
            <div className="bg-white dark:bg-[#0E1526] rounded-2xl border border-[#E5EAE7] dark:border-slate-800 p-12 text-center">
              <span className="text-4xl mb-3 block">🎨</span>
              <h3 className="text-base sm:text-lg font-extrabold text-[#102B50] dark:text-white">
                No Skills Found
              </h3>
              <p className="text-xs text-[#708096] max-w-sm mx-auto mt-1.5 mb-6 leading-relaxed">
                No skills matched your current search criteria. Try a different keyword, category, or clear your filters.
              </p>
              <button
                onClick={resetFilters}
                className="btn-emerald !py-2.5 !px-5 !text-xs cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Skills Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkills.map((skill) => (
                <div
                  key={skill._id || skill.name}
                  className="bg-white dark:bg-[#0E1526] rounded-2xl border border-[#E5EAE7] dark:border-slate-800 p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
                >
                  <div>
                    {/* Top: Skill Icon + Popular Pill */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="p-3 rounded-2xl bg-[#EAF6EF] dark:bg-emerald-950/50 text-[#07866D] dark:text-emerald-400 border border-[#07866D]/20 group-hover:scale-105 transition-transform">
                        {getSkillIcon(skill.icon, skill.category)}
                      </div>
                      {skill.isPopular && (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/90 dark:border-amber-800 text-[10px] font-black rounded-full uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs">
                          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                          Popular
                        </span>
                      )}
                    </div>

                    {/* Skill Category Tag */}
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#07866D] dark:text-emerald-400 block mb-1">
                      {skill.category}
                    </span>

                    {/* Skill Name */}
                    <h3 className="text-base font-extrabold text-[#102B50] dark:text-white mb-2 group-hover:text-[#07866D] dark:group-hover:text-emerald-400 transition-colors">
                      {skill.name}
                    </h3>

                    {/* Skill Description */}
                    <p className="text-xs text-[#708096] dark:text-slate-400 leading-relaxed line-clamp-3 mb-5">
                      {skill.description ||
                        'Explore Pakistani practitioners and teachers in this skill domain.'}
                    </p>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 border-t border-[#E5EAE7] dark:border-slate-800">
                    <button
                      onClick={() =>
                        navigate(`/matches?search=${encodeURIComponent(skill.name)}`)
                      }
                      className="btn-emerald w-full !py-2.5 !px-4 !text-xs flex items-center justify-center gap-2 group/btn cursor-pointer shadow-xs active:scale-95"
                    >
                      <span>Explore People &amp; Barters</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
