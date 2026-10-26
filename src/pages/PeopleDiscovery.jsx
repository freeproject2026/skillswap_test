import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Filter, Users, UserCheck, Globe, Star, Clock,
  GraduationCap, Sparkles, SlidersHorizontal, X, ArrowRight, Tag
} from 'lucide-react';
import PersonCard from '../components/PersonCard';
import { SKILL_CATEGORIES } from '../data/mockSkillsData';
import { useApp } from '../context/AppContext';
import { userService } from '../services/userService';
import { AuthModal } from '../components/auth/AuthModal';

export const PeopleDiscovery = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { connectionStatuses, acceptConnection, declineConnection } = useApp();

  // Normalize topic from URL query param (handles ?topic=, ?skill=, ?hashtag=)
  const initialTopic = (
    searchParams.get('topic') ||
    searchParams.get('skill') ||
    searchParams.get('hashtag') ||
    ''
  ).replace(/^#/, '').trim();

  const initialCategory = searchParams.get('category') || 'All Categories';
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [activeTopic, setActiveTopic] = useState(initialTopic);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [maxCredits, setMaxCredits] = useState('All');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state when URL params change (e.g. browser back/forward or new link)
  useEffect(() => {
    const topicFromUrl = (
      searchParams.get('topic') ||
      searchParams.get('skill') ||
      searchParams.get('hashtag') ||
      ''
    ).replace(/^#/, '').trim();
    const catFromUrl = searchParams.get('category') || 'All Categories';
    const searchFromUrl = searchParams.get('search') || '';

    setActiveTopic(topicFromUrl);
    setSelectedCategory(catFromUrl);
    if (searchFromUrl !== search) {
      setSearch(searchFromUrl);
    }
  }, [searchParams]);

  // Update URL search params to preserve state on refresh and navigation
  const updateUrlParams = (newTopic, newCat, newSearch) => {
    const params = new URLSearchParams();
    if (newTopic) params.set('topic', newTopic);
    if (newCat && newCat !== 'All Categories' && newCat !== 'All') params.set('category', newCat);
    if (newSearch && newSearch.trim()) params.set('search', newSearch.trim());
    setSearchParams(params, { replace: true });
  };

  // Fetch users from API on mount and when search/category/topic changes
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const users = await userService.getAllUsers({
        search: search.trim() || undefined,
        category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
        topic: activeTopic || undefined
      });
      setAllUsers(users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, activeTopic]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    updateUrlParams(activeTopic, cat, search);
  };

  const handleClearTopic = () => {
    setActiveTopic('');
    updateUrlParams('', selectedCategory, search);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    updateUrlParams(activeTopic, selectedCategory, val);
  };

  const pendingUsers = allUsers.filter(u => connectionStatuses[u.id || u._id] === 'pending');

  let filtered = [...allUsers];

  // Client-side filters that aren't passed to the API
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
    setActiveTopic('');
    setSelectedCategory('All Categories');
    setSelectedFormat('All');
    setSelectedLevel('All');
    setSelectedAvailability('All');
    setMaxCredits('All');
    setSearchParams(new URLSearchParams(), { replace: true });
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

      {/* Active Topic / Hashtag Filter Banner */}
      {activeTopic && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs font-semibold shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span>Filtering students by topic: <strong className="text-teal-700 dark:text-teal-300 font-bold">#{activeTopic}</strong></span>
          </div>
          <button
            onClick={handleClearTopic}
            className="p-1 px-2 rounded-lg text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors flex items-center gap-1 text-[11px] font-bold"
          >
            <X className="w-3.5 h-3.5" /> Clear topic filter
          </button>
        </div>
      )}

      {/* Search & Quick Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search by skill (e.g. React, DSA, Figma), name, or college..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs"
          />
          {search && (
            <button onClick={() => handleSearchChange('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
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
            onClick={() => handleCategorySelect(cat)}
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
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map(person => (
            <PersonCard key={person.id || person._id} person={person} showMatchInfo={true} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-soft space-y-3">
          <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {activeTopic ? `No student peers found for #${activeTopic}` : 'No students found matching your criteria'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {activeTopic
              ? `There are no student profiles teaching or learning #${activeTopic} right now. You can clear the topic filter or post a learning request so mentors can reach out.`
              : 'Try adjusting your search terms, changing the format filter, or clearing filters.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {activeTopic && (
              <button
                onClick={handleClearTopic}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Clear #{activeTopic}
              </button>
            )}
            <button
              onClick={() => navigate('/requests')}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-xs"
            >
              Post Learning Request
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}
      <AuthModal />
    </div>
  );
};

export default PeopleDiscovery;