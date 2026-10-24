import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Compass, ArrowRightLeft, Wallet, BookOpen,
  Award, Users, MessageSquare, Bell, HelpCircle,
  Settings, X, Sparkles, ChevronRight
} from 'lucide-react';
import Logo from '../Logo';
import { useApp } from '../../context/AppContext';

export const HomeSidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadNotifications, unreadMessages } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'discover', label: 'Discover Skills', icon: Compass, path: '/connect/people' },
    { id: 'exchanges', label: 'My Exchanges', icon: ArrowRightLeft, path: '/sessions' },
    { id: 'wallet', label: 'Credits Wallet', icon: Wallet, path: '/wallet' },
    { id: 'learning', label: 'My Learning', icon: BookOpen, path: '/requests' },
    { id: 'passport', label: 'Skill Passport', icon: Award, path: '/profile' },
    { id: 'community', label: 'Community', icon: Users, path: '/campus' },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      path: '/connect/chat/usr_1',
      badge: unreadMessages > 0 ? unreadMessages : null,
      badgeColor: 'bg-teal-500'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      path: '/connect/network',
      badge: unreadNotifications > 0 ? unreadNotifications : null,
      badgeColor: 'bg-rose-500'
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (setMobileOpen) setMobileOpen(false);
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a1128] text-slate-300 flex flex-col border-r border-slate-800/80 shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header: Logo + Close Button (mobile) */}
        <div className="p-5 pb-4 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none">
                  <path
                    d="M10 16 C10 11, 16 8, 24 8 L30 8 M30 8 L26 4 M30 8 L26 12"
                    stroke="#ffffff"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M30 24 C30 29, 24 32, 16 32 L10 32 M10 32 L14 36 M10 32 L14 28"
                    stroke="#5EEAD4"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="20" cy="20" r="3" fill="#FFFFFF" />
                </svg>
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-lg text-white tracking-tight">
                  Skill<span className="text-teal-400">Swap</span>
                </span>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Learn • Teach • Grow
                </p>
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation sidebar"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 no-scrollbar">
          <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Platform Menu
          </div>

          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group text-left ${
                  active
                    ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/10 text-teal-300 font-bold border-l-4 border-teal-400 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active
                        ? 'text-teal-400'
                        : 'text-slate-400 group-hover:text-teal-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full text-white ${item.badgeColor} shadow-xs`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-slate-800/80 space-y-2 bg-[#080d20]">
          {/* Promotional Card */}
          <div className="relative rounded-2xl bg-gradient-to-br from-indigo-900/60 via-slate-900 to-teal-950/60 p-3.5 border border-indigo-500/20 overflow-hidden">
            <div className="absolute top-0 right-0 -mr-2 -mt-2 w-12 h-12 bg-teal-400/10 rounded-full blur-md pointer-events-none"></div>
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-white leading-snug">
                  Turn your skills into opportunities
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Teach, learn, and build your verified student portfolio today.
                </p>
                <button
                  onClick={() => handleNavigation('/requests')}
                  className="mt-2.5 text-[11px] font-bold text-teal-300 hover:text-teal-200 flex items-center gap-1 group/btn"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Help & Settings */}
          <div className="space-y-0.5 pt-1">
            <button
              onClick={() => handleNavigation('/settings')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Help & Support</span>
            </button>
            <button
              onClick={() => handleNavigation('/settings')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default HomeSidebar;
