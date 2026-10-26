import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Video, Users, User, Sun, Moon, LogOut, Home, Lock } from 'lucide-react';
import Logo from './Logo';
import TokenBalance from './TokenBalance';
import DatabaseStatusPill from './DatabaseStatusPill';
import { useApp } from '../context/AppContext';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    isGuest,
    unreadNotifications,
    activeExperience,
    setActiveExperience,
    setSearchOpen,
    theme,
    toggleTheme,
    setAuthModalOpen,
    logout
  } = useApp();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isConnectPath =
    location.pathname.startsWith('/connect') ||
    location.pathname.startsWith('/sessions') ||
    location.pathname.startsWith('/requests') ||
    location.pathname.startsWith('/analyzer') ||
    location.pathname.startsWith('/campus') ||
    location.pathname.startsWith('/room');

  const isVideosPath = location.pathname.startsWith('/videos');

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* LEFT SIDE: Official Logo + Token Balance */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <div onClick={() => navigate('/')} className="cursor-pointer">
            <Logo size="normal" showText={true} />
          </div>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden xs:block"></div>

          {/* User's Token Balance */}
          <TokenBalance />

          {/* Real Database Connection Health */}
          <DatabaseStatusPill />
        </div>

        {/* CENTER (Desktop/Tablet): Quick Mode Switcher */}
        <div className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
          <button
            onClick={() => {
              navigate('/');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              location.pathname === '/'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Home</span>
          </button>

          <button
            onClick={() => {
              setActiveExperience('video');
              navigate('/videos');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isVideosPath
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Video className={`w-3.5 h-3.5 ${isVideosPath ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500'}`} />
            <span>Videos</span>
          </button>

          <button
            onClick={() => {
              setActiveExperience('connect');
              navigate('/connect');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isConnectPath
                ? 'bg-teal-600 text-white shadow-xs shadow-teal-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>SkillSwap</span>
          </button>
        </div>

        {/* RIGHT SIDE: Search, Dark/White Theme Toggle, Notifications, Profile/Auth */}
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

          {/* Notifications Bell (only if authenticated) */}
          {!isGuest && currentUser ? (
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
          ) : null}

          {/* Guest Auth trigger OR Profile Avatar dropdown */}
          {isGuest || !currentUser ? (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="User menu"
                className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group"
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

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-slate-400" />
                    Settings
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

export default Header;
