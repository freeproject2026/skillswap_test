import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Bookmark, Share2, Play, Clock, Eye, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { videoService } from '../services/videoService';

export const VideoCard = ({ video, featured = false, compact = false }) => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [liked, setLiked] = useState(video.isLiked);
  const [saved, setSaved] = useState(video.isSaved);
  const [likeCount, setLikeCount] = useState(video.likes);

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const updated = await videoService.toggleLike(video.id);
      setLiked(updated.isLiked);
      setLikeCount(updated.likes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      const updated = await videoService.toggleSave(video.id);
      setSaved(updated.isSaved);
      showToast(updated.isSaved ? 'Video saved to library' : 'Removed from saved', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: video.title, text: video.description, url: window.location.origin + `/video/${video.id}` });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/video/${video.id}`);
      showToast('Link copied to clipboard!');
    }
  };

  const openVideo = () => navigate(`/video/${video.id}`);

  if (featured) {
    return (
      <div onClick={openVideo} className="group relative w-full rounded-2xl overflow-hidden cursor-pointer shadow-card hover:shadow-float transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        {/* Thumbnail area */}
        <div className="relative aspect-video overflow-hidden">
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 group-hover:scale-110 group-hover:bg-teal-500/80 transition-all duration-300">
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </div>
          </div>

          {/* Featured Badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-md">
              ★ Featured
            </span>
          </div>

          {/* Duration */}
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 text-white text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {video.duration}
          </div>

          {/* Bottom Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <h2 className="text-white font-bold text-base sm:text-lg leading-tight line-clamp-2 drop-shadow-lg">
              {video.title}
            </h2>
          </div>
        </div>

        {/* Info Strip */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <img src={video.creator.avatar} alt={video.creator.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-500/30 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{video.creator.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{video.views}</span>
                <span>·</span>
                <span>{video.createdAt}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleLike} className={`p-2 rounded-lg transition-colors ${liked ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800'}`}>
              <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
            </button>
            <button onClick={handleSave} className={`p-2 rounded-lg transition-colors ${saved ? 'text-teal-600 bg-teal-50 dark:bg-teal-950/40' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-slate-800'}`}>
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-teal-600' : ''}`} />
            </button>
            <button onClick={handleShare} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standard Card
  return (
    <div onClick={openVideo} className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 h-full">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[11px] font-semibold flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {video.duration}
        </div>

        {/* Category */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur text-white text-[10px] font-medium">
            {video.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-3.5 bg-white dark:bg-slate-900 transition-colors">
        <div className="flex gap-2.5">
          <img src={video.creator.avatar} alt={video.creator.name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {video.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{video.creator.name}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{video.views}</span>
              <span>·</span>
              <span>{video.createdAt}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 mt-auto pt-2.5 border-t border-slate-100 dark:border-slate-800 -mx-1">
          <button onClick={handleLike} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${liked ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800'}`}>
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500' : ''}`} />
            <span className="font-medium">{typeof likeCount === 'number' ? (likeCount > 999 ? `${(likeCount/1000).toFixed(1)}K` : likeCount) : likeCount}</span>
          </button>
          <button onClick={handleSave} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${saved ? 'text-teal-600 bg-teal-50 dark:bg-teal-950/40' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-slate-800'}`}>
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-teal-600' : ''}`} />
            <span className="font-medium">Save</span>
          </button>
          <button onClick={handleShare} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto">
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
