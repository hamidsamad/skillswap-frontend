import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../api/client';
import { useAuth } from './AuthContext';
import { playNotificationSound } from '../utils/notificationSound';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadByConv, setUnreadByConv] = useState({});
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [userNotifications, setUserNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [desktopPermission, setDesktopPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Keep a ref to activeConversationId so socket listeners always read latest without stale closure
  const activeConversationIdRef = useRef(null);
  const userRef = useRef(user);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Fetch true unread counts from server
  const refreshUnreadCount = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      setUnreadByConv({});
      return;
    }
    try {
      const res = await api.get('/chat/unread-count');
      if (res.data && res.data.success) {
        setUnreadCount(Number(res.data.unreadCount) || 0);
        setUnreadByConv(res.data.byConversation || {});
      }
    } catch (e) {
      console.warn('Could not refresh unread count:', e?.message);
    }
  }, [token]);

  // Fetch persistent notifications for user
  const refreshUserNotifications = useCallback(async () => {
    if (!token) {
      setUserNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }
    try {
      const res = await api.get('/notifications');
      if (res.data && res.data.success) {
        setUserNotifications(res.data.notifications || []);
        setUnreadNotificationCount(Number(res.data.unreadCount) || 0);
      }
    } catch (e) {
      console.warn('Could not refresh user notifications:', e?.message);
    }
  }, [token]);

  // Mark single user notification as read
  const markNotificationAsRead = useCallback(async (id) => {
    if (!id || !token) return;
    try {
      await api.patch(`/notifications/${id}/read`);
      setUserNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.warn('Could not mark notification as read:', e?.message);
    }
  }, [token]);

  // Mark all user notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    if (!token) return;
    try {
      await api.patch('/notifications/read-all');
      setUserNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadNotificationCount(0);
    } catch (e) {
      console.warn('Could not mark all notifications as read:', e?.message);
    }
  }, [token]);

  // Fetch pending reports count for administrators
  const refreshPendingReportsCount = useCallback(async () => {
    if (!token || userRef.current?.role !== 'admin') {
      setPendingReportsCount(0);
      return;
    }
    try {
      const res = await api.get('/admin/reports/stats');
      if (res.data && res.data.success && res.data.stats) {
        setPendingReportsCount(Number(res.data.stats.pendingReports) || 0);
      }
    } catch (e) {
      console.warn('Could not refresh admin reports count:', e?.message);
    }
  }, [token]);

  // Mark a conversation as read and sync unread count
  const markConversationAsRead = useCallback(async (conversationId) => {
    if (!conversationId || !token) return;
    try {
      const convStr = String(conversationId);
      const res = await api.post(`/chat/conversations/${convStr}/read`);
      if (res.data && res.data.success) {
        setUnreadCount(Number(res.data.unreadCount) || 0);
        setUnreadByConv((prev) => {
          const next = { ...prev };
          delete next[convStr];
          return next;
        });
      }
    } catch (e) {
      const convStr = String(conversationId);
      setUnreadByConv((prev) => {
        const count = prev[convStr] || 0;
        const next = { ...prev };
        delete next[convStr];
        setUnreadCount((c) => Math.max(0, c - count));
        return next;
      });
    }
  }, [token]);

  // Request browser desktop push notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setDesktopPermission(perm);
        return perm;
      } catch (e) {
        console.warn('Could not request notification permission:', e);
      }
    }
    return 'denied';
  }, []);

  // Dismiss a specific toast notification
  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Clear all toast notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper to trigger interactive in-app toast + chime + desktop notification
  const handleIncomingNotification = useCallback((data) => {
    if (!data || !data.message) return;

    const { message, conversationId } = data;
    const currentUserId = userRef.current?._id ? String(userRef.current._id) : '';
    const senderId = message.sender?._id ? String(message.sender._id) : String(message.sender || '');

    // Never notify the user of their own messages
    if (currentUserId && senderId === currentUserId) {
      return;
    }

    const convId = String(conversationId || message.conversation || '');
    const activeId = activeConversationIdRef.current ? String(activeConversationIdRef.current) : null;
    const isCurrentlyInConversation = activeId && activeId === convId;

    const isVoice = message.messageType === 'voice' || Boolean(message.voiceUrl);
    const duration = message.voiceDuration || 0;
    const senderName = message.sender?.name || 'SkillSwap Member';
    const senderAvatar = message.sender?.avatar || '';

    const hasAttachments = Array.isArray(message.attachments) && message.attachments.length > 0;
    const isFile = message.messageType === 'file' || hasAttachments;
    const firstAtt = hasAttachments ? message.attachments[0] : null;
    const isImage = Boolean(firstAtt?.fileType?.startsWith('image/'));

    let textContent = message.content;
    if (isVoice) {
      textContent = `🎤 Voice Message (${Math.round(duration)}s)`;
    } else if (hasAttachments) {
      const attName = firstAtt?.name || 'Document';
      const fileTag = isImage ? `🖼️ Photo: ${attName}` : `📎 Document: ${attName}`;
      textContent = message.content ? `${message.content} • ${fileTag}` : fileTag;
    } else if (!textContent) {
      textContent = 'Sent a new message';
    }

    const notificationId = `notif_${message._id || Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Play audio chime on EVERY new incoming message
    playNotificationSound();

    // 2. Increment unread counter if not currently viewing this conversation
    if (!isCurrentlyInConversation) {
      setUnreadCount((prev) => prev + 1);
      if (convId) {
        setUnreadByConv((prev) => ({
          ...prev,
          [convId]: (prev[convId] || 0) + 1
        }));
      }
    }

    // 3. Add to In-App Toast Queue (always show toast if in another tab, page, or another conversation)
    // Even if in the same conversation, show toast if the page is currently hidden/unfocused
    const isTabHidden = typeof document !== 'undefined' && document.hidden;
    if (!isCurrentlyInConversation || isTabHidden) {
      const newNotif = {
        id: notificationId,
        conversationId: convId,
        senderName,
        senderAvatar,
        content: textContent,
        isVoice,
        isFile,
        isImage,
        fileName: firstAtt?.name,
        duration,
        createdAt: message.createdAt || new Date().toISOString()
      };

      setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== notificationId)].slice(0, 4));

      // Auto-dismiss this toast after 5.5 seconds
      setTimeout(() => {
        dismissNotification(notificationId);
      }, 5500);
    }

    // 4. Trigger Native Web Desktop Notification if allowed
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted' &&
      (!isCurrentlyInConversation || isTabHidden)
    ) {
      try {
        const desktopNotif = new Notification(`SkillSwap • ${senderName}`, {
          body: textContent,
          icon: senderAvatar || '/favicon.ico',
          tag: `skillswap_conv_${convId}`
        });

        desktopNotif.onclick = () => {
          window.focus();
          window.location.href = `/chat?conversationId=${convId}`;
        };
      } catch (err) {
        console.debug('Desktop notification error:', err);
      }
    }
  }, [dismissNotification]);

  useEffect(() => {
    setActiveConversationId(null);
    activeConversationIdRef.current = null;

    if (!token) {
      setUnreadCount(0);
      setUnreadByConv({});
      if (socket) {
        socket.disconnect();
      }
      setSocket(null);
      return;
    }

    // Load initial unread messages count and user notifications from DB
    refreshUnreadCount();
    refreshUserNotifications();

    // Connect directly to configured backend URL, localhost:5000 in dev, or origin in production
    const backendEnvUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : '';
    const socketUrl = backendEnvUrl || (window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : window.location.origin);

    const socketInstance = io(socketUrl, {
      auth: { token },
      query: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      // Explicitly register user ID room on connect
      if (user?._id) {
        socketInstance.emit('identify', user._id);
        if (user.role === 'admin') {
          socketInstance.emit('join_admin_room');
          refreshPendingReportsCount();
        }
      }
      // Re-fetch counts upon socket reconnection
      refreshUnreadCount();
      refreshUserNotifications();
    });

    socketInstance.on('online_users_update', (usersList) => {
      setOnlineUsers(new Set(usersList));
    });

    // Every incoming new message notification triggers handler properly
    socketInstance.on('new_message_notification', (data) => {
      handleIncomingNotification(data);
    });

    // Real-Time Notification to User (e.g. Report Under Review, Admin Feedback)
    socketInstance.on('new_user_notification', (data) => {
      if (!data) return;
      playNotificationSound();

      // Add to persistent user notifications list
      setUserNotifications((prev) => [data, ...prev.filter(n => n._id !== data._id)]);
      setUnreadNotificationCount((prev) => prev + 1);

      // Add to toast queue for immediate animated screen alert
      const toastId = `usr_notif_${data._id || Date.now()}`;
      const newToast = {
        id: toastId,
        type: 'user_notification',
        notificationType: data.type || 'report_under_review',
        title: data.title || 'Report Under Review',
        content: data.message,
        reportId: data.reportId,
        createdAt: data.createdAt || new Date().toISOString()
      };

      setNotifications((prev) => [newToast, ...prev.filter((n) => n.id !== toastId)].slice(0, 4));

      setTimeout(() => {
        dismissNotification(toastId);
      }, 7500);

      // Native desktop notification if enabled
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('SkillSwap Pakistan • Moderation Update', {
            body: data.message,
            icon: '/favicon.ico'
          });
        } catch (e) {}
      }
    });

    socketInstance.on('report_status_update', () => {
      refreshUserNotifications();
    });

    // Admin Real-Time Report Alert
    socketInstance.on('new_report_notification', (data) => {
      if (userRef.current?.role === 'admin') {
        setPendingReportsCount((prev) => prev + 1);
        playNotificationSound();

        const notifId = `rep_${data.reportId || Date.now()}`;
        const newNotif = {
          id: notifId,
          type: 'admin_report',
          reportId: data.reportId,
          category: data.category,
          priority: data.priority,
          reportedName: data.reportedName,
          reporterName: data.reporterName,
          content: `New Report: ${data.category} against ${data.reportedName} (${data.priority} priority)`,
          createdAt: new Date().toISOString()
        };

        setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== notifId)].slice(0, 4));

        setTimeout(() => {
          dismissNotification(notifId);
        }, 7000);

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`🚨 SkillSwap Admin Alert: ${data.category}`, {
              body: `Report #${data.reportId} submitted by ${data.reporterName}`,
              icon: '/favicon.ico'
            });
          } catch (e) {}
        }
      }
    });

    socketInstance.on('report_updated', () => {
      if (userRef.current?.role === 'admin') {
        refreshPendingReportsCount();
      }
    });

    socketInstance.on('account_suspended_alert', (data) => {
      alert(`⚠️ Your account has been suspended by administration. Reason: ${data.reason || 'Violation of community policies.'}`);
      window.location.href = '/login';
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.off('new_message_notification');
      socketInstance.off('online_users_update');
      socketInstance.off('new_report_notification');
      socketInstance.off('report_updated');
      socketInstance.off('new_user_notification');
      socketInstance.off('report_status_update');
      socketInstance.off('account_suspended_alert');
      socketInstance.disconnect();
    };
  }, [token, handleIncomingNotification, refreshUnreadCount, refreshUserNotifications, refreshPendingReportsCount]);

  const joinConversation = (conversationId) => {
    if (conversationId) {
      const convStr = String(conversationId);
      setActiveConversationId(convStr);
      activeConversationIdRef.current = convStr;
      markConversationAsRead(convStr);
      if (socket) {
        socket.emit('join_conversation', convStr);
      }
    }
  };

  const leaveConversation = (conversationId) => {
    if (conversationId) {
      const convStr = String(conversationId);
      if (activeConversationIdRef.current === convStr) {
        setActiveConversationId(null);
        activeConversationIdRef.current = null;
      }
      if (socket) {
        socket.emit('leave_conversation', convStr);
      }
    }
  };

  const clearUnread = () => {
    setUnreadCount(0);
    setUnreadByConv({});
  };

  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUsers.has(String(userId));
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        unreadCount,
        setUnreadCount,
        unreadByConv,
        refreshUnreadCount,
        markConversationAsRead,
        clearUnread,
        joinConversation,
        leaveConversation,
        isUserOnline,
        activeConversationId,
        notifications,
        dismissNotification,
        clearNotifications,
        userNotifications,
        unreadNotificationCount,
        refreshUserNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        pendingReportsCount,
        refreshPendingReportsCount,
        desktopPermission,
        requestNotificationPermission
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
