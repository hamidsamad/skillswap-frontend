import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import {
  Compass,
  ArrowRightLeft,
  FileCheck,
  MessageSquare,
  ShieldCheck,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Bell,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import UserAvatar from './UserAvatar';
import SkillExchangeLogo from './SkillExchangeLogo';
import DeleteAccountModal from './DeleteAccountModal';
import UserNotificationDropdown from './UserNotificationDropdown';
import ReportModal from './ReportModal';

export default function Navbar() {
  const { user, profile, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, pendingReportsCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#FAF9F5]/95 dark:bg-[#080B14]/90 border-b border-[#E5EAE7] dark:border-slate-800 transition-colors duration-200 shadow-[0_1px_3px_rgba(16,43,80,0.04)]">
      <div className="w-full px-3 xs:px-4 sm:px-6 lg:px-8 xl:px-12 h-16 sm:h-20 lg:h-[84px] flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center shrink-0">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group select-none">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 group-hover:border-[#07866D]/40 transition-all duration-300">
              <SkillExchangeLogo className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#102B50] dark:text-white transition-colors">
                  SkillSwap
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#07866D] text-white tracking-wider shadow-xs">
                  PK
                </span>
              </div>
              <span className="block text-[9px] sm:text-[10px] text-[#708096] dark:text-slate-400 font-bold tracking-widest uppercase">
                SKILL EXCHANGE
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-3.5 xl:gap-7 2xl:gap-8 justify-center flex-1 mx-2 xl:mx-6">
          <Link
            to="/"
            className={`text-sm py-1 font-semibold flex items-center gap-1.5 transition-all relative ${
              isActive('/')
                ? 'text-[#07866D] dark:text-emerald-400 font-bold after:content-[""] after:block after:w-full after:h-[2px] after:bg-[#07866D] after:rounded-full after:absolute after:-bottom-1'
                : 'text-[#24364B] dark:text-slate-300 hover:text-[#07866D] dark:hover:text-emerald-400'
            }`}
          >
            <span>Home</span>
          </Link>

          <Link
            to="/matches"
            className={`text-sm py-1 font-semibold flex items-center gap-1.5 transition-all relative ${
              isActive('/matches')
                ? 'text-[#07866D] dark:text-emerald-400 font-bold after:content-[""] after:block after:w-full after:h-[2px] after:bg-[#07866D] after:rounded-full after:absolute after:-bottom-1'
                : 'text-[#24364B] dark:text-slate-300 hover:text-[#07866D] dark:hover:text-emerald-400'
            }`}
          >
            <span>Match Finder</span>
          </Link>

          <Link
            to="/skills"
            className={`text-sm py-1 font-semibold flex items-center gap-1.5 transition-all relative ${
              isActive('/skills')
                ? 'text-[#07866D] dark:text-emerald-400 font-bold after:content-[""] after:block after:w-full after:h-[2px] after:bg-[#07866D] after:rounded-full after:absolute after:-bottom-1'
                : 'text-[#24364B] dark:text-slate-300 hover:text-[#07866D] dark:hover:text-emerald-400'
            }`}
          >
            <span>Skills Directory</span>
          </Link>

          <Link
            to="/chat"
            className={`text-sm py-1 font-semibold flex items-center gap-1.5 transition-all relative ${
              isActive('/chat')
                ? 'text-[#07866D] dark:text-emerald-400 font-bold after:content-[""] after:block after:w-full after:h-[2px] after:bg-[#07866D] after:rounded-full after:absolute after:-bottom-1'
                : 'text-[#24364B] dark:text-slate-300 hover:text-[#07866D] dark:hover:text-emerald-400'
            }`}
          >
            <span>Live Chat</span>
            {unreadCount > 0 && (
              <span
                id="navbar-livechat-badge"
                className="absolute -top-2.5 -right-3 min-w-[18px] h-4.5 px-1 bg-[#DC5555] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-[#0D1527] z-20 pointer-events-none animate-pulse"
                title={`${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <Link
            to="/swaps"
            className={`text-sm py-1 font-semibold flex items-center gap-1.5 transition-all relative ${
              isActive('/swaps')
                ? 'text-[#07866D] dark:text-emerald-400 font-bold after:content-[""] after:block after:w-full after:h-[2px] after:bg-[#07866D] after:rounded-full after:absolute after:-bottom-1'
                : 'text-[#24364B] dark:text-slate-300 hover:text-[#07866D] dark:hover:text-emerald-400'
            }`}
          >
            <span>Swap Agreements</span>
          </Link>
        </nav>

        {/* Right Action Tools: Theme Toggle, Bell, Profile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">

          {/* Persistent Notifications Menu Dropdown & Real-Time Alert */}
          <UserNotificationDropdown />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 rounded-xl text-[#24364B] dark:text-slate-300 hover:bg-[#EAF6EF] dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-[#102B50]" />}
          </button>

          {/* User Menu or Sign In */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="min-h-[40px] sm:min-h-[44px] flex items-center gap-1.5 sm:gap-2 py-1 px-2 sm:px-2.5 rounded-full hover:bg-[#EAF6EF] dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-[#E5EAE7] dark:border-slate-800"
                aria-label="User Account Menu"
              >
                <UserAvatar user={user} size="sm" className="ring-1 ring-[#07866D]/30" />
                <span className="text-xs font-bold text-[#102B50] dark:text-white hidden sm:inline truncate max-w-[90px]">
                  {user?.name?.split(' ')[0] || 'Member'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#708096] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-56 rounded-2xl bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-[#E5EAE7] dark:border-slate-800/80">
                    <p className="text-xs font-extrabold text-[#102B50] dark:text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-[#708096] truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-[#24364B] dark:text-slate-300 rounded-xl hover:bg-[#EAF6EF] dark:hover:bg-slate-800 transition-colors flex items-center gap-2 mt-1"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#07866D]" />
                    <span>Profile & Settings</span>
                  </Link>
                  <Link
                    to="/swaps"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-[#24364B] dark:text-slate-300 rounded-xl hover:bg-[#EAF6EF] dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-[#07866D]" />
                    <span>My Swap Agreements</span>
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowReportIssueModal(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-[#24364B] dark:text-slate-300 rounded-xl hover:bg-[#EAF6EF] dark:hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-[#07866D]" />
                    <span>Report an Issue</span>
                  </button>

                  <div className="my-1 border-t border-[#E5EAE7] dark:border-slate-800" />

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowDeleteModal(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-[#DC5555] rounded-xl hover:bg-[#DC5555]/10 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#DC5555]" />
                    <span>Delete Account</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-[#24364B] dark:text-slate-300 rounded-xl hover:bg-[#EAF6EF] dark:hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-2 text-xs font-bold text-[#24364B] dark:text-slate-200 hover:text-[#07866D] dark:hover:text-emerald-400 transition-colors min-h-[44px] flex items-center"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-emerald !py-2 !px-3.5 !text-xs !shadow-sm min-h-[40px]"
              >
                Join Free
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5EAE7] dark:border-slate-800 bg-[#FAF9F5]/98 dark:bg-[#080B14]/98 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200 shadow-xl max-h-[calc(100dvh-64px)] sm:max-h-[calc(100dvh-80px)] overflow-y-auto overscroll-contain">
          {/* If unauthenticated, show quick join/sign in actions */}
          {!isAuthenticated && (
            <div className="grid grid-cols-2 gap-2.5 pb-2 mb-2 border-b border-[#E5EAE7] dark:border-slate-800">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full min-h-[44px] py-2.5 px-3 rounded-xl border border-[#E5EAE7] dark:border-slate-700 bg-white dark:bg-[#131B2E] text-xs font-bold text-[#102B50] dark:text-white flex items-center justify-center transition-colors text-center shadow-xs"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-emerald w-full min-h-[44px] !py-2.5 !px-3 !text-xs !shadow-sm text-center"
              >
                Join Free
              </Link>
            </div>
          )}

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
              isActive('/') ? 'bg-[#EAF6EF] text-[#07866D] dark:text-emerald-400 dark:bg-emerald-950/40' : 'text-[#24364B] dark:text-slate-200 hover:bg-[#EAF6EF]/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>Home</span>
          </Link>
          <Link
            to="/matches"
            onClick={() => setMobileMenuOpen(false)}
            className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
              isActive('/matches') ? 'bg-[#EAF6EF] text-[#07866D] dark:text-emerald-400 dark:bg-emerald-950/40' : 'text-[#24364B] dark:text-slate-200 hover:bg-[#EAF6EF]/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-[#07866D] shrink-0" />
            <span>Match Finder</span>
          </Link>
          <Link
            to="/skills"
            onClick={() => setMobileMenuOpen(false)}
            className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
              isActive('/skills') ? 'bg-[#EAF6EF] text-[#07866D] dark:text-emerald-400 dark:bg-emerald-950/40' : 'text-[#24364B] dark:text-slate-200 hover:bg-[#EAF6EF]/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4 text-[#07866D] shrink-0" />
            <span>Skills Directory</span>
          </Link>

          <Link
            to="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
              isActive('/chat') ? 'bg-[#EAF6EF] text-[#07866D] dark:text-emerald-400 dark:bg-emerald-950/40' : 'text-[#24364B] dark:text-slate-200 hover:bg-[#EAF6EF]/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-[#07866D] shrink-0" />
              <span>Live Chat</span>
            </span>
            {unreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 bg-[#DC5555] text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/swaps"
                onClick={() => setMobileMenuOpen(false)}
                className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${
                  isActive('/swaps') ? 'bg-[#EAF6EF] text-[#07866D] dark:text-emerald-400 dark:bg-emerald-950/40' : 'text-[#24364B] dark:text-slate-200 hover:bg-[#EAF6EF]/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <FileCheck className="w-4 h-4 text-[#07866D] shrink-0" />
                <span>Swap Agreements</span>
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 text-[#24364B] dark:text-slate-200 hover:bg-[#EAF6EF]/60 dark:hover:bg-slate-800/60 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-[#07866D] shrink-0" />
                <span>My Profile</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowReportIssueModal(true);
                }}
                className="w-full min-h-[44px] text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 text-[#24364B] dark:text-slate-200 hover:bg-[#EAF6EF]/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-[#07866D] shrink-0" />
                <span>Report an Issue</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowDeleteModal(true);
                }}
                className="w-full min-h-[44px] text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 text-[#DC5555] hover:bg-[#DC5555]/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-[#DC5555] shrink-0" />
                <span>Delete Account</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/');
                }}
                className="w-full min-h-[44px] text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 text-[#708096] dark:text-slate-400 hover:bg-[#EAF6EF] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </>
          )}

          {/* Mobile Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full min-h-[44px] text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between text-[#24364B] dark:text-slate-300 hover:bg-[#EAF6EF] dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 text-[#102B50] dark:text-slate-300 shrink-0" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-[#07866D]">{theme}</span>
          </button>
        </div>
      )}
    </header>

    {/* Delete Account Modal Dialog */}
    <DeleteAccountModal
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
    />

    {/* General Report an Issue Modal */}
    <ReportModal
      isOpen={showReportIssueModal}
      onClose={() => setShowReportIssueModal(false)}
    />
  </>
);
}
