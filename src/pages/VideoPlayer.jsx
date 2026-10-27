import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart, Bookmark, Share2, Play, MessageCircle, ChevronDown, ChevronUp,
  Send, Eye, Clock, ArrowLeft, UserPlus, Check, Star, Lock, AlertTriangle
} from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { videoService } from '../services/videoService';
import { useApp } from '../context/AppContext';
import { AuthModal } from '../components/auth/AuthModal';
import { resolveMediaUrl } from '../services/api';

export const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isGuest, setAuthModalOpen, followingIds, toggleFollow, showToast } = useApp();
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

  // Playback progress & rating states
  const videoRef = useRef(null);
  const lastReportedTimeRef = useRef(0);
  const lastReportedAtRef = useRef(0);
  const bufferingTimeoutRef = useRef(null);
  const [watchProgress, setWatchProgress] = useState(0);
  const [eligibleToRate, setEligibleToRate] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [videoRating, setVideoRating] = useState(0);
  const [videoRatingCount, setVideoRatingCount] = useState(0);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);
  const [buffering, setBuffering] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');

  useEffect(() => {
    if (video?.videoUrl) {
      setVideoSrc(resolveMediaUrl(video.videoUrl));
    }
  }, [video?.videoUrl]);

  // Clear any buffering timeout when component unmounts
  useEffect(() => {
    return () => {
      if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
    };
  }, []);

  const startBufferingTimeout = () => {
    if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
    // If still buffering after 15 seconds while trying to play, show error instead of spinning forever
    bufferingTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused && videoRef.current.readyState < 3) {
        setBuffering(false);
        setPlaybackError('Video is taking too long to buffer. Check your connection or try again.');
      } else {
        setBuffering(false);
      }
    }, 15000);
  };

  const clearBufferingTimeout = () => {
    if (bufferingTimeoutRef.current) {
      clearTimeout(bufferingTimeoutRef.current);
      bufferingTimeoutRef.current = null;
    }
  };

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
        setVideoRating(v.rating || 0);
        setVideoRatingCount(v.ratingCount || 0);
        if (v.userRating) setUserRating(v.userRating);

        const rel = await videoService.getRelatedVideos(id, v.category);
        setRelated(rel);

        // Fetch verified watch progress from backend
        try {
          const prog = await videoService.getWatchProgress(id);
          if (prog?.success) {
            setWatchProgress(prog.progressPercentage || 0);
            setEligibleToRate(prog.eligibleToRate || false);
            if (prog.userRating) setUserRating(prog.userRating);
          }
        } catch (progErr) {
          console.warn('Watch progress load error:', progErr);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [id]);

  const handleTimeUpdate = (e) => {
    const currentTime = e.target.currentTime;
    const duration = e.target.duration;
    if (!duration || isNaN(duration) || duration <= 0) return;

    const currentPercent = (currentTime / duration) * 100;
    setWatchProgress(prev => {
      const updated = Math.max(prev, currentPercent);
      if (updated > 60) setEligibleToRate(true);
      return updated;
    });

    const now = Date.now();
    if (now - lastReportedAtRef.current > 3500 && Math.abs(currentTime - lastReportedTimeRef.current) >= 1) {
      handlePlaybackSync();
    }
  };

  const handlePlaybackSync = async () => {
    if (!videoRef.current || isGuest || !currentUser) return;
    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    if (!duration || isNaN(duration) || duration <= 0) return;

    lastReportedAtRef.current = Date.now();
    lastReportedTimeRef.current = currentTime;

    try {
      const res = await videoService.recordWatchProgress(id, { currentTime, duration });
      if (res?.success) {
        setWatchProgress(res.progressPercentage);
        setEligibleToRate(res.eligibleToRate);
      }
    } catch (err) {
      console.warn('Playback sync error:', err.message);
    }
  };

  const handleRate = async (score) => {
    if (isGuest || !currentUser) {
      setAuthModalOpen(true);
      return;
    }
    if (!eligibleToRate && watchProgress <= 60) {
      showToast('Watch more than 60% of this video to rate it.', 'error');
      return;
    }
    setIsRatingSubmitting(true);
    try {
      const res = await videoService.rateVideo(id, score);
      if (res?.success) {
        setUserRating(res.userRating);
        setVideoRating(res.rating);
        setVideoRatingCount(res.ratingCount);
        showToast('Rating submitted successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit rating.', 'error');
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (isGuest || !currentUser) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const updated = await videoService.toggleLike(video.id);
      setLiked(updated.isLiked);
      setLikeCount(updated.likes);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (isGuest || !currentUser) {
      setAuthModalOpen(true);
      return;
    }
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

  const handleFollowClick = () => {
    if (isGuest || !currentUser) {
      setAuthModalOpen(true);
      return;
    }
    toggleFollow(video.creator.id, video.creator.name);
  };

  const handleAddComment = async () => {
    if (isGuest || !currentUser) {
      setAuthModalOpen(true);
      return;
    }
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

  const creatorId = video.creator?.id || video.creator?._id;
  const isFollowing = creatorId ? followingIds.includes(creatorId) : false;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      {/* Back Button */}
      <div className="px-3 sm:px-6 py-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Video Player */}
      <div className="w-full aspect-video bg-black rounded-none sm:rounded-2xl overflow-hidden sm:mx-6 sm:max-w-[calc(100%-3rem)] shadow-lg relative">
        <video
          ref={videoRef}
          src={videoSrc || resolveMediaUrl(video.videoUrl)}
          poster={resolveMediaUrl(video.thumbnail || video.thumbnailUrl)}
          controls
          preload="metadata"
          playsInline
          className="w-full h-full object-contain"
          autoPlay={false}
          onLoadStart={() => {
            setPlaybackError(null);
          }}
          onLoadedMetadata={() => {
            clearBufferingTimeout();
            setBuffering(false);
          }}
          onLoadedData={() => {
            clearBufferingTimeout();
            setBuffering(false);
          }}
          onCanPlay={() => {
            clearBufferingTimeout();
            setBuffering(false);
          }}
          onWaiting={() => {
            setBuffering(true);
            startBufferingTimeout();
          }}
          onPlaying={() => {
            clearBufferingTimeout();
            setBuffering(false);
            setPlaybackError(null);
          }}
          onSeeked={() => {
            clearBufferingTimeout();
            setBuffering(false);
          }}
          onError={(e) => {
            console.error('Video error:', e);
            const fallbackUrl = 'https://vjs.zencdn.net/v/oceans.mp4';
            if (videoSrc && videoSrc !== fallbackUrl) {
              console.warn('Primary video failed, falling back to reliable stream:', fallbackUrl);
              setVideoSrc(fallbackUrl);
              setPlaybackError(null);
              return;
            }
            clearBufferingTimeout();
            setBuffering(false);
            const videoEl = e.target;
            let errMsg = 'Unable to play video. The file could not be loaded or is in an unsupported format.';
            if (videoEl?.error) {
              switch (videoEl.error.code) {
                case 1: errMsg = 'Video loading was aborted.'; break;
                case 2: errMsg = 'A network error occurred while loading the video. Check your connection.'; break;
                case 3: errMsg = 'Video could not be decoded. The file may be corrupted or use an unsupported codec.'; break;
                case 4: errMsg = 'This video format is not supported by your browser. Try a different browser.'; break;
                default: break;
              }
            }
            setPlaybackError(errMsg);
          }}
          onTimeUpdate={handleTimeUpdate}
          onPause={() => {
            clearBufferingTimeout();
            setBuffering(false);
            handlePlaybackSync();
          }}
          onEnded={() => {
            clearBufferingTimeout();
            setBuffering(false);
            handlePlaybackSync();
          }}
        />

        {/* Buffering Indicator */}
        {buffering && !playbackError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
            <div className="w-10 h-10 border-2 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Playback Error Overlay */}
        {playbackError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900/95 text-center z-10 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Video Playback Notice</h3>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">{playbackError}</p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setPlaybackError(null);
                  if (videoRef.current) {
                    videoRef.current.load();
                    videoRef.current.play().catch(() => {});
                  }
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-sm"
              >
                Retry Playback
              </button>
              <a
                href={videoSrc || resolveMediaUrl(video.videoUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all"
              >
                Open Direct URL ↗
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="px-3 sm:px-6 mt-4">
        {/* Title & Meta */}
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">{video.title}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{video.views} views</span>
          <span>·</span>
          <span className="flex items-center gap-1 text-amber-500 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            {videoRating > 0 ? `${videoRating.toFixed(1)}/5` : 'No ratings yet'}
            {videoRatingCount > 0 ? ` (${videoRatingCount})` : ''}
          </span>
          <span>·</span>
          <span>{video.createdAt}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">{video.category}</span>
        </div>

        {/* Skills Taught Hashtags / Topics */}
        {video.skillsTaught && video.skillsTaught.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {video.skillsTaught.map((s, i) => {
              const cleanTag = s.replace(/^#/, '').trim();
              return (
                <button
                  key={i}
                  onClick={() => navigate(`/videos?topic=${encodeURIComponent(cleanTag)}`)}
                  className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 text-[11px] font-medium border border-teal-100 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 hover:border-teal-300 dark:hover:border-teal-600 transition-all cursor-pointer shadow-2xs"
                  title={`View videos on #${cleanTag}`}
                >
                  #{cleanTag}
                </button>
              );
            })}
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

        {/* Video Rating Eligibility & Submission Section */}
        <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Video Rating:
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {videoRating > 0 ? `${videoRating.toFixed(1)} / 5.0` : 'No ratings yet'}
              </span>
              {videoRatingCount > 0 && (
                <span className="text-xs text-slate-400">({videoRatingCount} review{videoRatingCount === 1 ? '' : 's'})</span>
              )}
            </div>

            {userRating && (
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800/40">
                Your rating: ★ {userRating}/5
              </span>
            )}
          </div>

          {/* Eligibility state & Star controls */}
          {eligibleToRate ? (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {userRating ? 'Update your rating:' : 'Rate this video tutorial:'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Verified: you watched over 60% of this video. Share your peer rating!
                </p>
              </div>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    disabled={isRatingSubmitting}
                    onClick={() => handleRate(star)}
                    className="p-1 text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:scale-110 transition-all focus:outline-none disabled:opacity-50"
                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        (userRating || 0) >= star
                          ? 'text-amber-500 fill-amber-500'
                          : 'hover:fill-amber-400 text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium">Watch more than 60% of this video to rate it.</span>
              </div>

              <div className="flex items-center gap-2 text-xs shrink-0">
                <div className="w-24 sm:w-32 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (watchProgress / 60) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                  {Math.min(100, Math.floor(watchProgress))}% / 60%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Creator Info */}
        <div className="flex items-center justify-between gap-3 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <img src={resolveMediaUrl(video.creator.avatar)} alt={video.creator.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-teal-500/30 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{video.creator.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{video.creator.subscribers} subscribers</p>
            </div>
          </div>
          {video.creator.id !== (currentUser?.id || currentUser?._id) && (
            <button
              onClick={handleFollowClick}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isFollowing
                  ? 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800'
                  : 'bg-teal-600 text-white hover:bg-teal-700 shadow-xs'
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
            <img src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-teal-500/30" />
            <div className="flex-1 flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800/80 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 dark:focus-within:ring-teal-900/40 transition-all">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment..."
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-slate-100"
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
      <AuthModal />
    </div>
  );
};

export default VideoPlayer;