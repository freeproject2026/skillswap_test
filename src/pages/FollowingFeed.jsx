import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { videoService } from '../services/videoService';
import { useApp } from '../context/AppContext';

export const FollowingFeed = () => {
  const navigate = useNavigate();
  const { followingIds } = useApp();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const v = await videoService.getFollowingVideos(followingIds);
        setVideos(v);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [followingIds]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24">
      <div className="flex items-center gap-2 mb-5">
        <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">Following</h1>
        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-medium">{followingIds.length} creators</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {videos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">You're not following anyone yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-xs">Discover talented creators and follow them to see their latest videos and tutorials here.</p>
          <button
            onClick={() => navigate('/connect/people')}
            className="px-6 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm"
          >
            Discover Creators
          </button>
        </div>
      )}
    </div>
  );
};

export default FollowingFeed;
