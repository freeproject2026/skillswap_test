import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, Video, Users, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { videoService } from '../services/videoService';
import { MOCK_USERS } from '../data/mockUsers';

export const SearchOverlay = () => {
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery } = useApp();
  const [results, setResults] = useState({ videos: [], people: [] });
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isConnect = location.pathname.startsWith('/connect');

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  // Search real API for videos, mock for people (until people API is wired)
  const runSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults({ videos: [], people: [] });
      return;
    }
    try {
      const videos = await videoService.getVideos({ search: q });
      const lq = q.toLowerCase();
      const matchedPeople = MOCK_USERS.filter(u =>
        u.name.toLowerCase().includes(lq) ||
        u.username.toLowerCase().includes(lq) ||
        u.skillsOffered.some(s => s.name.toLowerCase().includes(lq)) ||
        u.skillsWanted.some(s => s.name.toLowerCase().includes(lq))
      ).slice(0, 5);
      setResults({ videos: videos.slice(0, 5), people: matchedPeople });
    } catch (err) {
      console.error('Search error:', err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => runSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, runSearch]);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setSearchOpen]);

  if (!searchOpen) return null;

  const handleSelectVideo = (id) => {
    navigate(`/video/${id}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleSelectPerson = (id) => {
    navigate(`/connect/chat/${id}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSearchOpen(false)}></div>

      {/* Search Modal */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 transition-colors">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isConnect ? 'Search people, skills, connections...' : 'Search videos, creators, skills...'}
            className="flex-1 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent outline-none"
          />
          <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {searchQuery.trim() && results.videos.length === 0 && results.people.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No results for "{searchQuery}"</p>
            </div>
          )}

          {/* People & Videos */}
          {(isConnect ? [
            { key: 'people', items: results.people, label: 'People & Skills', icon: Users },
            { key: 'videos', items: results.videos, label: 'Videos & Tutorials', icon: Video }
          ] : [
            { key: 'videos', items: results.videos, label: 'Videos & Tutorials', icon: Video },
            { key: 'people', items: results.people, label: 'People & Skills', icon: Users }
          ]).map(({ key, items, label, icon: Icon }) =>
            items.length > 0 && (
              <div key={key} className="mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Icon className="w-3 h-3" />
                  {label}
                </div>
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => key === 'videos' ? handleSelectVideo(item.id) : handleSelectPerson(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <img
                      src={key === 'videos' ? item.thumbnail : item.avatar}
                      alt=""
                      className={`w-10 h-10 object-cover shrink-0 ${key === 'videos' ? 'rounded-lg' : 'rounded-full'}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {key === 'videos' ? item.title : item.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {key === 'videos' ? `${item.creator.name} · ${item.views} views` : item.title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}

          {/* Quick Suggestions when empty */}
          {!searchQuery.trim() && (
            <div className="p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Trending Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {['React.js', 'Three.js', 'Python AI', 'Figma', 'Spanish', 'Public Speaking', 'Music Production'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSearchQuery(s)}
                    className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-700 dark:hover:text-teal-400 border border-slate-200 dark:border-slate-700 hover:border-teal-200 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
