import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { connectionService } from '../services/connectionService';
import { notificationService } from '../services/notificationService';
import { chatService } from '../services/chatService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [tokens, setTokens] = useState(100);
  const [activeExperience, setActiveExperience] = useState('video'); // 'video' | 'connect'
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [unreadMessages, setUnreadMessages] = useState(1);
  const [followingIds, setFollowingIds] = useState(['usr_1', 'usr_3', 'usr_2']);
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('skillswap_theme') || 'light';
  });

  // Sync theme with document class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('skillswap_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load initial user and states
  useEffect(() => {
    const initApp = async () => {
      try {
        const user = await userService.getCurrentUser();
        setCurrentUser(user);
        setTokens(user.tokens || 100);

        const connStatuses = await connectionService.getConnectionStatuses();
        setConnectionStatuses(connStatuses);

        const followings = await connectionService.getFollowingIds();
        setFollowingIds(followings);

        const notifCount = await notificationService.getUnreadCount();
        setUnreadNotifications(notifCount);
      } catch (err) {
        console.error('Failed to initialize app state:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  };

  const handleUpdateTokens = async (amount, reason = '') => {
    try {
      const newBalance = await userService.updateTokens(amount, reason);
      setTokens(newBalance);
      if (currentUser) {
        setCurrentUser(prev => ({ ...prev, tokens: newBalance }));
      }
      return newBalance;
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFollow = async (userId, userName = 'Creator') => {
    try {
      const isNowFollowing = await connectionService.toggleFollow(userId);
      setFollowingIds(prev => 
        isNowFollowing ? [...prev, userId] : prev.filter(id => id !== userId)
      );
      showToast(isNowFollowing ? `Now following ${userName}` : `Unfollowed ${userName}`);
      return isNowFollowing;
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendConnectionRequest = async (userId, userName = 'User') => {
    try {
      await connectionService.sendConnectionRequest(userId);
      setConnectionStatuses(prev => ({ ...prev, [userId]: 'pending' }));
      showToast(`Connection request sent to ${userName}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptConnection = async (userId, userName = 'User') => {
    try {
      await connectionService.acceptConnectionRequest(userId);
      setConnectionStatuses(prev => ({ ...prev, [userId]: 'connected' }));
      showToast(`You and ${userName} are now connected!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineConnection = async (userId) => {
    try {
      await connectionService.declineConnectionRequest(userId);
      setConnectionStatuses(prev => ({ ...prev, [userId]: 'none' }));
      showToast('Connection request dismissed', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const refreshNotificationCount = async () => {
    const count = await notificationService.getUnreadCount();
    setUnreadNotifications(count);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        tokens,
        setTokens,
        updateTokens: handleUpdateTokens,
        activeExperience,
        setActiveExperience,
        unreadNotifications,
        setUnreadNotifications,
        refreshNotificationCount,
        unreadMessages,
        followingIds,
        toggleFollow: handleToggleFollow,
        connectionStatuses,
        sendConnectionRequest: handleSendConnectionRequest,
        acceptConnection: handleAcceptConnection,
        declineConnection: handleDeclineConnection,
        searchOpen,
        setSearchOpen,
        searchQuery,
        setSearchQuery,
        toast,
        showToast,
        isLoading,
        theme,
        setTheme,
        toggleTheme
      }}
    >
      {children}
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm transition-all duration-300 transform translate-y-0 animate-bounce-short">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md ${
            toast.type === 'error'
              ? 'bg-rose-900/90 text-rose-100 border-rose-700'
              : toast.type === 'info'
              ? 'bg-slate-900/90 text-slate-100 border-slate-700'
              : 'bg-teal-900/95 text-teal-100 border-teal-600/50 shadow-teal-500/20'
          }`}>
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;

