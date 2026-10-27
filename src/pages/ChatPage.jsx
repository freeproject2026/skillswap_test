import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Calendar, Clock, Coins, Sparkles, Check, X, Video, AlertCircle, RefreshCw } from 'lucide-react';
import { chatService } from '../services/chatService';
import { userService } from '../services/userService';
import { sessionService } from '../services/sessionService';
import { useApp } from '../context/AppContext';
import { AuthGate } from '../components/auth/AuthGate';
import { AuthModal } from '../components/auth/AuthModal';
import { resolveMediaUrl } from '../services/api';

// Polling interval in ms — 3 seconds for near-real-time
const POLL_INTERVAL = 3000;

export const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isGuest, setAuthModalOpen, showToast } = useApp();
  const [user, setUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [showPropose, setShowPropose] = useState(false);
  const [proposeSkill, setProposeSkill] = useState('');
  const [proposeDuration, setProposeDuration] = useState(20);
  const [proposeTokens, setProposeTokens] = useState(60);
  const messagesEnd = useRef(null);
  const pollIntervalRef = useRef(null);
  const lastMessageAtRef = useRef(null);
  const conversationIdRef = useRef(null);

  const myId = currentUser?.id || currentUser?._id;

  // Merge new messages, avoiding duplicates by msg.id
  const mergeMessages = useCallback((existing, incoming) => {
    if (!incoming || incoming.length === 0) return existing;
    const existingIds = new Set(existing.map(m => m.id));
    const newOnes = incoming.filter(m => !existingIds.has(m.id));
    if (newOnes.length === 0) return existing;
    return [...existing, ...newOnes].sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return ta - tb;
    });
  }, []);

  useEffect(() => {
    if (isGuest || !currentUser) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        let activeUserId = userId;
        if (!activeUserId) {
          try {
            const convs = await chatService.getConversations();
            if (convs && convs.length > 0) {
              const firstPartnerId = convs[0].participant?.id || convs[0].participantId;
              if (firstPartnerId) {
                navigate(`/connect/chat/${firstPartnerId}`, { replace: true });
                return;
              }
            }
          } catch (_e) {}
          // Fallback to default peer if no conversation yet
          activeUserId = 'usr_1';
        }

        const [u, conv] = await Promise.all([
          userService.getUserById(activeUserId),
          chatService.getConversationByUserId(activeUserId)
        ]);
        setUser(u);
        setConversation(conv);
        const sortedMsgs = (conv?.messages || []).slice().sort((a, b) => {
          const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return ta - tb;
        });
        setMessages(sortedMsgs);
        conversationIdRef.current = conv?.id || conv?._id;
        // Track the latest message timestamp for incremental polling
        if (sortedMsgs.length > 0) {
          lastMessageAtRef.current = sortedMsgs[sortedMsgs.length - 1].timestamp;
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [userId, isGuest, currentUser, navigate]);

  // Start polling for real-time automatic message updates
  useEffect(() => {
    const convId = conversation?.id || conversation?._id || conversationIdRef.current;
    if (!convId || isGuest || !currentUser) return;

    const poll = async () => {
      try {
        const since = lastMessageAtRef.current;
        const { messages: newMsgs, lastMessageAt } = await chatService.pollMessages(
          convId,
          since
        );
        if (newMsgs && newMsgs.length > 0) {
          setMessages(prev => mergeMessages(prev, newMsgs));
          lastMessageAtRef.current = lastMessageAt || newMsgs[newMsgs.length - 1]?.timestamp;
        }
      } catch (_e) {
        // Silently ignore polling errors
      }
    };

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(poll, 2500);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [conversation?.id, conversation?._id, isGuest, currentUser, mergeMessages]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !conversation || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const convId = conversation.id || conversation._id;
      const msg = await chatService.sendMessage(convId, { senderId: myId, text: trimmed, type: 'text' });
      setMessages(prev => mergeMessages(prev, [msg]));
      lastMessageAtRef.current = msg.timestamp;
      setText('');
    } catch (err) {
      console.error(err);
      setSendError(err.message || 'Failed to send message. Try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePropose = async () => {
    if (!proposeSkill.trim() || !conversation) return;
    try {
      const booked = await sessionService.bookSession({
        tutorId: userId,
        tutorName: user.name,
        tutorAvatar: user.avatar || '',
        tutorCollege: user.college || '',
        skill: proposeSkill.trim(),
        scheduledDate: 'Upcoming Weekend',
        scheduledTime: '6:00 PM',
        durationMinutes: proposeDuration,
        creditCost: proposeTokens,
        format: 'Live Online Session',
        learningObjective: `Peer learning and practice for ${proposeSkill.trim()}`
      });

      const sessionData = {
        id: booked.id || booked._id,
        skill: proposeSkill,
        status: 'Pending',
        type: 'TUTORING',
        scheduledFor: 'Upcoming Weekend, 6:00 PM',
        durationMinutes: proposeDuration,
        tokenCost: proposeTokens
      };

      const convId = conversation.id || conversation._id;
      const msg = await chatService.sendMessage(convId, {
        senderId: myId,
        text: `Proposed a ${proposeDuration}-minute session on ${proposeSkill}.`,
        type: 'session_proposal',
        sessionData
      });
      setMessages(prev => mergeMessages(prev, [msg]));
      setShowPropose(false);
      setProposeSkill('');
      showToast('Session booking request sent!');
    } catch (err) {
      console.error('Propose session error:', err);
      showToast(err.message || 'Failed to send session proposal', 'error');
    }
  };

  if (isGuest || !currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AuthGate
          title="Direct Student Messaging"
          description="Sign in or register to send messages, propose collaborative study sessions, and coordinate learning exchanges with campus peers."
          actionText="Sign In to Chat"
          onAction={() => setAuthModalOpen(true)}
        />
        <AuthModal />
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div></div>;
  }

  if (!user) {
    return <div className="text-center py-20"><p className="text-slate-500 dark:text-slate-400">User not found</p></div>;
  }

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString();
    } catch (_e) {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-4rem)] max-w-3xl mx-auto">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-3 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/95 shrink-0 transition-colors">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <img
          src={resolveMediaUrl(user.avatar)}
          alt={user.name}
          className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-500/30 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            {user.status === 'online' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
            {user.status === 'online' ? 'Online now' : user.college || 'Student'}
          </p>
        </div>
        {user.tokensRate && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/50 shrink-0">
            <Coins className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">{user.tokensRate} tk/20m</span>
          </div>
        )}
      </div>

      {/* Active Session Card */}
      {conversation?.activeSession && (
        <div className="mx-3 sm:mx-6 mt-3 p-3 rounded-xl border border-teal-100 dark:border-teal-800/60 bg-teal-50/50 dark:bg-teal-950/40 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <p className="text-xs font-bold text-teal-800 dark:text-teal-200">{conversation.activeSession.skill}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${conversation.activeSession.status === 'Accepted' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : conversation.activeSession.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {conversation.activeSession.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-teal-700 dark:text-teal-300">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{conversation.activeSession.scheduledFor}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{conversation.activeSession.durationMinutes} min</span>
            <span className="flex items-center gap-1"><Coins className="w-3 h-3" />{conversation.activeSession.tokenCost === 0 ? 'Free Swap' : `${conversation.activeSession.tokenCost} tokens`}</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500">
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1">Start a conversation with {user.name}</p>
          </div>
        )}

        {messages.map(msg => {
          const isMe = msg.senderId === myId;
          const isSystem = msg.senderId === 'system' || msg.type === 'system';
          const isProposal = msg.type === 'session_proposal';

          // Determine display name: use embedded senderName if available, else fallback
          const displayName = msg.senderName || (isMe ? (currentUser?.name || 'You') : user.name);
          const displayAvatar = msg.senderAvatar || (isMe ? currentUser?.avatar : user.avatar);

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <p className="text-[11px] text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{msg.text}</p>
              </div>
            );
          }

          if (isProposal && msg.sessionData) {
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}>
                {/* Avatar for received messages */}
                {!isMe && (
                  <img
                    src={resolveMediaUrl(displayAvatar)}
                    alt={displayName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-1 ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                )}
                <div className="max-w-[85%] sm:max-w-[70%]">
                  {/* Sender name label */}
                  <p className={`text-[10px] font-semibold mb-1 ${isMe ? 'text-right text-teal-600 dark:text-teal-400' : 'text-left text-slate-500 dark:text-slate-400'}`}>
                    {isMe ? 'You' : displayName}
                  </p>
                  <div className={`p-3 rounded-2xl border ${isMe ? 'bg-teal-600/10 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800' : 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/60'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Session Proposal</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${msg.sessionData.status === 'Accepted' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : msg.sessionData.status === 'Declined' ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'}`}>
                        {msg.sessionData.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">{msg.sessionData.skill}</p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{msg.sessionData.durationMinutes} min</span>
                      <span className="flex items-center gap-1"><Coins className="w-3 h-3" />{msg.sessionData.tokenCost === 0 ? 'Free Swap' : `${msg.sessionData.tokenCost} tokens`}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">{formatTimestamp(msg.timestamp)}</p>

                    {!isMe && msg.sessionData.status === 'Pending' && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-purple-200/60 dark:border-purple-800/60">
                        <button
                          onClick={async () => {
                            try {
                              await sessionService.acceptSession(msg.sessionData.id);
                              msg.sessionData.status = 'Accepted';
                              showToast('Session request accepted!');
                              setMessages([...messages]);
                            } catch (err) {
                              showToast(err.message || 'Failed to accept session', 'error');
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
                        >
                          Accept
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await sessionService.rejectSession(msg.sessionData.id);
                              msg.sessionData.status = 'Declined';
                              showToast('Session request declined.');
                              setMessages([...messages]);
                            } catch (err) {
                              showToast(err.message || 'Failed to decline session', 'error');
                            }
                          }}
                          className="px-3 py-1 rounded-lg border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 text-[11px] font-bold hover:bg-rose-50"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* Avatar for sent messages */}
                {isMe && (
                  <img
                    src={resolveMediaUrl(displayAvatar)}
                    alt={displayName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-1 ring-1 ring-teal-300 dark:ring-teal-700"
                  />
                )}
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2 items-end`}>
              {/* Avatar for received messages */}
              {!isMe && (
                <img
                  src={resolveMediaUrl(displayAvatar)}
                  alt={displayName}
                  className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                />
              )}
              <div className={`max-w-[78%] sm:max-w-[65%]`}>
                {/* Sender name label */}
                <p className={`text-[10px] font-semibold mb-0.5 ${isMe ? 'text-right text-teal-600 dark:text-teal-400' : 'text-left text-slate-500 dark:text-slate-400'}`}>
                  {isMe ? 'You' : displayName}
                </p>
                <div className={`px-3.5 py-2.5 rounded-2xl ${isMe ? 'bg-teal-600 text-white rounded-br-md shadow-xs' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-md shadow-xs'}`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-teal-200' : 'text-slate-400 dark:text-slate-500'}`}>{formatTimestamp(msg.timestamp)}</p>
                </div>
              </div>
              {/* Avatar for sent messages */}
              {isMe && (
                <img
                  src={resolveMediaUrl(displayAvatar)}
                  alt={displayName}
                  className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-teal-300 dark:ring-teal-700"
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEnd} />
      </div>

      {/* Send Error Banner */}
      {sendError && (
        <div className="mx-3 sm:mx-6 mb-1 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <p className="text-xs text-rose-700 dark:text-rose-300 flex-1">{sendError}</p>
          <button onClick={() => setSendError(null)} className="p-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-900">
            <X className="w-3 h-3 text-rose-500" />
          </button>
        </div>
      )}

      {/* Session Proposal Form */}
      {showPropose && (
        <div className="mx-3 sm:mx-6 mb-2 p-3 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-slate-800/80 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-teal-800 dark:text-teal-200 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Propose a Session</p>
            <button onClick={() => setShowPropose(false)} className="p-1 rounded hover:bg-teal-100 dark:hover:bg-slate-700"><X className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300" /></button>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <input type="text" value={proposeSkill} onChange={e => setProposeSkill(e.target.value)} placeholder="Skill topic" className="col-span-3 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-slate-700 text-xs outline-none focus:border-teal-400 bg-white dark:bg-slate-800 dark:text-slate-100" />
            <input type="number" value={proposeDuration} onChange={e => setProposeDuration(Number(e.target.value))} min={10} max={120} className="px-3 py-1.5 rounded-lg border border-teal-200 dark:border-slate-700 text-xs outline-none focus:border-teal-400 bg-white dark:bg-slate-800 dark:text-slate-100" />
            <input type="number" value={proposeTokens} onChange={e => setProposeTokens(Number(e.target.value))} min={0} className="px-3 py-1.5 rounded-lg border border-teal-200 dark:border-slate-700 text-xs outline-none focus:border-teal-400 bg-white dark:bg-slate-800 dark:text-slate-100" />
            <button onClick={handlePropose} disabled={!proposeSkill.trim()} className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors">Send</button>
          </div>
          <p className="text-[10px] text-teal-600 dark:text-teal-400">Duration (min) · Tokens · Hit Send</p>
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-center gap-2 px-3 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/95 shrink-0 transition-colors">
        <button onClick={() => setShowPropose(!showPropose)} title="Propose Session" className="p-2 rounded-xl hover:bg-teal-50 dark:hover:bg-slate-800 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 transition-colors shrink-0">
          <Calendar className="w-4 h-4" />
        </button>
        <div className="flex-1 flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 dark:focus-within:ring-teal-900/30 transition-all bg-white dark:bg-slate-800">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 disabled:opacity-60"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            title={sending ? 'Sending...' : 'Send message'}
            className="p-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors"
          >
            {sending
              ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>
      </div>
      <AuthModal />
    </div>
  );
};

export default ChatPage;
