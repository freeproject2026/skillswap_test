import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Users, UserCheck, Globe, Star, Clock,
  GraduationCap, Sparkles, SlidersHorizontal, X, ArrowRight
} from 'lucide-react';
import PersonCard from '../components/PersonCard';
import { MOCK_USERS } from '../data/mockUsers';
import { SKILL_CATEGORIES } from '../data/mockSkillsData';
import { useApp } from '../context/AppContext';
import { AuthModal } from '../components/auth/AuthModal';

export const PeopleDiscovery = () => {
  const navigate = useNavigate();
  const { connectionStatuses, acceptConnection, declineConnection } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [maxCredits, setMaxCredits] = useState('All');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  const pendingUsers = MOCK_USERS.filter(u => connectionStatuses[u.id] === 'pending');

  let filtered = [...MOCK_USERS];

  // 1. Text Search (name, username, college, skills)
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.college && u.college.toLowerCase().includes(q)) ||
      u.skillsOffered.some(s => s.name.toLowerCase().includes(q)) ||
      u.skillsWanted.some(s => s.name.toLowerCase().includes(q))
    );
  }

  // 2. Skill Category Filter
  if (selectedCategory !== 'All Categories') {
    filtered = filtered.filter(u =>
      u.skillsOffered.some(s => s.category === selectedCategory) ||
      u.skillsWanted.some(s => s.category === selectedCategory)
    );
  }

  // 3. Format Filter (Online vs In-person)
  if (selectedFormat !== 'All') {
    filtered = filtered.filter(u =>
      u.sessionFormat?.toLowerCase().includes(selectedFormat.toLowerCase())
    );
  }

  // 4. Proficiency Level Filter
  if (selectedLevel !== 'All') {
    filtered = filtered.filter(u =>
      u.skillsOffered.some(s => s.level?.toLowerCase() === selectedLevel.toLowerCase())
    );
  }

  // 5. Availability Filter
  if (selectedAvailability === 'Today') {
    filtered = filtered.filter(u => u.availability?.toLowerCase().includes('today'));
  } else if (selectedAvailability === 'Weekends') {
    filtered = filtered.filter(u => u.availability?.toLowerCase().includes('weekend'));
  }

  // 6. Credit Cost Filter
  if (maxCredits === 'Free') {
    filtered = filtered.filter(u => u.creditsRate === 0 || u.connectionStatus === 'connected');
  } else if (maxCredits === 'Under 60') {
    filtered = filtered.filter(u => (u.creditsRate || 60) <= 60);
  }

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All Categories');
    setSelectedFormat('All');
    setSelectedLevel('All');
    setSelectedAvailability('All');
    setMaxCredits('All');
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>Skill Marketplace & Discovery</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Search verified student mentors, explore academic subjects, and filter by format and credit cost
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/campus')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all"
          >
            <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Campus Communities</span>
          </button>
          <button
            onClick={() => navigate('/requests')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Learning Requests</span>
          </button>
        </div>
      </div>

      {/* Search & Quick Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by skill (e.g. React, DSA, Figma), name, or college..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
            showFiltersDrawer || selectedFormat !== 'All' || selectedLevel !== 'All' || maxCredits !== 'All'
              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-400'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {(selectedFormat !== 'All' || selectedLevel !== 'All' || maxCredits !== 'All') && (
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          )}
        </button>
      </div>

      {/* Category Pills Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
        {SKILL_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-700 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expanded Filter Drawer */}
      {showFiltersDrawer && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Advanced Marketplace Filters
            </span>
            <button onClick={resetFilters} className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold">
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Session Format</label>
              <select
                value={selectedFormat}
                onChange={e => setSelectedFormat(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
              >
                <option value="All">All Formats</option>
                <option value="Online">Online Sessions</option>
                <option value="In-Person">In-Person Campus Lab</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Proficiency Level</label>
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner Tutors</option>
                <option value="Intermediate">Intermediate Tutors</option>
                <option value="Advanced">Advanced Tutors</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Availability</label>
              <select
                value={selectedAvailability}
                onChange={e => setSelectedAvailability(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
              >
                <option value="All">Anytime</option>
                <option value="Today">Available Today</option>
                <option value="Weekends">Weekends</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Credit Cost</label>
              <select
                value={maxCredits}
                onChange={e => setMaxCredits(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
              >
                <option value="All">Any Cost</option>
                <option value="Free">Mutual Barter (0 Cr)</option>
                <option value="Under 60">Under 60 Credits</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Pending Connection Requests (if any) */}
      {pendingUsers.length > 0 && (
        <section className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <h3 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              Pending Campus Connection Requests ({pendingUsers.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={u.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-1 ring-amber-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{u.college} · {u.branch}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0 ml-2">
                  <button
                    onClick={() => acceptConnection(u.id, u.name)}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 text-white text-[11px] font-bold hover:bg-teal-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => declineConnection(u.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Grid of Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map(person => (
            <PersonCard key={person.id} person={person} showMatchInfo={true} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-soft">
          <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No students found matching your criteria</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-4">
            Try adjusting your search terms, changing the format filter, or clearing filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
          >
            Reset Filters
          </button>
        </div>
      )}
      <AuthModal />
    </div>
  );
};

export default PeopleDiscovery;