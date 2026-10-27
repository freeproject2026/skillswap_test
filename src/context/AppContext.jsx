import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { connectionService } from '../services/connectionService';
import { notificationService } from '../services/notificationService';
import { chatService } from '../services/chatService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [tokens, setTokens] = useState(0);
  const [activeExperience, setActiveExperience] = useState('connect'); // default to student connect & skillswap
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [unreadMessages, setUnreadMessages] = useState(1);
  const [followingIds, setFollowingIds] = useState(['usr_1', 'usr_3', 'usr_2']);
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  // Dashboard Customizer Modal State
  const [dashboardCustomizerOpen, setDashboardCustomizerOpen] = useState(false);
  const [dashboardPrefs, setDashboardPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('skillswap_dashboard_prefs');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          hero: true,
          quickActions: true,
          upcomingSessions: true,
          creditsWallet: true,
          learningProgress: true,
          exploreSkills: true,
          studentProfile: true,
          recommendedStudents: true,
          popularSkills: true,
          communityPromo: true,
          ...parsed
        };
      }
    } catch (e) {
      console.error('Failed to load dashboard prefs', e);
    }
    return {
      hero: true,
      quickActions: true,
      upcomingSessions: true,
      creditsWallet: true,
      learningProgress: true,
      exploreSkills: true,
      studentProfile: true,
      recommendedStudents: true,
      popularSkills: true,
      communityPromo: true
    };
  });

  // Theme (Dark / Light)
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
        if (user) {
          setCurrentUser(user);
          setIsGuest(false);
          setTokens(user.tokens ?? 0);
        } else {
          setCurrentUser(null);
          setIsGuest(true);
        }

        const connStatuses = await connectionService.getConnectionStatuses();
        setConnectionStatuses(connStatuses);

        const followings = await connectionService.getFollowingIds();
        setFollowingIds(followings);

        const [notifCount, msgCount] = await Promise.all([
          notificationService.getUnreadCount(),
          chatService.getUnreadCount()
        ]);
        setUnreadNotifications(notifCount);
        setUnreadMessages(msgCount);
      } catch (err) {
        console.error('Failed to initialize app state:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  // Periodic polling for unread notifications and messages
  useEffect(() => {
    if (isGuest || !currentUser) return;
    const interval = setInterval(async () => {
      try {
        const [notifCount, msgCount] = await Promise.all([
          notificationService.getUnreadCount(),
          chatService.getUnreadCount()
        ]);
        setUnreadNotifications(notifCount);
        setUnreadMessages(msgCount);
      } catch (_e) {}
    }, 4000);
    return () => clearInterval(interval);
  }, [isGuest, currentUser]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  };

  const handleLogin = async (email, password) => {
    const user = await userService.login(email, password);
    setCurrentUser(user);
    setIsGuest(false);
    setTokens(user.tokens ?? 0);
    return user;
  };

  const handleRegister = async (studentData) => {
    const user = await userService.register(studentData);
    setCurrentUser(user);
    setIsGuest(false);
    setTokens(user.tokens ?? 0);
    return user;
  };

  const handleLoginWithPhone = async (phone, otp) => {
    const user = await userService.loginWithPhone(phone, otp);
    setCurrentUser(user);
    setIsGuest(false);
    setTokens(user.tokens ?? 0);
    return user;
  };

  const handleLoginAsGuest = () => {
    userService.logout();
    setCurrentUser(null);
    setIsGuest(true);
  };

  const handleLogout = async () => {
    await userService.logout();
    setCurrentUser(null);
    setIsGuest(true);
    showToast('Logged out. Browsing as Guest.', 'info');
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
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadNotifications(count);
    } catch (_e) {}
  };

  const refreshUnreadMessagesCount = async () => {
    try {
      const count = await chatService.getUnreadCount();
      setUnreadMessages(count);
    } catch (_e) {}
  };

  const refreshUnreadCounts = async () => {
    try {
      const [notifCount, msgCount] = await Promise.all([
        notificationService.getUnreadCount(),
        chatService.getUnreadCount()
      ]);
      setUnreadNotifications(notifCount);
      setUnreadMessages(msgCount);
    } catch (_e) {}
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isGuest,
        setIsGuest,
        login: handleLogin,
        register: handleRegister,
        loginWithPhone: handleLoginWithPhone,
        loginAsGuest: handleLoginAsGuest,
        logout: handleLogout,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        dashboardPrefs,
        setDashboardPrefs,
        dashboardCustomizerOpen,
        setDashboardCustomizerOpen,
        tokens,
        setTokens,
        updateTokens: handleUpdateTokens,
        activeExperience,
        setActiveExperience,
        unreadNotifications,
        setUnreadNotifications,
        refreshNotificationCount,
        unreadMessages,
        setUnreadMessages,
        refreshUnreadMessagesCount,
        refreshUnreadCounts,
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
