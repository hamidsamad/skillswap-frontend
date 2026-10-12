import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Send,
  MessageSquare,
  Search,
  MapPin,
  Laptop,
  CheckCircle2,
  FileCheck,
  Paperclip,
  Smile,
  ArrowRightLeft,
  Sparkles,
  Star,
  Plus,
  Users,
  X,
  Loader2,
  ArrowLeft,
  Flag
} from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import UserProfileModal from '../components/UserProfileModal';
import ReportModal from '../components/ReportModal';
import VoiceMessagePlayer from '../components/VoiceMessagePlayer';
import VoiceRecorderBar from '../components/VoiceRecorderBar';
import ChatMessageAttachments, { formatFileSize, getFileInfo } from '../components/ChatMessageAttachments';

export default function LiveChatPage() {
  const { user } = useAuth();
  const {
    socket,
    isUserOnline,
    joinConversation,
    leaveConversation,
    unreadCount,
    markConversationAsRead
  } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(searchParams.get('conversationId') || null);
  const [messages, setMessages] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportedMessageContent, setReportedMessageContent] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [learnersList, setLearnersList] = useState([]);
  const [loadingLearners, setLoadingLearners] = useState(false);
  const [inputText, setInputText] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [hasNewUnseenMessage, setHasNewUnseenMessage] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check if message container is scrolled near bottom (within 120px threshold)
  const checkIfNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const threshold = 120;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom <= threshold;
  };

  // Track user manual scrolling to respect reading history
  const handleMessagesScroll = () => {
    const near = checkIfNearBottom();
    isNearBottomRef.current = near;
    if (near) {
      setHasNewUnseenMessage(false);
    }
  };

  // Safe container-scoped scrolling that NEVER touches the browser window scroll
  const scrollToBottom = (smooth = true) => {
    const container = messagesContainerRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      try {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        });
      } catch (_) {
        container.scrollTop = container.scrollHeight;
      }
    });
  };

  const startChatWithLearner = async (learnerUserId) => {
    try {
      const res = await api.post('/chat/find-or-create', { recipientId: learnerUserId });
      if (res.data.success && res.data.conversation?._id) {
        setShowNewChatModal(false);
        await fetchConversations();
        setActiveConvId(res.data.conversation._id);
        navigate(`/chat?conversationId=${res.data.conversation._id}`);
      }
    } catch (e) {
      console.error('Failed to create chat:', e);
    }
  };

  useEffect(() => {
    if (showNewChatModal && learnersList.length === 0) {
      setLoadingLearners(true);
      api.get('/matches')
        .then(res => {
          if (res.data.success && res.data.matches) {
            const list = res.data.matches
              .map(m => m.user)
              .filter(u => u && String(u._id) !== String(user?._id));
            setLearnersList(list);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingLearners(false));
    }
  }, [showNewChatModal]);

  // Fetch only this user's conversations
  const fetchConversations = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await api.get('/chat/conversations');
      if (res.data.success) {
        // Strictly filter to ensure current logged-in user is an active participant
        const myConversations = (res.data.conversations || []).filter(c =>
          (c.participants || []).some(p => String(p?._id || p) === String(user._id))
        );
        setConversations(myConversations);

        // Verify if activeConvId or query param conversation belongs to THIS user
        const targetConvId = searchParams.get('conversationId') || activeConvId;
        const matchingConv = myConversations.find(c => String(c._id) === String(targetConvId));

        if (matchingConv) {
          setActiveConvId(matchingConv._id);
        } else if (myConversations.length > 0) {
          setActiveConvId(myConversations[0]._id);
        } else {
          setActiveConvId(null);
          setMessages([]);
          setSearchParams({});
        }
      }
    } catch (e) {
      console.error('Error fetching conversations:', e);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch conversations when user changes (e.g. logging into a different account)
  useEffect(() => {
    setActiveConvId(null);
    setMessages([]);
    fetchConversations();
  }, [user?._id]);

  // Fetch messages for active conversation
  const fetchMessages = async (convId) => {
    if (!convId || !user?._id) return;
    try {
      const res = await api.get(`/chat/conversations/${convId}/messages`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
        // Mark conversation read in backend and update unread counts
        markConversationAsRead(convId);
        setConversations(prev =>
          prev.map(c => String(c._id) === String(convId) ? { ...c, unreadCount: 0 } : c)
        );
        setHasNewUnseenMessage(false);
        // Instant scroll to bottom when opening a conversation
        scrollToBottom(false);
      }
    } catch (e) {
      console.error('Error fetching messages:', e);
      // If access denied (conversation belonged to someone else), clear active conversation
      if (e.response?.status === 403 || e.response?.status === 404) {
        setActiveConvId(null);
        setMessages([]);
        setSearchParams({});
      }
    }
  };

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      joinConversation(activeConvId);
      setSearchParams({ conversationId: activeConvId });
      setHasNewUnseenMessage(false);

      return () => {
        leaveConversation(activeConvId);
      };
    }
  }, [activeConvId]);

  // Scroll smoothly when typing starts only if user is already near bottom
  useEffect(() => {
    if (typingUser && checkIfNearBottom()) {
      scrollToBottom(true);
    }
  }, [typingUser]);

  // Socket event listeners for real-time messages & typing
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMsg) => {
      const msgConvId = String(newMsg.conversation);
      const isCurrentActive = String(activeConvId) === msgConvId;

      // Only process message if it belongs to one of THIS user's conversations
      setConversations(prev => {
        const belongsToUser = prev.some(c => String(c._id) === msgConvId);
        if (!belongsToUser) return prev;

        return prev.map(c => {
          if (String(c._id) === msgConvId) {
            return {
              ...c,
              lastMessage: newMsg,
              lastMessageAt: newMsg.createdAt,
              unreadCount: isCurrentActive ? 0 : ((c.unreadCount || 0) + 1)
            };
          }
          return c;
        });
      });

      if (isCurrentActive) {
        const wasNear = checkIfNearBottom();
        setMessages(prev => {
          if (prev.some(m => String(m._id) === String(newMsg._id))) return prev;
          return [...prev, newMsg];
        });
        markConversationAsRead(msgConvId);
        // Only auto-scroll down if user is already reading latest messages
        if (wasNear) {
          scrollToBottom(true);
        } else {
          setHasNewUnseenMessage(true);
        }
      }
    };

    const handleTypingStart = (data) => {
      if (String(data.conversationId) === String(activeConvId)) {
        setTypingUser(data.userName);
      }
    };

    const handleTypingStop = (data) => {
      if (String(data.conversationId) === String(activeConvId)) {
        setTypingUser(null);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing_start', handleTypingStart);
    socket.on('user_typing_stop', handleTypingStop);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing_start', handleTypingStart);
      socket.off('user_typing_stop', handleTypingStop);
    };
  }, [socket, activeConvId]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (socket && activeConvId) {
      socket.emit('typing_start', {
        conversationId: activeConvId,
        userName: user?.name
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { conversationId: activeConvId });
      }, 1500);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAttachments = files.map(file => {
      const isImage = file.type.startsWith('image/');
      return {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: isImage ? URL.createObjectURL(file) : null
      };
    });

    setAttachedFiles(prev => [...prev, ...newAttachments]);
    if (e.target) e.target.value = '';
  };

  const handleRemoveAttachment = (index) => {
    setAttachedFiles(prev => {
      const item = prev[index];
      if (item?.previewUrl) {
        try { URL.revokeObjectURL(item.previewUrl); } catch (_) {}
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const newAttachments = files.map(file => {
        const isImage = file.type.startsWith('image/');
        return {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          previewUrl: isImage ? URL.createObjectURL(file) : null
        };
      });
      setAttachedFiles(prev => [...prev, ...newAttachments]);
    }
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && attachedFiles.length === 0) || !activeConvId) return;

    const content = inputText.trim();
    const currentAttachments = [...attachedFiles];
    setInputText('');
    setAttachedFiles([]);
    setSending(true);

    if (socket) {
      socket.emit('typing_stop', { conversationId: activeConvId });
    }

    // Immediately scroll container down to view newly sent content
    scrollToBottom(true);
    setHasNewUnseenMessage(false);
    inputRef.current?.focus({ preventScroll: true });

    try {
      let uploadedAttachments = [];

      // 1. Upload files to backend/Cloudinary if present
      if (currentAttachments.length > 0) {
        setUploadProgressText(`Uploading ${currentAttachments.length} document(s)...`);
        for (let i = 0; i < currentAttachments.length; i++) {
          const item = currentAttachments[i];
          setUploadProgressText(`Uploading ${item.name} (${i + 1}/${currentAttachments.length})...`);
          const base64Data = await readFileAsBase64(item.file);
          const uploadRes = await api.post('/chat/upload-file', {
            fileData: base64Data,
            fileName: item.name,
            fileType: item.type,
            fileSize: item.size
          });

          if (uploadRes.data && uploadRes.data.success && uploadRes.data.file) {
            uploadedAttachments.push(uploadRes.data.file);
          }
        }
      }

      setUploadProgressText('');

      // 2. Post message with attachments
      const res = await api.post(`/chat/conversations/${activeConvId}/messages`, {
        content,
        attachments: uploadedAttachments,
        messageType: uploadedAttachments.length > 0 ? 'file' : 'text'
      });

      if (res.data.success) {
        setMessages(prev => {
          if (prev.some(m => String(m._id) === String(res.data.message._id))) return prev;
          return [...prev, res.data.message];
        });
        scrollToBottom(true);
        inputRef.current?.focus({ preventScroll: true });
      }
    } catch (e) {
      console.error('Failed to send message:', e);
      // Restore attachments and text if send failed
      setAttachedFiles(currentAttachments);
      setInputText(content);
    } finally {
      setSending(false);
      setUploadProgressText('');
    }
  };

  const handleSendVoiceMessage = async ({ audioDataUrl, duration }) => {
    if (!activeConvId) return;
    setSending(true);
    scrollToBottom(true);
    setHasNewUnseenMessage(false);

    try {
      // 1. Upload audio to storage endpoint (Cloudinary or backend storage)
      let voiceUrl = '';
      let voiceDuration = duration;

      try {
        const uploadRes = await api.post('/chat/upload-voice', {
          audio: audioDataUrl,
          duration
        });

        if (uploadRes.data?.success && uploadRes.data?.voiceUrl) {
          voiceUrl = uploadRes.data.voiceUrl;
          voiceDuration = uploadRes.data.voiceDuration || duration;
        }
      } catch (uploadErr) {
        console.warn('Voice upload endpoint warning, using client audio fallback:', uploadErr);
        // If upload endpoint is slow or fails, audioDataUrl ensures the voice note is not lost
        voiceUrl = audioDataUrl;
      }

      if (!voiceUrl) {
        voiceUrl = audioDataUrl;
      }

      // 2. Post voice message to conversation
      const res = await api.post(`/chat/conversations/${activeConvId}/messages`, {
        content: '🎤 Voice message',
        messageType: 'voice',
        voiceUrl,
        voiceDuration: voiceDuration || duration
      });

      if (res.data.success) {
        setMessages(prev => {
          if (prev.some(m => String(m._id) === String(res.data.message._id))) return prev;
          return [...prev, res.data.message];
        });
        scrollToBottom(true);

        // Update conversation last message in sidebar
        setConversations(prev =>
          prev.map(c => {
            if (String(c._id) === String(activeConvId)) {
              return {
                ...c,
                lastMessage: res.data.message,
                lastMessageAt: res.data.message.createdAt
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error('Error sending voice message:', err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  // Strictly ensure activeConv belongs to this user
  const activeConv = conversations.find(
    c => String(c._id) === String(activeConvId) &&
      (c.participants || []).some(p => String(p?._id || p) === String(user?._id))
  );

  const otherParticipant = activeConv?.participants?.find(
    p => String(p?._id || p) !== String(user?._id)
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-2 xs:px-3 sm:px-6 lg:px-8 py-2 sm:py-4 h-full flex flex-col min-h-0 flex-1">
      <div className="card-clean overflow-hidden flex-1 flex flex-col md:flex-row shadow-xl min-h-0">
        {/* Left Sidebar: Conversations List */}
        <div className={`w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-[#E5EAE7] dark:border-slate-800 flex flex-col bg-white dark:bg-[#0A0F1D] ${
          activeConvId ? 'hidden md:flex' : 'flex-1 md:flex-none flex'
        }`}>
          <div className="p-4 sm:p-5 border-b border-[#E5EAE7] dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#102B50] dark:text-white flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#EAF6EF] text-[#07866D]">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <span>Barter Messages</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#DC5555] text-white shadow-xs animate-pulse">
                    {unreadCount} unread
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-[#708096] mt-0.5 font-medium">
                1-on-1 peer exchange conversations
              </p>
            </div>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="btn-emerald !py-1.5 !px-3 !text-xs !rounded-xl"
              title="Start a new chat with a member"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#E5EAE7] dark:divide-slate-800/60 touch-scroll">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#708096] font-medium">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#708096] font-medium leading-relaxed space-y-3">
                <p>No active conversations yet.</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="btn-emerald !py-2 !px-4 !text-xs !rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start a Chat</span>
                </button>
              </div>
            ) : (
              conversations
                .filter(conv =>
                  (conv.participants || []).some(p => String(p?._id || p) === String(user?._id))
                )
                .map(conv => {
                  const partner = conv.participants?.find(
                    p => String(p?._id || p) !== String(user?._id)
                  );
                  if (!partner) return null;
                  const isSelected = String(conv._id) === String(activeConvId);
                  const online = isUserOnline(partner?._id);

                  return (
                    <button
                      key={conv._id}
                      onClick={() => setActiveConvId(conv._id)}
                      className={`w-full text-left p-3.5 sm:p-4 flex items-start gap-3 sm:gap-3.5 transition-all cursor-pointer min-h-[52px] ${
                        isSelected
                          ? 'bg-[#EAF6EF] dark:bg-slate-800/80 border-l-4 border-[#07866D]'
                          : 'hover:bg-[#FAF9F5] dark:hover:bg-slate-800/40 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <UserAvatar
                          user={partner}
                          size="lg"
                          className="ring-2 ring-[#07866D]/20"
                        />
                        {online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#16855F] rounded-full border-2 border-white dark:border-slate-900 shadow-xs" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-extrabold text-[#102B50] dark:text-white truncate">
                            {partner?.name || 'Learner'}
                          </h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {conv.unreadCount > 0 && !isSelected && (
                              <span className="min-w-[18px] h-[18px] px-1 bg-[#DC5555] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                                {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                              </span>
                            )}
                            <span className="text-[10px] text-[#708096] font-medium">
                              {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-[#708096] dark:text-slate-400 truncate mt-0.5 font-medium">
                          {conv.lastMessage?.messageType === 'voice' || conv.lastMessage?.voiceUrl
                            ? `🎤 Voice note (${Math.round(conv.lastMessage?.voiceDuration || 0)}s)`
                            : conv.lastMessage?.attachments && conv.lastMessage.attachments.length > 0
                            ? (conv.lastMessage.attachments[0]?.fileType?.startsWith('image/')
                                ? `🖼️ Photo: ${conv.lastMessage.attachments[0]?.name}`
                                : `📎 Document: ${conv.lastMessage.attachments[0]?.name}`)
                            : conv.lastMessage?.content || 'Started conversation'}
                        </p>
                        {conv.swapAgreement && (
                          <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-[#07866D] dark:text-emerald-400 bg-[#EAF6EF] dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-[#07866D]/20">
                            <FileCheck className="w-3 h-3" /> Agreement Linked
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* Right Chat Area */}
        <div
          className={`flex-1 flex flex-col bg-[#FAF9F5] dark:bg-[#070B16] relative min-w-0 ${
            !activeConvId ? 'hidden md:flex' : 'flex'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag & Drop Visual Overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-50 bg-[#EAF6EF]/70 dark:bg-emerald-950/50 backdrop-blur-xs border-2 border-dashed border-[#07866D] m-3 rounded-3xl flex flex-col items-center justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-150">
              <div className="w-16 h-16 rounded-3xl bg-[#07866D]/20 text-[#07866D] flex items-center justify-center mb-3 animate-bounce">
                <Paperclip className="w-8 h-8" />
              </div>
              <h4 className="text-base font-extrabold text-[#102B50] dark:text-white">
                Drop your documents or images here
              </h4>
              <p className="text-xs text-[#708096] dark:text-slate-400 mt-1">
                PDFs, assignments, images, and project files will be shared directly
              </p>
            </div>
          )}

          {activeConv ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-3 sm:p-4 border-b border-[#E5EAE7] dark:border-slate-800 bg-white dark:bg-[#0A0F1D] flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveConvId(null);
                      setSearchParams({});
                    }}
                    className="md:hidden p-2 -ml-1 text-[#24364B] dark:text-slate-300 hover:bg-[#EAF6EF] dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
                    title="Back to conversations list"
                    aria-label="Back to conversations list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative shrink-0">
                    <UserAvatar
                      user={otherParticipant}
                      size="md"
                      className="ring-2 ring-[#07866D]/20"
                    />
                    {isUserOnline(otherParticipant?._id) && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#16855F] rounded-full border-2 border-white dark:border-slate-900" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-xs sm:text-sm text-[#102B50] dark:text-white flex items-center gap-1.5 truncate">
                      <span className="truncate">{otherParticipant?.name}</span>
                      {isUserOnline(otherParticipant?._id) ? (
                        <span className="text-[10px] font-bold text-[#16855F] dark:text-emerald-400 flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16855F] animate-pulse" />
                          <span className="hidden xs:inline">Online</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#708096] font-medium shrink-0">Offline</span>
                      )}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#708096] dark:text-slate-400 truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs">
                      {otherParticipant?.headline || 'SkillSwap Member'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="btn-white !py-1.5 !px-2 sm:!px-3 !text-xs !rounded-xl"
                    title="View partner profile and submit rating"
                  >
                    <Star className="w-3.5 h-3.5 text-[#E7A62C]" />
                    <span className="hidden sm:inline">Rate / Profile</span>
                    <span className="sm:hidden text-[11px]">Rate</span>
                  </button>

                  <button
                    onClick={() => {
                      setReportedMessageContent(null);
                      setShowReportModal(true);
                    }}
                    className="btn-white !py-1.5 !px-2 sm:!px-3 !text-xs !rounded-xl text-slate-500 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-900 transition-colors"
                    title="Report partner for inappropriate messages or misconduct"
                  >
                    <Flag className="w-3.5 h-3.5 text-rose-500" />
                    <span className="hidden sm:inline">Report</span>
                    <span className="sm:hidden text-[11px]">Report</span>
                  </button>

                  {/* Agreement Actions (Spec 9-B) */}
                  {activeConv.swapAgreement ? (
                    <button
                      onClick={() => navigate('/swaps')}
                      className="btn-emerald !py-1.5 !px-2 sm:!px-3 !text-xs !rounded-xl"
                      title="View Agreement"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View Agreement</span>
                      <span className="sm:hidden text-[11px]">Agreement</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/swaps')}
                      className="btn-outline-emerald !py-1.5 !px-2 sm:!px-3 !text-xs !rounded-xl"
                      title="Create Agreement"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Create Agreement</span>
                      <span className="sm:hidden text-[11px]">Swap</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Feed */}
              <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className="flex-1 min-h-0 p-3 xs:p-4 md:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 touch-scroll overscroll-contain relative"
              >
                {messages.length === 0 ? (
                  <div className="py-24 text-center">
                    <span className="text-4xl block mb-2">💬</span>
                    <p className="text-xs text-[#708096] font-medium max-w-xs mx-auto">
                      No messages yet. Say salam and introduce your learning goals!
                    </p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = String(msg.sender?._id || msg.sender) === String(user?._id);
                    const isVoice = msg.messageType === 'voice' || Boolean(msg.voiceUrl);

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[88%] xs:max-w-[82%] sm:max-w-md md:max-w-lg p-3 xs:p-3.5 rounded-2xl text-xs sm:text-sm shadow-xs break-words overflow-hidden group relative ${
                            isMe
                              ? 'bg-[#102B50] text-white rounded-br-xs'
                              : 'bg-[#EAF6EF] dark:bg-[#121A2E] border border-[#07866D]/20 text-[#24364B] dark:text-white rounded-bl-xs'
                          }`}
                        >
                          {/* Flag option for partner's message */}
                          {!isMe && (
                            <button
                              type="button"
                              onClick={() => {
                                setReportedMessageContent(msg.content || (msg.voiceUrl ? 'Voice Message' : 'Attached File'));
                                setShowReportModal(true);
                              }}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-500 hover:bg-black/5 dark:hover:bg-white/10 rounded-md"
                              title="Report this specific message"
                            >
                              <Flag className="w-3 h-3" />
                            </button>
                          )}
                          {isVoice ? (
                            <VoiceMessagePlayer
                              voiceUrl={msg.voiceUrl}
                              duration={msg.voiceDuration}
                              isMe={isMe}
                              createdAt={msg.createdAt}
                            />
                          ) : (
                            <>
                              {/* Document & Image Attachments */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <ChatMessageAttachments
                                  attachments={msg.attachments}
                                  isMe={isMe}
                                />
                              )}

                              {/* Message Text Caption */}
                              {msg.content && (!msg.attachments || msg.attachments.length === 0 || (!msg.content.startsWith('📎') && !msg.content.startsWith('🖼️'))) && (
                                <p className={`whitespace-pre-wrap leading-relaxed font-medium break-words overflow-hidden ${msg.attachments && msg.attachments.length > 0 ? 'mt-2' : ''}`}>
                                  {msg.content}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        <span className="text-[10px] text-[#708096] mt-1 px-1 font-medium">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}

                {/* Typing Indicator */}
                {typingUser && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]" />
                    </span>
                    <span>{typingUser} is typing...</span>
                  </div>
                )}

                {/* Floating "New Message" badge if user has scrolled up to read earlier history */}
                {hasNewUnseenMessage && (
                  <div className="sticky bottom-2 flex justify-center z-20 pointer-events-none">
                    <button
                      type="button"
                      onClick={() => {
                        scrollToBottom(true);
                        setHasNewUnseenMessage(false);
                      }}
                      className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-[#07866D] hover:bg-[#086B57] text-white text-xs font-bold shadow-lg flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-2"
                      title="Scroll to latest message"
                    >
                      <span>↓ New message</span>
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input & Voice Bar */}
              <div className="p-3 md:p-4 bg-white/95 dark:bg-[#0D1424]/95 border-t border-slate-200/80 dark:border-slate-800/80 shrink-0">
                <VoiceRecorderBar
                  onSendVoice={handleSendVoiceMessage}
                  disabled={sending}
                  renderTextInput={(micButton) => (
                    <div className="space-y-2">
                      {/* Attached Files Preview Strip */}
                      {attachedFiles.length > 0 && (
                        <div className="p-2.5 rounded-2xl bg-slate-100/90 dark:bg-[#12192C]/90 border border-slate-200/90 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar touch-scroll animate-in slide-in-from-bottom-2 duration-200">
                          {attachedFiles.map((item, idx) => {
                            const info = getFileInfo(item.name, item.type);
                            const isImg = info.type === 'image';
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-xl bg-white dark:bg-[#1A233A] border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 max-w-[200px] sm:max-w-[240px]"
                              >
                                {isImg && item.previewUrl ? (
                                  <img
                                    src={item.previewUrl}
                                    alt={item.name}
                                    className="w-7 h-7 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${info.color} text-white flex items-center justify-center text-[8px] font-black shrink-0`}>
                                    {info.badge}
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                                    {item.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {formatFileSize(item.size)}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAttachment(idx)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Remove attachment"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Upload Progress Indicator */}
                      {uploadProgressText && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold animate-pulse">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{uploadProgressText}</span>
                        </div>
                      )}

                      {/* Quick Chat Snippets */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar touch-scroll">
                        {[
                          '👋 Assalam-o-Alaikum',
                          '🤝 Interested in skill swap',
                          '📄 Sending assignment details',
                          '💡 Let\'s discuss details',
                          '🇵🇰 Shandar!'
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setInputText(preset)}
                            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF9F5] hover:bg-[#EAF6EF] dark:bg-slate-900 text-[#24364B] hover:text-[#07866D] dark:text-slate-300 border border-[#E5EAE7] dark:border-slate-800 transition-all shrink-0 cursor-pointer active:scale-95"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar,.csv,.xlsx,.xls,image/*"
                        className="hidden"
                      />

                      {/* Main Text Input & Actions Form */}
                      <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-1.5 sm:gap-2"
                      >
                        {/* Paperclip Document/File Attachment Button */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={sending}
                          className="p-2.5 sm:p-3 min-w-[42px] min-h-[42px] rounded-2xl border border-[#E5EAE7] dark:border-slate-800 hover:border-[#07866D]/50 bg-white dark:bg-slate-900 text-[#24364B] dark:text-slate-300 hover:text-[#07866D] dark:hover:text-emerald-400 hover:bg-[#EAF6EF] transition-all cursor-pointer active:scale-95 shrink-0 flex items-center justify-center shadow-xs"
                          title="Share document, PDF, assignment, or image"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>

                        <div className="flex-1 relative flex items-center min-w-0">
                          <input
                            ref={inputRef}
                            type="text"
                            value={inputText}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                              }
                            }}
                            placeholder={
                              attachedFiles.length > 0
                                ? `Add note or caption...`
                                : `Type message to ${otherParticipant?.name?.split(' ')[0] || 'partner'}...`
                            }
                            className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border border-[#E5EAE7] dark:border-slate-800 focus:border-[#07866D] focus:ring-2 focus:ring-[#07866D]/20 rounded-2xl text-xs sm:text-sm text-[#24364B] dark:text-white outline-none transition-all font-medium placeholder:text-[#708096]"
                          />

                          {inputText && (
                            <button
                              type="button"
                              onClick={() => setInputText('')}
                              className="absolute right-2.5 sm:right-3 p-1 rounded-full text-[#708096] hover:text-[#24364B] dark:hover:text-slate-200 transition-colors cursor-pointer"
                              title="Clear text"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Microphone Voice Button */}
                        {micButton}

                        {/* Send Button */}
                        <button
                          type="submit"
                          disabled={(!inputText.trim() && attachedFiles.length === 0) || sending}
                          className={`px-3.5 sm:px-5 py-2.5 sm:py-3 min-w-[42px] min-h-[42px] rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0 ${
                            (inputText.trim() || attachedFiles.length > 0) && !sending
                              ? 'btn-emerald !py-2.5 sm:!py-3 !px-3.5 sm:!px-5 !rounded-2xl'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed font-medium'
                          }`}
                          title="Send message or shared files (Enter)"
                        >
                          {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline text-xs font-bold">
                            {sending ? 'Sending...' : 'Send'}
                          </span>
                        </button>
                      </form>
                    </div>
                  )}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 mb-4 border border-slate-200 dark:border-slate-700/60 shadow-inner">
                <MessageSquare className="w-8 h-8 text-sky-500" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                Select or Start a Conversation
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed mb-4">
                Chat in real-time, send text messages, or record voice memos with verified Pakistani skill partners.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-black text-xs shadow-lg shadow-sky-600/25 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Live Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Start New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Start a Live Chat</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Select a community member to message</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/60">
              {loadingLearners ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                  <span>Loading members...</span>
                </div>
              ) : learnersList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  No other members found.
                </div>
              ) : (
                learnersList.map((learner) => (
                  <div
                    key={learner._id}
                    className="pt-2.5 first:pt-0 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar user={learner} size="md" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {learner.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          {learner.headline || 'SkillSwap Member'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => startChatWithLearner(learner._id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Chat</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userId={otherParticipant?._id}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setReportedMessageContent(null);
        }}
        targetUser={otherParticipant}
        contentType={reportedMessageContent ? 'message' : 'user'}
        contentSnapshot={reportedMessageContent}
      />
    </div>
  );
}
