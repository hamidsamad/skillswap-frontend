import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Globe, Shield, Sparkles, ArrowUpRight } from 'lucide-react';
import SkillExchangeLogo from './SkillExchangeLogo';

export default function Footer() {
  return (
    <footer className="mt-16 sm:mt-24 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#070D1B] text-slate-600 dark:text-slate-400 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {/* Col 1: Platform Mission */}
          <div className="sm:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 flex items-center justify-center p-1.5 shadow-xs shrink-0">
                <SkillExchangeLogo className="w-full h-full" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xl font-extrabold text-[#0B132A] dark:text-white tracking-tight">
                    SkillSwap Pakistan
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/30">
                    0 PKR Fees
                  </span>
                </div>
                <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Skill Exchange Network
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              Pakistan's first 1-on-1 peer skill exchange platform. We believe talent is distributed equally across Karachi, Lahore, Islamabad, and every corner of Pakistan, but expensive tuition shouldn't stand in the way of mastery.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs pt-1">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 text-[11px] sm:text-xs">
                <Globe className="w-3.5 h-3.5" /> All Pakistan Cities (140+)
              </span>
              <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-semibold bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20 text-[11px] sm:text-xs">
                <Shield className="w-3.5 h-3.5" /> Milestone Agreements
              </span>
            </div>
          </div>

          {/* Col 2: Pakistani Hubs */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3.5">
              Regional Barter Hubs
            </h4>
            <ul className="space-y-1.5 text-xs font-medium">
              <li>
                <Link
                  to="/matches?city=Karachi"
                  className="hover:text-sky-500 dark:hover:text-emerald-400 transition-colors flex items-center justify-between group min-h-[36px] py-1"
                >
                  <span>Karachi Tech &amp; Freelance Hub</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/matches?city=Lahore"
                  className="hover:text-sky-500 dark:hover:text-emerald-400 transition-colors flex items-center justify-between group min-h-[36px] py-1"
                >
                  <span>Lahore Creative &amp; Design Circle</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/matches?city=Islamabad"
                  className="hover:text-sky-500 dark:hover:text-emerald-400 transition-colors flex items-center justify-between group min-h-[36px] py-1"
                >
                  <span>Islamabad AI &amp; Research Community</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/matches?city=Rawalpindi"
                  className="hover:text-sky-500 dark:hover:text-emerald-400 transition-colors flex items-center justify-between group min-h-[36px] py-1"
                >
                  <span>Rawalpindi &amp; Peshawar Network</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/matches?city=Faisalabad"
                  className="hover:text-sky-500 dark:hover:text-emerald-400 transition-colors flex items-center justify-between group min-h-[36px] py-1"
                >
                  <span>Faisalabad &amp; Multan Makers</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3.5">
              Explore Platform
            </h4>
            <ul className="space-y-1.5 text-xs font-medium">
              <li>
                <Link to="/matches" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors flex items-center justify-between min-h-[36px] py-1">
                  <span>Algorithmic Match Finder</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link to="/skills" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors flex items-center justify-between min-h-[36px] py-1">
                  <span>All Skills Directory</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link to="/swaps" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors flex items-center justify-between min-h-[36px] py-1">
                  <span>My Swap Agreements</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors flex items-center justify-between min-h-[36px] py-1">
                  <span>Live Barter Messaging</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} SkillSwap Pakistan. Dedicated to the youth, students, and creators of Pakistan.</p>
          <div className="flex items-center gap-1.5 font-medium shrink-0">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span className="text-slate-600 dark:text-slate-300 font-semibold">for Pakistani Learners</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
