import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, Share2, Play, MessageCircle, ChevronDown, ChevronUp, Send, Eye, Clock, ArrowLeft, UserPlus, Check } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { videoService } from '../services/videoService';
import { useApp } from '../context/AppContext';

export const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, followingIds, toggleFollow, showToast } = useApp();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const commentsRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const v = await videoService.getVideoById(id);
        setVideo(v);
        setLiked(v.isLiked);
        setSaved(v.isSaved);
        setLikeCount(v.likes);
        setComments(v.comments || []);
        const rel = await videoService.getRelatedVideos(id, v.category);
        setRelated(rel);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [id]);

  const handleLike = async () => {
    try {
      const updated = await videoService.toggleLike(video.id);
      setLiked(updated.isLiked);
      setLikeCount(updated.likes);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    try {
      const updated = await videoService.toggleSave(video.id);
      setSaved(updated.isSaved);
      showToast(updated.isSaved ? 'Video saved' : 'Removed from saved', 'info');
    } catch (err) { console.error(err); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied!');
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const newComment = await videoService.addComment(video.id, {
        author: currentUser?.name || 'You',
        avatar: currentUser?.avatar || '',
        text: commentText.trim()
      });
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Video not found</p>
        <button onClick={() => navigate('/')} className="mt-4 text-teal-600 font-semibold text-sm">Go Home</button>
      </div>
    );
  }

  const isFollowing = followingIds.includes(video.creator.id);

  return (
    <div className="max-w-5xl mx-auto pb-24">
      {/* Back Button */}
      <div className="px-3 sm:px-6 py-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Video Player */}
      <div className="w-full aspect-video bg-black rounded-none sm:rounded-2xl overflow-hidden sm:mx-6 sm:max-w-[calc(100%-3rem)] shadow-lg">
        <video
          src={video.videoUrl}
          poster={video.thumbnail}
          controls
          className="w-full h-full object-contain"
          autoPlay={false}
        />
      </div>

      <div className="px-3 sm:px-6 mt-4">
        {/* Title & Meta */}
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">{video.title}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{video.views} views</span>
          <span>·</span>
          <span>{video.createdAt}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">{video.category}</span>
        </div>

        {/* Skills Taught Tags */}
        {video.skillsTaught && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {video.skillsTaught.map((s, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 text-[11px] font-medium border border-teal-100 dark:border-teal-800/60">{s}</span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <button onClick={handleLike} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${liked ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-400' : 'bg-white text-slate-600 border-slate-200 hover:border-rose-200 hover:text-rose-500 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}>
            <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
            {typeof likeCount === 'number' ? (likeCount > 999 ? `${(likeCount/1000).toFixed(1)}K` : likeCount) : likeCount}
          </button>
          <button onClick={handleSave} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${saved ? 'bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-950/40 dark:border-teal-900/60 dark:text-teal-300' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-200 hover:text-teal-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}>
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-teal-600' : ''}`} />
            {saved ? 'Saved' : 'Save'}
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        {/* Creator Info */}
        <div className="flex items-center justify-between gap-3 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <img src={video.creator.avatar} alt={video.creator.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-teal-500/30 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{video.creator.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{video.creator.subscribers} subscribers</p>
            </div>
          </div>
          {video.creator.id !== 'usr_me' && (
            <button
              onClick={() => toggleFollow(video.creator.id, video.creator.name)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isFollowing
                  ? 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800'
                  : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
              }`}
            >
              {isFollowing ? <><Check className="w-3.5 h-3.5" />Following</> : <><UserPlus className="w-3.5 h-3.5" />Follow</>}
            </button>
          )}
        </div>

        {/* Description */}
        <div className="py-4 border-b border-slate-100 dark:border-slate-800">
          <p className={`text-sm text-slate-600 dark:text-slate-300 leading-relaxed ${showFullDesc ? '' : 'line-clamp-2'}`}>
            {video.description}
          </p>
          <button onClick={() => setShowFullDesc(!showFullDesc)} className="flex items-center gap-1 mt-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700">
            {showFullDesc ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Show more</>}
          </button>
        </div>

        {/* Comments */}
        <div className="py-4" ref={commentsRef}>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Comments ({comments.length})
          </h3>

          {/* Add Comment */}
          <div className="flex items-center gap-2 mb-4">
            <img src={currentUser?.avatar || ''} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            <div className="flex-1 flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800/80 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 dark:focus-within:ring-teal-900/40 transition-all">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment..."
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
              <button onClick={handleAddComment} disabled={!commentText.trim()} className="p-1 rounded-lg text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:bg-transparent transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {comments.map(c => (
            <div key={c.id} className="flex gap-2.5 mb-3">
              <img src={c.avatar} alt={c.author} className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{c.author} <span className="font-normal text-slate-400 dark:text-slate-500 ml-1">{c.createdAt}</span></p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Related Videos */}
        {related.length > 0 && (
          <div className="py-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Related Videos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map(v => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
