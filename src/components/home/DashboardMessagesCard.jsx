import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight, User } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { useApp } from '../../context/AppContext';
import { resolveMediaUrl } from '../../services/api';

const formatTimeAgo = (dateInput) => {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (_e) {
    return '';
  }
};

export const DashboardMessagesCard = () => {
  const navigate = useNavigate();
  const { currentUser, isGuest, unreadMessages } = useApp();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (isGuest || !currentUser) {
      setLoading(false);
      return;
    }
    try {
      const list = await chatService.getConversations();
      setConversations(list || []);
    } catch (err) {
      console.error('Failed to load dashboard messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // Poll for automatic conversation list updates without manual refresh
    if (!isGuest && currentUser) {
      const interval = setInterval(fetchConversations, 3000);
      return () => clearInterval(interval);
    }
  }, [isGuest, currentUser]);

  const handleOpenConversation = (conv) => {
    const targetId = conv.participant?.id || conv.participantId;
    if (targetId) {
      navigate(`/connect/chat/${targetId}`);
    } else {
      navigate('/connect/chat');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Messages
          </h3>
          {unreadMessages > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 animate-pulse">
              {unreadMessages} new
            </span>
          )}
        </div>

        <button
          onClick={() => navigate('/connect/chat')}
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Conversations List */}
      <div className="space-y-2">
        {loading ? (
          <div className="py-6 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-5 text-center px-4 space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No conversations yet
            </p>
            <button
              onClick={() => navigate('/connect/people')}
              className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
            >
              Find Peers to Chat
            </button>
          </div>
        ) : (
          conversations.slice(0, 4).map((conv) => {
            const partner = conv.participant || {};
            const partnerName = partner.name || 'Student Peer';
            const partnerAvatar = partner.avatar || '';
            const unreadCount = conv.unreadCount || 0;
            const lastMsg = conv.lastMessage || 'Conversation started';
            const timeAgo = formatTimeAgo(conv.lastMessageAt);

            return (
              <div
                key={conv.id || conv._id || conv.participantId}
                onClick={() => handleOpenConversation(conv)}
                className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all duration-150 border ${
                  unreadCount > 0
                    ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900/40 hover:bg-teal-50 dark:hover:bg-teal-950/40'
                    : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 border-transparent'
                }`}
              >
                {/* Avatar with Status Dot */}
                <div className="relative shrink-0">
                  {partnerAvatar ? (
                    <img
                      src={resolveMediaUrl(partnerAvatar)}
                      alt={partnerName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className={`text-xs sm:text-sm truncate ${unreadCount > 0 ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
                      {partnerName}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                      {timeAgo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${unreadCount > 0 ? 'font-medium text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                      {lastMsg}
                    </p>
                    {unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DashboardMessagesCard;
