import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Clock,
  Layers,
  BarChart3,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ExternalLink,
  Lock,
  Sparkles,
  Radio
} from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import SkillExchangeLogo from '../components/SkillExchangeLogo';
import NotificationToastContainer from '../components/NotificationToastContainer';

/**
 * AdminLayout: Dedicated, fully isolated layout strictly for authorized administrators.
 * Displays only administrative controls, reports management, user moderation, analytics,
 * and security audit logs. Never exposes normal user navigation or marketplace pages.
 */
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pendingReportsCount, isConnected } = useSocket();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabSelect = (tabKey) => {
    setSearchParams({ tab: tabKey });
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: BarChart3 },
    {
      id: 'reports',
      label: 'Reports Management',
      icon: ShieldAlert,
      badge: pendingReportsCount
    },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'audit', label: 'Audit Logs', icon: Clock },
    { id: 'skills', label: 'Skills Taxonomy', icon: Layers }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] dark:bg-[#080B14] text-[#24364B] dark:text-slate-100 selection:bg-[#07866D] selection:text-white transition-colors duration-200 relative">
      <div className="ambient-mesh" aria-hidden="true" />

      {/* Top Administrative Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#FAF9F5]/95 dark:bg-[#080B14]/90 border-b border-[#E5EAE7] dark:border-slate-800 transition-colors duration-200 shadow-[0_1px_3px_rgba(16,43,80,0.04)]">
        <div className="w-full px-3 xs:px-4 sm:px-6 lg:px-8 xl:px-10 h-16 sm:h-20 lg:h-[84px] flex items-center justify-between">
          
          {/* Brand Identity: Dedicated Admin Control Hub */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link to="/admin" className="flex items-center gap-2.5 sm:gap-3 group select-none">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 group-hover:border-[#07866D]/40 transition-all duration-300">
                <SkillExchangeLogo className="w-full h-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#102B50] dark:text-white transition-colors">
                    SkillSwap
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#07866D] text-white tracking-wider shadow-xs uppercase">
                    Admin
                  </span>
                </div>
                <span className="block text-[9px] sm:text-[10px] text-[#708096] dark:text-slate-400 font-bold tracking-widest uppercase">
                  MANAGEMENT PORTAL
                </span>
              </div>
            </Link>

            {/* Live Real-time Status Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 text-[11px] font-semibold text-[#708096] dark:text-slate-400 shadow-2xs">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isConnected ? 'Real-Time Active' : 'Connecting'}</span>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 2xl:gap-2 justify-center flex-1 mx-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabSelect(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                    isActive
                      ? 'bg-[#07866D] text-white shadow-sm'
                      : 'bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 text-[#24364B] dark:text-slate-300 hover:border-[#07866D]/40 hover:text-[#07866D]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span
                      className={`min-w-[18px] h-4.5 px-1 text-[10px] font-black rounded-full flex items-center justify-center animate-pulse ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#DC5555] text-white shadow-sm'
                      }`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Admin Profile, Theme, Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle */}
            <button
              type="button"
              id="admin-theme-toggle"
              onClick={toggleTheme}
              className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 rounded-xl text-[#24364B] dark:text-slate-300 hover:bg-[#EAF6EF] dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-[#E5EAE7] dark:border-slate-800 bg-white dark:bg-[#0E1526]"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-[#102B50]" />
              )}
            </button>

            {/* Administrator Identity Badge */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 shadow-2xs">
              <UserAvatar
                user={user}
                className="w-7 h-7 ring-1 ring-[#07866D]/30"
                size={28}
              />
              <div className="text-left">
                <div className="text-xs font-bold text-[#102B50] dark:text-white leading-tight truncate max-w-[110px]">
                  {user?.name || 'Administrator'}
                </div>
                <div className="text-[9px] font-extrabold text-[#07866D] dark:text-emerald-400 tracking-wider uppercase">
                  System Admin
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3 sm:px-3.5 py-2 rounded-xl border border-[#E5EAE7] dark:border-slate-700 bg-white dark:bg-[#131B2E] text-[#24364B] dark:text-slate-200 hover:text-[#DC5555] hover:border-[#DC5555]/30 hover:bg-[#DC5555]/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Sign Out of Admin Hub"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">Sign Out</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#24364B] dark:text-slate-300 hover:bg-[#EAF6EF] dark:hover:bg-slate-800 border border-[#E5EAE7] dark:border-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Admin Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E5EAE7] dark:border-slate-800 bg-[#FAF9F5] dark:bg-[#080B14] px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
            <div className="p-2 mb-2 rounded-2xl bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 flex items-center gap-2.5 shadow-2xs">
              <UserAvatar user={user} className="w-8 h-8 ring-1 ring-[#07866D]/30" size={32} />
              <div>
                <div className="text-xs font-bold text-[#102B50] dark:text-white">{user?.name}</div>
                <div className="text-[10px] text-[#07866D] dark:text-emerald-400 font-bold uppercase">{user?.email}</div>
              </div>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabSelect(item.id)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-[#07866D] text-white shadow-sm'
                      : 'text-[#24364B] dark:text-slate-300 hover:bg-[#EAF6EF] dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#DC5555] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full mt-2 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 text-[#DC5555] hover:bg-[#DC5555]/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Admin</span>
            </button>
          </div>
        )}
      </header>

      {/* Admin Content Area: Contains ONLY main page content */}
      <NotificationToastContainer />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
