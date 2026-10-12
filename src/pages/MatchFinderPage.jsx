import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import MatchCard from '../components/MatchCard';
import {
  Search,
  MapPin,
  Laptop,
  Sparkles,
  ArrowRightLeft,
  Users,
  ShieldCheck,
  Target,
  ArrowUpDown,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { SKILL_CATEGORIES } from '../utils/skillsList';
import { PAKISTANI_CITIES } from '../utils/pakistanCities';

export default function MatchFinderPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allSkills, setAllSkills] = useState([]);

  // Search & Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skill') || 'All');
  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [learningMode, setLearningMode] = useState('All');

  // Sorting state
  const [sortBy, setSortBy] = useState('Best Match');

  const pakistaniCities = ['All', ...PAKISTANI_CITIES];

  // Fetch skills list from database
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

  // Sync URL search params
  useEffect(() => {
    const qSearch = searchParams.get('search');
    const qSkill = searchParams.get('skill');
    const qCity = searchParams.get('city');
    setSearch(qSearch || '');
    setSelectedSkill(qSkill || 'All');
    setCity(qCity || 'All');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  // Fetch ranked matches
  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params = {
        city: city !== 'All' ? city : undefined,
        learningMode: learningMode !== 'All' ? learningMode : undefined,
        search: search.trim() || undefined,
        skill: selectedSkill !== 'All' ? selectedSkill : undefined
      };

      const res = await api.get('/matches', { params });
      if (res.data.success) {
        setMatches(res.data.matches || []);
      }
    } catch (e) {
      console.error('Failed to load matches:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [city, learningMode, search, selectedSkill]);

  const handleProposalSuccess = () => {
    fetchMatches();
  };

  // Sort matches based on selection
  const sortedMatches = [...matches].sort((a, b) => {
    if (sortBy === 'Highest Rated') {
      return (b.profile?.rating || 0) - (a.profile?.rating || 0);
    }
    if (sortBy === 'Recently Active') {
      return new Date(b.profile?.updatedAt || 0) - new Date(a.profile?.updatedAt || 0);
    }
    return (b.compatibility?.totalScore || 0) - (a.compatibility?.totalScore || 0);
  });

  return (
    <div className="min-h-screen bg-[#FAF9F5]/70 dark:bg-transparent py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (3-Part Split Matching Exact Reference Image)              */}
      {/* ========================================================================= */}
      <section className="bg-transparent pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Part A: Left Headline & Platform Badge (col-span-4) */}
          <div className="lg:col-span-4 space-y-4 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/40 border border-[#D5EAE0] dark:border-emerald-800/40 text-[#0E7057] dark:text-emerald-400 text-xs font-semibold shadow-2xs">
              <span className="w-3.5 h-2.5 rounded-[2px] bg-[#01411C] flex items-center justify-center relative overflow-hidden shrink-0">
                <span className="w-1 h-full bg-white absolute left-0 top-0"></span>
                <span className="text-[6px] text-white leading-none ml-0.5">★</span>
              </span>
              <span>Pakistan’s 1st Skill Exchange Platform</span>
            </div>

            {/* Giant Bold Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#0F243B] dark:text-white leading-[1.12] tracking-tight font-display">
              Find Your Perfect <br />
              Skill Match
            </h1>

            {/* Description Subtitle */}
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed max-w-sm font-normal">
              Connect with talented people across Pakistan and learn new skills through reciprocal exchange.
            </p>
          </div>

          {/* Part B: Center Pakistan Network & Nodes Illustration (col-span-4) */}
          <div className="lg:col-span-4 flex items-center justify-center relative h-[195px] xs:h-[215px] sm:h-[230px] overflow-hidden w-full max-w-full">
            <div className="relative w-[340px] h-[220px] flex items-center justify-center shrink-0 select-none scale-[0.72] xs:scale-[0.85] sm:scale-100 origin-center transition-transform">
              
              {/* Pakistan Outline Vector SVG with Connected Orbital Arcs */}
              <svg className="w-full h-full text-[#0E7057] dark:text-emerald-400" viewBox="0 0 340 220" fill="none">
                {/* Pakistan Simplified Stylized Outline */}
                <path
                  d="M 68 56 Q 125 24 195 68 Q 212 110 195 152 Q 145 192 125 186 Q 65 180 48 122 Q 42 80 68 56 Z"
                  stroke="#16855F"
                  strokeWidth="1.6"
                  strokeDasharray="4 4"
                  fill="#EAF6EF"
                  fillOpacity="0.2"
                  className="dark:fill-emerald-950/20 dark:stroke-emerald-500/40"
                />

                {/* Main Outer Orbital Ellipse (passes through nodes) */}
                <ellipse
                  cx="125"
                  cy="110"
                  rx="70"
                  ry="70"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="3 4"
                  strokeOpacity="0.4"
                />

                {/* Inner Concentric Ring */}
                <ellipse
                  cx="125"
                  cy="110"
                  rx="40"
                  ry="40"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeDasharray="2 3"
                  strokeOpacity="0.3"
                />

                {/* Dotted Interconnecting Network Arcs */}
                <path
                  d="M 65 56 Q 95 38, 125 38 Q 165 42, 195 110"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  strokeOpacity="0.5"
                />
                <path
                  d="M 195 110 Q 165 178, 125 180 Q 80 180, 48 122"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  strokeOpacity="0.5"
                />
                <path
                  d="M 48 122 Q 45 85, 65 56"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  strokeOpacity="0.5"
                />

                {/* Radial Spokes to Center */}
                <line x1="125" y1="110" x2="125" y2="38" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" strokeOpacity="0.3" />
                <line x1="125" y1="110" x2="195" y2="110" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" strokeOpacity="0.3" />
                <line x1="125" y1="110" x2="125" y2="180" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" strokeOpacity="0.3" />
                <line x1="125" y1="110" x2="48" y2="122" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" strokeOpacity="0.3" />
                <line x1="125" y1="110" x2="65" y2="56" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" strokeOpacity="0.3" />
              </svg>

              {/* Node Avatar 1 (Islamabad / Rawalpindi - Top Center) */}
              <div
                title="Islamabad / Rawalpindi"
                className="absolute top-[22px] left-[109px] w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-[#16855F] dark:border-emerald-400 ring-2 ring-emerald-500/20 dark:ring-emerald-400/30 shadow-md p-0.5 hover:scale-110 transition-transform cursor-pointer z-10"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Islamabad Member"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {/* Node Avatar 2 (Lahore - Center Right) */}
              <div
                title="Lahore"
                className="absolute top-[94px] left-[179px] w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-[#16855F] dark:border-emerald-400 ring-2 ring-emerald-500/20 dark:ring-emerald-400/30 shadow-md p-0.5 hover:scale-110 transition-transform cursor-pointer z-10"
              >
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Lahore Member"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {/* Node Avatar 3 (Peshawar - Top Left) */}
              <div
                title="Peshawar"
                className="absolute top-[42px] left-[51px] w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-2 border-[#16855F] dark:border-emerald-400 ring-2 ring-emerald-500/20 dark:ring-emerald-400/30 shadow-md p-0.5 hover:scale-110 transition-transform cursor-pointer z-10"
              >
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                  alt="Peshawar Member"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {/* Node Avatar 4 (Quetta - Mid Left) */}
              <div
                title="Quetta"
                className="absolute top-[108px] left-[34px] w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-2 border-[#16855F] dark:border-emerald-400 ring-2 ring-emerald-500/20 dark:ring-emerald-400/30 shadow-md p-0.5 hover:scale-110 transition-transform cursor-pointer z-10"
              >
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                  alt="Quetta Member"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {/* Node Avatar 5 (Karachi - Bottom Center) */}
              <div
                title="Karachi"
                className="absolute top-[164px] left-[109px] w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-[#16855F] dark:border-emerald-400 ring-2 ring-emerald-500/20 dark:ring-emerald-400/30 shadow-md p-0.5 hover:scale-110 transition-transform cursor-pointer z-10"
              >
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80"
                  alt="Karachi Member"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {/* Center Green Glowing Dot */}
              <div className="absolute top-[104px] left-[119px] w-3 h-3 rounded-full bg-[#16855F] ring-4 ring-[#EAF6EF] dark:ring-emerald-950/70 shadow-sm z-20" />

              {/* Handwritten Script Label: "Learn Share Grow" */}
              <div className="absolute left-[238px] top-[54px] font-hand text-2xl font-bold text-[#0E7057] dark:text-emerald-400 -rotate-3 select-none leading-[1.25] z-20">
                Learn <br />
                Share <br />
                Grow
              </div>

            </div>
          </div>

          {/* Part C: Right 4-Benefits Card (col-span-4) */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end w-full">
            <div className="rounded-2xl border border-[#E5EAE7] dark:border-slate-800 bg-white dark:bg-[#0E1526] p-4 sm:p-5 shadow-2xs space-y-3.5 max-w-sm w-full">
              {/* Row 1: Real People */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/40 text-[#0E7057] dark:text-emerald-400 border border-[#D5EAE0] dark:border-emerald-800/40 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F243B] dark:text-white">Real People</div>
                  <div className="text-[11px] text-[#708096] dark:text-slate-400">Connect with verified learners</div>
                </div>
              </div>

              {/* Row 2: Safe & Secure */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/40 text-[#0E7057] dark:text-emerald-400 border border-[#D5EAE0] dark:border-emerald-800/40 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F243B] dark:text-white">Safe & Secure</div>
                  <div className="text-[11px] text-[#708096] dark:text-slate-400">Built for trust and transparency</div>
                </div>
              </div>

              {/* Row 3: Reciprocal Learning */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/40 text-[#0E7057] dark:text-emerald-400 border border-[#D5EAE0] dark:border-emerald-800/40 flex items-center justify-center shrink-0">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F243B] dark:text-white">Reciprocal Learning</div>
                  <div className="text-[11px] text-[#708096] dark:text-slate-400">Teach what you know, learn what you need</div>
                </div>
              </div>

              {/* Row 4: Across Pakistan */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EAF6EF] dark:bg-emerald-950/40 text-[#0E7057] dark:text-emerald-400 border border-[#D5EAE0] dark:border-emerald-800/40 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F243B] dark:text-white">Across Pakistan</div>
                  <div className="text-[11px] text-[#708096] dark:text-slate-400">From big cities to small towns</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SEARCH & FILTER PANEL (Full-Width Matching Reference Image)            */}
      {/* ========================================================================= */}
      <section>
        <div className="bg-white dark:bg-[#0E1526] rounded-2xl border border-[#E5EAE7] dark:border-slate-800 p-3 sm:p-4 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            
            {/* Control 1: Search Input (lg:col-span-6) */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-6">
              <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3 py-2 flex items-center gap-2 focus-within:border-[#0E7057] focus-within:ring-2 focus-within:ring-[#0E7057]/15 transition-all">
                <Search className="w-4 h-4 text-[#708096] dark:text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search skills, e.g. Python, Graphic Design, Cooking..."
                  className="w-full text-xs text-[#0F243B] dark:text-white placeholder-[#94A3B8] dark:placeholder-slate-400 font-medium bg-transparent outline-none p-0"
                />
              </div>
            </div>

            {/* Control 2: Skill Dropdown (lg:col-span-2) */}
            <div className="col-span-1 sm:col-span-1 lg:col-span-2">
              <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3 py-1.5 focus-within:border-[#0E7057] transition-all">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#708096] dark:text-slate-400 mb-0.5">
                  <Sparkles className="w-3 h-3 text-[#0E7057] dark:text-emerald-400" />
                  <span>Skill</span>
                </div>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full text-xs text-[#0F243B] dark:text-white font-semibold bg-transparent outline-none cursor-pointer p-0"
                >
                  <option value="All" className="dark:bg-[#131B2E] dark:text-white">All Skills</option>
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

            {/* Control 3: City Dropdown (lg:col-span-2) */}
            <div className="col-span-1 sm:col-span-1 lg:col-span-2">
              <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3 py-1.5 focus-within:border-[#0E7057] transition-all">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#708096] dark:text-slate-400 mb-0.5">
                  <MapPin className="w-3 h-3 text-[#0E7057] dark:text-emerald-400" />
                  <span>City</span>
                </div>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs text-[#0F243B] dark:text-white font-semibold bg-transparent outline-none cursor-pointer p-0"
                >
                  {pakistaniCities.map((c) => (
                    <option key={c} value={c} className="dark:bg-[#131B2E] dark:text-white">
                      {c === 'All' ? 'All Cities' : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Control 4: Learning Mode Dropdown (lg:col-span-2) */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-2">
              <div className="rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131B2E] px-3 py-1.5 focus-within:border-[#0E7057] transition-all">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#708096] dark:text-slate-400 mb-0.5">
                  <GraduationCap className="w-3 h-3 text-[#0E7057] dark:text-emerald-400" />
                  <span>Learning Mode</span>
                </div>
                <select
                  value={learningMode}
                  onChange={(e) => setLearningMode(e.target.value)}
                  className="w-full text-xs text-[#0F243B] dark:text-white font-semibold bg-transparent outline-none cursor-pointer p-0"
                >
                  <option value="All" className="dark:bg-[#131B2E] dark:text-white">All Modes</option>
                  <option value="Online" className="dark:bg-[#131B2E] dark:text-white">Online Video Only</option>
                  <option value="Physical" className="dark:bg-[#131B2E] dark:text-white">In-Person Only</option>
                  <option value="Both" className="dark:bg-[#131B2E] dark:text-white">Both (Hybrid)</option>
                </select>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MATCH RESULTS HEADER & SORTING                                         */}
      {/* ========================================================================= */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#0E7057] dark:text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-black text-[#0F243B] dark:text-white font-display">
                Top Matches for You
              </h2>
            </div>
            <p className="text-xs text-[#708096] dark:text-slate-400 mt-0.5">
              Based on your skills, interests and location.
            </p>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 bg-white dark:bg-[#0E1526] border border-[#E2E8F0] dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-[#0F243B] dark:text-white font-bold shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#708096] dark:text-slate-400" />
              <span className="text-[#708096] dark:text-slate-400 font-normal">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none cursor-pointer font-bold text-[#0F243B] dark:text-white"
              >
                <option value="Best Match" className="dark:bg-[#0E1526] dark:text-white">Best Match</option>
                <option value="Highest Rated" className="dark:bg-[#0E1526] dark:text-white">Highest Rated</option>
                <option value="Recently Active" className="dark:bg-[#0E1526] dark:text-white">Recently Active</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-3 border-[#0E7057]/20 border-t-[#0E7057] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-[#708096] dark:text-slate-400 uppercase tracking-wider">
              Finding compatible skill partners across Pakistan...
            </p>
          </div>
        ) : sortedMatches.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-[#0E1526] rounded-3xl p-12 text-center border border-[#E5EAE7] dark:border-slate-800 shadow-2xs">
            <span className="text-4xl mb-3 block">🔍</span>
            <h3 className="text-base font-extrabold text-[#0F243B] dark:text-white">No Direct Matches Found</h3>
            <p className="text-xs text-[#708096] dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
              Try broadening your search filters or exploring different skills.
            </p>
            <button
              onClick={() => {
                setCity('All');
                setLearningMode('All');
                setSelectedSkill('All');
                setSearch('');
              }}
              className="px-5 py-2 rounded-xl bg-[#0E7057] text-white text-xs font-bold cursor-pointer hover:bg-[#0A5743] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Responsive 3-Column Grid of Match Profile Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedMatches.map((item, idx) => (
              <MatchCard
                key={item?.profile?._id || item?._id || idx}
                item={item}
                onProposalSuccess={handleProposalSuccess}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
