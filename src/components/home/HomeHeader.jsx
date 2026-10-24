import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, Menu, Sun, Moon, User,
  ChevronDown, Settings, LogOut, Award, Wallet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HomeHeader = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const {
    currentUser,
    unreadNotifications,
    setSearchOpen,
    theme,
    toggleTheme
  } = useApp();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fallbacks if user not loaded yet
  const studentName = currentUser?.name || 'Alex Rivera';
  const college = currentUser?.college || 'UC Berkeley';
  const branch = currentUser?.branch || 'Computer Science';
  const semester = currentUser?.semester || '6th Sem';
  const avatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Mobile Menu Trigger + Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Mobile Sidebar Hamburger */}
          <button
            onClick={onMenuClick}
            aria-label="Open navigation sidebar"
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Input Bar */}
          <div
            onClick={() => setSearchOpen(true)}
            className="flex-1 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 text-slate-400 dark:text-slate-400 cursor-pointer hover:border-teal-400/60 dark:hover:border-teal-500/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-2xs group"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors shrink-0" />
            <span className="text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400 truncate select-none">
              Search skills, people, or learning requests...
            </span>
            <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-400 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Actions: Theme Toggle, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => navigate('/connect/network')}
            aria-label={`Notifications (${unreadNotifications} unread)`}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* User Profile Pill / Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-2.5 p-1 sm:pl-2.5 sm:pr-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group"
            >
              <div className="relative shrink-0">
                <img
                  src={avatar}
                  alt={studentName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/40 group-hover:ring-teal-500 transition-all"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
              </div>

              {/* Name & Academic Details (hidden on smallest screens) */}
              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {studentName}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium truncate max-w-[150px]">
                  {college} · {semester}
                </span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform" />
            </button>

            {/* Profile Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{studentName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{branch}</p>
                  </div>

                  <button
                    onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                  >
                    <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>View Student Profile</span>
                  </button>

                  <button
                    onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                  >
                    <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Skill Passport</span>
                  </button>

                  <button
                    onClick={() => { navigate('/wallet'); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                  >
                    <Wallet className="w-4 h-4 text-amber-500" />
                    <span>Credits & Wallet</span>
                  </button>

                  <button
                    onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium border-t border-slate-100 dark:border-slate-800 mt-1"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings & Preferences</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
