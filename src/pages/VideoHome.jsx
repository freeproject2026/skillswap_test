import React, { useState, useEffect } from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { videoService } from '../services/videoService';
import { CATEGORIES } from '../data/mockVideos';

export const VideoHome = () => {
  const [videos, setVideos] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadVideos = async (category = 'All') => {
    setLoading(true);
    try {
      const [allVideos, featuredVideo] = await Promise.all([
        videoService.getVideos({ category }),
        videoService.getFeaturedVideo()
      ]);
      setVideos(allVideos.filter(v => !v.isFeatured));
      setFeatured(featuredVideo);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVideos(activeCategory); }, [activeCategory]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24">
      {/* Hero Heading */}
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">Discover Skills</h1>
        <span className="hidden sm:inline text-sm text-slate-400 dark:text-slate-400 ml-1">— Learn from the community</span>
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
              {activeCategory === 'All' ? 'Trending Videos' : activeCategory}
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">({videos.length})</span>
          </div>

          {/* Video Grid */}
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {videos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <p className="text-sm">No videos found in this category yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoHome;
