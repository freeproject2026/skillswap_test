import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Video, Users, User, Sun, Moon } from 'lucide-react';
import Logo from './Logo';
import TokenBalance from './TokenBalance';
import { useApp } from '../context/AppContext';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    unreadNotifications,
    activeExperience,
    setActiveExperience,
    setSearchOpen,
    theme,
    toggleTheme
  } = useApp();

  const isConnectPath =
    location.pathname.startsWith('/connect') ||
    location.pathname.startsWith('/sessions') ||
    location.pathname.startsWith('/requests') ||
    location.pathname.startsWith('/analyzer') ||
    location.pathname.startsWith('/campus') ||
    location.pathname.startsWith('/room');

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* LEFT SIDE: Official Logo + Token Balance */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <Logo size="normal" showText={true} />
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden xs:block"></div>

          {/* User's Token Balance */}
          <TokenBalance />
        </div>

        {/* CENTER (Desktop/Tablet): Quick Mode Switcher */}
        <div className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
          <button
            onClick={() => {
              setActiveExperience('video');
              navigate('/');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isConnectPath
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Video className={`w-3.5 h-3.5 ${!isConnectPath ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500'}`} />
            <span>Video Learning</span>
          </button>

          <button
            onClick={() => {
              setActiveExperience('connect');
              navigate('/connect');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isConnectPath
                ? 'bg-teal-600 text-white shadow-xs shadow-teal-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Connect & SkillSwap</span>
          </button>
        </div>

        {/* RIGHT SIDE: Search, Dark/White Theme Toggle, Notifications, Profile */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Open search dialog"
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          >
            <Search className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            <span className="text-xs text-slate-400 hidden lg:inline font-medium">
              {isConnectPath ? 'Search people & skills...' : 'Search videos & creators...'}
            </span>
            <kbd className="hidden lg:inline text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle (Dark & White Mode) */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light (white)' : 'dark'} mode`}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Notifications Bell with Unread Indicator */}
          <button
            onClick={() => navigate('/connect/network')}
            aria-label={`Notifications (${unreadNotifications} unread)`}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Profile Avatar (Desktop/Tablet) */}
          <button
            onClick={() => navigate('/profile')}
            aria-label="Go to profile"
            className="hidden sm:flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group"
          >
            <div className="relative">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={currentUser?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/30 group-hover:ring-teal-500 transition-all"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
            </div>
          </button>

        </div>
      </div>
    </header>
  );
};

export default Header;
