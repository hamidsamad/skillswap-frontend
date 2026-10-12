import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, ShieldCheck, CheckCheck, MessageSquare } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

function formatTimeAgo(dateString) {
  if (!dateString) return 'Recently';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 45) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}

export default function UserNotificationDropdown({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 72, left: 12, width: 360, maxHeight: 460 });
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    userNotifications = [],
    unreadNotificationCount = 0,
    unreadCount = 0,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshUserNotifications
  } = useSocket();

  // Calculate dynamic viewport-aware coordinates relative to the bell button
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;

    // Viewport-aware horizontal margin (12px on left and right = 24px)
    const margin = 12;

    // Responsive width matching: min(400px, calc(100vw - 24px))
    const maxAvailableWidth = Math.max(280, vw - margin * 2);
    const popupWidth = Math.min(380, maxAvailableWidth);

    // Spacing beneath the bell trigger
    const top = rect.bottom + 8;

    // Viewport height boundary: keep entire popup visible without causing document scroll
    const maxHeight = Math.max(200, Math.min(500, vh - top - 16));

    // Dynamic horizontal position: center beneath the bell icon
    const bellCenter = rect.left + rect.width / 2;
    let left = bellCenter - popupWidth / 2;

    // Viewport boundary clamping to guarantee popup never extends past screen edges
    if (left < margin) {
      left = margin;
    } else if (left + popupWidth > vw - margin) {
      left = vw - popupWidth - margin;
    }

    setCoords({
      top: Math.round(top),
      left: Math.round(left),
      width: Math.round(popupWidth),
      maxHeight: Math.round(maxHeight),
    });
  }, []);

  // Recalculate on resize, scroll, and orientation changes
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleUpdate = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('orientationchange', handleUpdate);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('orientationchange', handleUpdate);
    };
  }, [isOpen, updatePosition]);

  // Synchronous positioning update before browser paint
  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  // Close when clicking outside both the bell trigger and the dropdown panel
  useEffect(() => {
    function handleClickOutside(event) {
      if (buttonRef.current && buttonRef.current.contains(event.target)) {
        return;
      }
      if (panelRef.current && panelRef.current.contains(event.target)) {
        return;
      }
      setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Close on route navigation
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleToggle = (e) => {
    e?.stopPropagation?.();
    const nextState = !isOpen;
    if (nextState) {
      updatePosition();
      if (refreshUserNotifications) {
        refreshUserNotifications();
      }
    }
    setIsOpen(nextState);
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead && markNotificationAsRead) {
      markNotificationAsRead(notif._id);
    }
  };

  const totalUnread = unreadNotificationCount + unreadCount;

  return (
    <div className={`relative ${className}`}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        ref={buttonRef}
        id="user-notifications-bell-btn"
        onClick={handleToggle}
        className="relative min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 rounded-xl text-[#24364B] dark:text-slate-300 hover:bg-[#EAF6EF] dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-[#E5EAE7] dark:hover:border-slate-800"
        title="Notifications"
        aria-label="Open notifications menu"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell className="w-4.5 h-4.5" />
        {totalUnread > 0 && (
          <span
            id="user-notifications-badge"
            className="absolute top-1.5 right-1.5 min-w-[18px] h-4.5 px-1 bg-[#DC5555] text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-[#FAF9F5] dark:ring-[#0D1527] animate-pulse"
          >
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {/* Dropdown Surface rendered via Portal for viewport isolation */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          id="user-notifications-dropdown-menu"
          role="dialog"
          aria-label="Notifications"
          aria-modal="false"
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            maxWidth: 'calc(100vw - 24px)',
            maxHeight: `${coords.maxHeight}px`,
            boxSizing: 'border-box',
            zIndex: 60,
          }}
          className="flex flex-col rounded-2xl bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 shadow-2xl p-0 overflow-hidden"
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-[#E5EAE7] dark:border-slate-800 flex items-center justify-between bg-[#FAF9F5]/70 dark:bg-[#080B14]/60 shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-[#102B50] dark:text-white font-display">
                Notifications
              </span>
              {unreadNotificationCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#EAF6EF] dark:bg-emerald-950/70 text-[#07866D] dark:text-emerald-400 border border-[#07866D]/20">
                  {unreadNotificationCount} new
                </span>
              )}
            </div>

            {unreadNotificationCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  markAllNotificationsAsRead?.();
                }}
                className="text-[11px] font-bold text-[#07866D] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E5EAE7]/70 dark:divide-slate-800/70 touch-scroll overscroll-contain">
            {userNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-2xl bg-[#EAF6EF] dark:bg-emerald-950/40 text-[#07866D] dark:text-emerald-400 flex items-center justify-center mx-auto mb-2.5">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#102B50] dark:text-white">
                  No notifications yet
                </p>
                <p className="text-[11px] text-[#708096] dark:text-slate-400 mt-0.5 max-w-[280px] mx-auto leading-relaxed">
                  You are completely caught up! We will notify you here when your reports or requests are reviewed.
                </p>
              </div>
            ) : (
              userNotifications.map((notif) => {
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 sm:p-4 transition-colors cursor-pointer text-left relative ${
                      notif.isRead
                        ? 'hover:bg-slate-50 dark:hover:bg-[#131B2E]'
                        : 'bg-[#FAF9F5] dark:bg-[#131B2E]/90 border-l-3 border-[#07866D]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="p-2 rounded-xl bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 shrink-0 border border-[#07866D]/20 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                            <span className="font-extrabold text-xs text-[#102B50] dark:text-white break-words">
                              {notif.title || 'Report Status Update'}
                            </span>
                            {notif.reportId && (
                              <span className="px-1.5 py-0.2 rounded-md bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-700 text-[10px] font-bold text-[#708096] dark:text-slate-300 font-mono shrink-0">
                                #{notif.reportId}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-[#708096] dark:text-slate-400 whitespace-nowrap shrink-0">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>

                        {/* Notification Message */}
                        <p className="text-xs text-[#24364B] dark:text-slate-200 leading-snug font-medium break-words">
                          {notif.message}
                        </p>

                        {/* Status Tag */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EAF6EF] dark:bg-emerald-900/60 text-[#07866D] dark:text-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#07866D] dark:bg-emerald-400 animate-pulse" />
                            <span>Under Review</span>
                          </span>
                          {!notif.isRead && (
                            <span className="text-[10px] text-[#07866D] dark:text-emerald-400 font-bold">
                              • Unread
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer: Live Chat Shortcut */}
          {unreadCount > 0 && (
            <div className="p-2.5 bg-[#FAF9F5]/90 dark:bg-[#080B14]/80 border-t border-[#E5EAE7] dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
              <span className="text-[#708096] dark:text-slate-400 text-[11px] font-semibold">
                {unreadCount} unread chat message{unreadCount > 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  navigate('/chat');
                }}
                className="text-[11px] font-bold text-[#07866D] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Go to Live Chat</span>
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
