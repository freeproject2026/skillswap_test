import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, CheckCircle, MessageCircle, Coins, Heart,
  ArrowRightLeft, Calendar, UserCheck, Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const ICON_MAP = {
  connection_request: UserPlus,
  session_accepted: CheckCircle,
  skill_swap_request: ArrowRightLeft,
  token_credit: Coins,
  new_follower: Heart,
  message: MessageCircle,
  session_completed: Calendar,
  default: Bell,
};

const COLOR_MAP = {
  connection_request: 'bg-blue-50 text-blue-600 border-blue-100',
  session_accepted: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  skill_swap_request: 'bg-purple-50 text-purple-600 border-purple-100',
  token_credit: 'bg-amber-50 text-amber-600 border-amber-100',
  new_follower: 'bg-rose-50 text-rose-500 border-rose-100',
  message: 'bg-teal-50 text-teal-600 border-teal-100',
  session_completed: 'bg-teal-50 text-teal-600 border-teal-100',
  default: 'bg-slate-50 text-slate-600 border-slate-100',
};

export const NotificationItem = ({ notification, onMarkRead, onAccept, onDecline }) => {
  const navigate = useNavigate();
  const Icon = ICON_MAP[notification.type] || ICON_MAP.default;
  const colorClass = COLOR_MAP[notification.type] || COLOR_MAP.default;

  const handleClick = () => {
    if (onMarkRead) onMarkRead(notification.id);
    if (notification.userId) {
      navigate(`/connect/chat/${notification.userId}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
        notification.isRead
          ? 'bg-white dark:bg-slate-850/60 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          : 'bg-teal-50/40 dark:bg-teal-950/30 border-teal-100/60 dark:border-teal-900/50 hover:bg-teal-50/60 dark:hover:bg-teal-950/50 shadow-sm'
      }`}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-teal-500 shadow-sm animate-pulse"></span>
      )}

      {/* Icon */}
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${colorClass} dark:bg-slate-800 dark:border-slate-700`}>
        <Icon className="w-4.5 h-4.5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2 mb-0.5">
          {notification.user?.avatar && (
            <img src={notification.user.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-100 dark:ring-slate-700" />
          )}
          <p className={`text-sm font-semibold leading-snug ${notification.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'}`}>
            {notification.title}
          </p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
          {notification.description}
        </p>

        {/* Token Amount */}
        {notification.tokenAmount && (
          <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/60">
            <Coins className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">{notification.tokenAmount > 0 ? '+' : ''}{notification.tokenAmount} Tokens</span>
          </div>
        )}

        {/* Action buttons for connection requests */}
        {notification.type === 'connection_request' && notification.status === 'pending' && (
          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={(e) => { e.stopPropagation(); onAccept?.(notification); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm"
            >
              <UserCheck className="w-3 h-3" />
              Accept
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDecline?.(notification); }}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Accepted status */}
        {notification.status === 'accepted' && (
          <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-3 h-3" />
            Accepted
          </span>
        )}

        {/* Timestamp */}
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">{notification.timestamp}</p>
      </div>
    </div>
  );
};

export default NotificationItem;
