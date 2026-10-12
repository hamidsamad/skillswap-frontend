import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { MessageSquare, Mic, X, Bell, Volume2, Sparkles, Paperclip, ShieldAlert, ShieldCheck } from 'lucide-react';
import UserAvatar from './UserAvatar';

export default function NotificationToastContainer() {
  const {
    notifications,
    dismissNotification,
    desktopPermission,
    requestNotificationPermission
  } = useSocket();
  const navigate = useNavigate();
  const [dismissedBanner, setDismissedBanner] = React.useState(
    () => typeof window !== 'undefined' && localStorage.getItem('skillswap_dismiss_notif_banner') === 'true'
  );

  const handleDismissBanner = () => {
    setDismissedBanner(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('skillswap_dismiss_notif_banner', 'true');
    }
  };

  const showBanner = desktopPermission === 'default' && !dismissedBanner;

  if (notifications.length === 0 && !showBanner) {
    return null;
  }

  const handleToastClick = (notif) => {
    dismissNotification(notif.id);
    if (notif.type === 'admin_report') {
      navigate('/admin?tab=reports');
    } else if (notif.type === 'user_notification') {
      // User notification dismissed on click
    } else if (notif.conversationId) {
      navigate(`/chat?conversationId=${notif.conversationId}`);
    } else {
      navigate('/chat');
    }
  };

  return (
    <div
      className="fixed top-3 xs:top-4 inset-x-3 sm:inset-x-auto sm:right-4 z-[9999] max-w-sm sm:w-full space-y-2.5 pointer-events-none"
      aria-live="polite"
    >
      {/* Desktop Notification Permission Banner */}
      {showBanner && (
        <div className="pointer-events-auto p-3 bg-gradient-to-r from-sky-900/90 to-teal-900/90 text-white backdrop-blur-xl rounded-2xl border border-sky-400/30 shadow-xl flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-2 min-w-0">
            <Bell className="w-4 h-4 text-sky-400 shrink-0 animate-bounce" />
            <span className="font-semibold text-[11px] leading-tight truncate">
              Enable alerts for new messages?
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={requestNotificationPermission}
              className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-white font-bold text-[11px] rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
            >
              Allow
            </button>
            <button
              type="button"
              onClick={handleDismissBanner}
              className="p-1 text-sky-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Don't ask again"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Stack of In-App Notification Toast Cards */}
      {notifications.map((notif) => {
        if (notif.type === 'user_notification') {
          return (
            <div
              key={notif.id}
              className="pointer-events-auto bg-white/95 dark:bg-[#0E1526]/95 text-[#24364B] dark:text-slate-100 backdrop-blur-2xl border border-[#07866D]/40 dark:border-emerald-600/40 shadow-2xl shadow-emerald-950/20 rounded-2xl p-3.5 flex items-start gap-3 transition-all hover:scale-[1.02] cursor-pointer group animate-in slide-in-from-right-5 fade-in duration-300"
              onClick={() => handleToastClick(notif)}
              role="alert"
            >
              <div className="p-2.5 rounded-xl bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 shrink-0 border border-[#07866D]/30">
                <ShieldCheck className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="font-extrabold text-[10px] text-[#07866D] dark:text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
                    <span>Moderation Alert</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EAF6EF] dark:bg-emerald-900/60 text-[#07866D] dark:text-emerald-300 font-black">
                      Under Review
                    </span>
                  </span>
                  <span className="text-[10px] text-[#708096] dark:text-slate-400 font-semibold shrink-0">Just now</span>
                </div>
                <div className="font-extrabold text-xs text-[#102B50] dark:text-white truncate">
                  {notif.title || 'Report Status Update'} {notif.reportId ? `• Ref #${notif.reportId}` : ''}
                </div>
                <p className="text-[11px] text-[#24364B] dark:text-slate-300 mt-1 leading-snug font-medium">
                  {notif.content}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification(notif.id);
                }}
                className="p-1 rounded-lg text-[#708096] hover:text-[#102B50] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        }

        if (notif.type === 'admin_report') {
          return (
            <div
              key={notif.id}
              className="pointer-events-auto bg-gradient-to-r from-rose-950/95 via-slate-900/95 to-slate-900/95 text-white backdrop-blur-2xl border border-rose-500/50 shadow-2xl shadow-rose-950/50 rounded-2xl p-3.5 flex items-start gap-3 transition-all hover:scale-[1.02] cursor-pointer group animate-in slide-in-from-right-5 fade-in duration-300"
              onClick={() => handleToastClick(notif)}
              role="alert"
            >
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 border border-rose-500/30">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="font-extrabold text-[10px] text-rose-400 tracking-wider uppercase flex items-center gap-1.5">
                    <span>Admin Alert</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-white font-black">{notif.priority}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold shrink-0">Just now</span>
                </div>
                <div className="font-extrabold text-xs text-white truncate">{notif.category}</div>
                <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
                  Ref #{notif.reportId} • Target: {notif.reportedName} (by {notif.reporterName})
                </p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-rose-400 font-bold">
                  <span>Open in Admin Dashboard</span>
                  <span>→</span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification(notif.id);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        }

        return (
          <div
            key={notif.id}
            className="pointer-events-auto bg-white/95 dark:bg-[#0D1527]/95 backdrop-blur-2xl border border-sky-500/30 dark:border-sky-500/20 shadow-2xl shadow-sky-950/20 dark:shadow-black/50 rounded-2xl p-3.5 flex items-start gap-3 transition-all hover:scale-[1.02] cursor-pointer group animate-in slide-in-from-right-5 fade-in duration-300"
            onClick={() => handleToastClick(notif)}
            role="alert"
          >
          {/* Sender Avatar */}
          <div className="relative shrink-0">
            <UserAvatar
              user={{ name: notif.senderName, avatar: notif.senderAvatar }}
              size="md"
              className="ring-2 ring-sky-500/40"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
          </div>

          {/* Toast Body */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                {notif.senderName}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                Just now
              </span>
            </div>

            {/* Content snippet */}
            {notif.isVoice ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 dark:bg-emerald-500/15 px-2.5 py-1 rounded-xl border border-emerald-500/20 w-fit mt-1">
                <Mic className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-[11px]">Voice Note ({Math.round(notif.duration || 0)}s)</span>
                {/* Mini animated audio bars */}
                <span className="flex items-center gap-0.5 ml-1">
                  <span className="w-0.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="w-0.5 h-3.5 bg-emerald-500 rounded-full animate-pulse [animation-delay:0.15s]" />
                  <span className="w-0.5 h-2 bg-emerald-500 rounded-full animate-pulse [animation-delay:0.3s]" />
                </span>
              </div>
            ) : notif.isFile ? (
              <div className="mt-1 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 font-bold bg-sky-500/10 dark:bg-sky-500/15 px-2.5 py-1 rounded-xl border border-sky-500/20 w-fit">
                  <Paperclip className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span className="text-[11px] truncate max-w-[200px]">{notif.fileName || 'Shared Document'}</span>
                </div>
                {notif.content && notif.content !== notif.fileName && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-snug font-medium">
                    {notif.content}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-snug font-medium mt-0.5">
                {notif.content}
              </p>
            )}

            <div className="flex items-center gap-1 mt-1 text-[10px] text-sky-600 dark:text-sky-400 font-bold">
              <span>Click to open live chat</span>
              <span>→</span>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dismissNotification(notif.id);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          </div>
        );
      })}
    </div>
  );
}
