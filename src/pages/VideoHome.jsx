import React, { useState, useEffect } from 'react';
import { Flame, TrendingUp, Upload, VideoOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { videoService } from '../services/videoService';
import { useApp } from '../context/AppContext';

// Category list is defined here so it no longer depends on mockVideos
export const CATEGORIES = [
  'All',
  'Programming',
  'Design',
  'AI & Data',
  'Communication',
  'Business',
  'Music & Audio',
  'Languages',
  'Education'
];

export const VideoHome = () => {
  const { currentUser, isGuest, setAuthModalOpen } = useApp();
  const [videos, setVideos] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadVideos = async (category = 'All') => {
    setLoading(true);
    setError(null);
    try {
      const allVideos = await videoService.getVideos({ category });
      const featuredVideo = allVideos.find(v => v.isFeatured) || null;
      setFeatured(featuredVideo);
      setVideos(allVideos.filter(v => !v.isFeatured));
    } catch (err) {
      console.error('Failed to load videos:', err);
      setError('Could not load videos. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVideos(activeCategory); }, [activeCategory]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24">
      {/* Hero Heading */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">Discover Skills</h1>
          <span className="hidden sm:inline text-sm text-slate-400 dark:text-slate-400 ml-1">— Learn from the community</span>
        </div>
        {/* Upload button — only for signed-in users */}
        {currentUser && !isGuest && (
          <Link
            to="/upload"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Video
          </Link>
        )}
      </div>

      {/* Category Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-sm text-rose-500 mb-3">{error}</p>
          <button
            onClick={() => loadVideos(activeCategory)}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Featured Video */}
          {featured && activeCategory === 'All' && (
            <div className="mb-6">
              <VideoCard video={featured} featured={true} />
            </div>
          )}

          {/* Trending Header */}
          <div className="flex items-center gap-2 mb-4 mt-2">
            <TrendingUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              {activeCategory === 'All' ? 'All Videos' : activeCategory}
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">({videos.length})</span>
          </div>

          {/* Video Grid or Empty State */}
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {videos.map(video => (
                <VideoCard key={video.id || video._id} video={video} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <VideoOff className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {activeCategory === 'All'
                  ? 'No videos available yet'
                  : `No videos in "${activeCategory}" yet`}
              </h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-5 max-w-xs">
                {activeCategory === 'All'
                  ? 'Be the first to upload a learning video and help the community grow.'
                  : 'No matching videos have been uploaded yet. Try a different category or be the first to upload one.'}
              </p>
              {currentUser && !isGuest ? (
                <Link
                  to="/upload"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload a Video
                </Link>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Sign In to Upload
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoHome;
