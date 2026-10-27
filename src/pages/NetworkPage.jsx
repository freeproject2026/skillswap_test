import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Filter } from 'lucide-react';
import NotificationItem from '../components/NotificationItem';
import { notificationService } from '../services/notificationService';
import { useApp } from '../context/AppContext';
import { AuthGate } from '../components/auth/AuthGate';
import { AuthModal } from '../components/auth/AuthModal';

const TABS = ['All', 'Unread', 'Messages', 'Connections', 'Sessions', 'Tokens'];

const TAB_TYPE_MAP = {
  Messages: ['message', 'new_message'],
  Connections: ['connection_request', 'new_follower'],
  Sessions: ['session_accepted', 'skill_swap_request', 'session_completed'],
  Tokens: ['token_credit']
};

export const NetworkPage = () => {
  const { acceptConnection, declineConnection, refreshNotificationCount, showToast, isGuest, currentUser, setAuthModalOpen } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const notifs = await notificationService.getNotifications();
      setNotifications(notifs);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!isGuest && currentUser) {
      loadNotifications();
    } else {
      setLoading(false);
    }
  }, [isGuest, currentUser]);

  if (isGuest || !currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AuthGate
          title="Student Network & Activity"
          description="Sign in or register a verified student profile to view connection requests, session reminders, credit alerts, and peer study invitations."
          actionText="Sign In to View Network"
          onAction={() => setAuthModalOpen(true)}
        />
        <AuthModal />
      </div>
    );
  }

  const handleMarkRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    refreshNotificationCount();
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    refreshNotificationCount();
    showToast('All notifications marked as read', 'info');
  };

  const handleAccept = async (notification) => {
    if (notification.userId) {
      await acceptConnection(notification.userId, notification.user?.name);
      await notificationService.updateNotificationStatus(notification.id, 'accepted');
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, status: 'accepted', isRead: true } : n));
      refreshNotificationCount();
    }
  };

  const handleDecline = async (notification) => {
    if (notification.userId) {
      await declineConnection(notification.userId);
      await notificationService.updateNotificationStatus(notification.id, 'declined');
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, status: 'declined', isRead: true } : n));
      refreshNotificationCount();
    }
  };

  let filtered = [...notifications];
  if (activeTab === 'Unread') {
    filtered = filtered.filter(n => !n.isRead);
  } else if (TAB_TYPE_MAP[activeTab]) {
    filtered = filtered.filter(n => TAB_TYPE_MAP[activeTab].includes(n.type));
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Bell className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Network & Activity
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">{unreadCount} new</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 border border-teal-200 dark:border-teal-800 transition-colors">
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${activeTab === tab ? 'bg-teal-600 text-white border-teal-600 shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500'}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(notif => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkRead={handleMarkRead}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">{activeTab === 'Unread' ? 'No unread notifications' : `No ${activeTab.toLowerCase()} notifications`}</p>
        </div>
      )}
      <AuthModal />
    </div>
  );
};

export default NetworkPage;