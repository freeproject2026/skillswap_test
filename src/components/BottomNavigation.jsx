import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Upload, UserCheck, User, Search, Network, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

const VIDEO_NAV = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'connect', label: 'Connect', icon: Users, path: '/connect' },
  { id: 'upload', label: 'Upload', icon: Upload, path: '/upload' },
  { id: 'following', label: 'Following', icon: UserCheck, path: '/following' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

const CONNECT_NAV = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'connect', label: 'Connect', icon: Users, path: '/connect' },
  { id: 'people', label: 'People', icon: Search, path: '/connect/people' },
  { id: 'network', label: 'Network', icon: Bell, path: '/connect/network' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeExperience, setActiveExperience, unreadNotifications } = useApp();

  const isConnectSection =
    location.pathname.startsWith('/connect') ||
    location.pathname.startsWith('/sessions') ||
    location.pathname.startsWith('/requests') ||
    location.pathname.startsWith('/analyzer') ||
    location.pathname.startsWith('/campus') ||
    location.pathname.startsWith('/room');

  const navItems = isConnectSection ? CONNECT_NAV : VIDEO_NAV;

  const isActive = (item) => {
    if (item.path === '/' && location.pathname === '/') return true;
    if (item.path !== '/' && location.pathname.startsWith(item.path)) {
      if (item.path === '/connect' && (location.pathname === '/connect/people' || location.pathname === '/connect/network')) return false;
      return true;
    }
    return false;
  };

  const handleNav = (item) => {
    if (item.id === 'connect') {
      setActiveExperience('connect');
    } else if (item.id === 'home') {
      setActiveExperience('video');
    }
    navigate(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.4)] safe-area-pb transition-colors duration-200">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          const isUpload = item.id === 'upload';
          const isNetwork = item.id === 'network';

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              aria-label={item.label}
              className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-all duration-200 focus:outline-none ${
                isUpload ? '' : active ? '' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {/* Upload button gets special elevated treatment */}
              {isUpload ? (
                <div className="flex flex-col items-center -mt-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-105 transition-all text-white">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 mt-1">Upload</span>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-150 ${
                        active ? 'text-teal-600 dark:text-teal-400 scale-110' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                    {/* Unread badge on Network tab */}
                    {isNetwork && unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white dark:ring-slate-900"></span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold tracking-tight transition-colors ${
                      active ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Active indicator bar */}
                  {active && (
                    <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-fade-in"></span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
