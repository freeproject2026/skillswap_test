// Video CRUD routes for SkillSwap
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { listVideos, findVideoById, createVideo, updateVideo, deleteVideo } from '../data/store.js';
import { Video } from '../models/Video.js';
import { User } from '../models/User.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const ensureInitialVideos = async () => {
  try {
    const count = await Video.countDocuments();
    if (count > 0) return;

    const f1 = 'vid_1792995096041.mp4';
    const f2 = 'vid_1792995506518.mp4';

    const seeded = [];
    if (fs.existsSync(path.join(UPLOADS_DIR, f1))) {
      seeded.push({
        title: 'Full-Stack Web Development & Real-Time State',
        description: 'Deep dive into real-time state management, WebSockets, MongoDB schemas, and clean full-stack architectural patterns.',
        category: 'Programming',
        duration: '18:45',
        durationSeconds: 1125,
        videoUrl: `/uploads/${f1}`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
        fileName: f1,
        fileSize: 17629816,
        mimeType: 'video/mp4',
        skillsTaught: ['React', 'Node.js', 'WebSockets', 'MongoDB'],
        level: 'Intermediate',
        language: 'English',
        visibility: 'public',
        status: 'published',
        views: 1240,
        likes: 85,
        isFeatured: true,
        creator: {
          id: 'usr_elena',
          name: 'Elena Rostova',
          username: 'elenacodes',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
          college: 'Stanford University',
          branch: 'Computer Science'
        }
      });
    }

    if (fs.existsSync(path.join(UPLOADS_DIR, f2))) {
      seeded.push({
        title: 'Mastering Modern System Design & Architecture',
        description: 'Learn how to build resilient systems, optimize database indexes, handle concurrent traffic, and implement clean distributed caching.',
        category: 'Programming',
        duration: '24:10',
        durationSeconds: 1450,
        videoUrl: `/uploads/${f2}`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80',
        fileName: f2,
        fileSize: 16893127,
        mimeType: 'video/mp4',
        skillsTaught: ['System Design', 'Backend Architecture', 'Scalability', 'Databases'],
        level: 'Advanced',
        language: 'English',
        visibility: 'public',
        status: 'published',
        views: 3120,
        likes: 198,
        isFeatured: false,
        creator: {
          id: 'usr_marcus',
          name: 'Marcus Chen',
          username: 'marcus_design',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
          college: 'UC Berkeley',
          branch: 'Software Engineering'
        }
      });
    }

    if (seeded.length > 0) {
      await Video.insertMany(seeded);
      console.log(`✅ Seeded ${seeded.length} verified videos into MongoDB.`);
    }
  } catch (err) {
    console.warn('Initial videos seeding skipped:', err.message);
  }
};

// GET /api/videos?category=...&search=...&topic=...&hashtag=...
router.get('/', optionalAuth, async (req, res) => {
  try {
    await ensureInitialVideos();
    const { category, search, topic, hashtag } = req.query;
    const videos = await listVideos({ category, search, topic: topic || hashtag });
    const userId = req.user?.id;

    // Only return public videos, plus videos this user may access.
    const visibleVideos = videos.filter((video) => {
      const visibility = video.visibility || 'public';
      const ownerId = video.creator?.id
        ? String(video.creator.id)
        : '';
      const viewerId = userId ? String(userId) : '';

      if (visibility === 'public') return true;
      if (!viewerId) return false;
      if (ownerId && ownerId === viewerId) return true;

      if (visibility === 'selected') {
        return (video.allowedStudentIds || []).some(
          (id) => String(id) === viewerId
        );
      }

      // Exchange videos stay hidden until a real exchange
      // authorization check is implemented.
      return false;
    });

    const safeVideos = visibleVideos.map((video) => {
      if (typeof video.toObject === 'function') {
        return video.toSafeObject
          ? video.toSafeObject(userId)
          : video.toObject();
      }

      return {
        ...video,
        isLiked: userId
          ? (video.likedBy || []).some((id) => String(id) === String(userId))
          : false,
        isSaved: userId
          ? (video.savedBy || []).some((id) => String(id) === String(userId))
          : false
      };
    });

    res.json({ success: true, videos: safeVideos });
  } catch (err) {
    console.error('List videos error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch videos.'
    });
  }
});

// GET /api/videos/:id – public view (visibility enforced)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    await ensureInitialVideos();
    let video = await findVideoById(req.params.id);
    if (!video) {
      // Check fallback by string alias or seeded list
      if (req.params.id === 'vid_1' || req.params.id === '1') {
        video = await Video.findOne({ isFeatured: true }) || (await Video.find({}))[0];
      } else if (req.params.id === 'vid_2' || req.params.id === '2') {
        const all = await Video.find({});
        video = all[1] || all[0];
      }
    }
    if (!video) return res.status(404).json({ success: false, error: 'Video not found.' });

    // Visibility check
    const visibility = video.visibility || (video.visibility ? video.visibility : 'public');
    const userId = req.user?.id;
    const canView =
      visibility === 'public' ||
      (visibility === 'private' && video.creator?.id === userId) ||
      (visibility === 'selected' && video.allowedStudentIds?.includes(userId));
    if (!canView) return res.status(403).json({ success: false, error: 'Not authorized to view this video.' });

    const safe = typeof video.toObject === 'function' && video.toSafeObject
      ? video.toSafeObject(userId)
      : { ...video, isLiked: false, isSaved: false };
    res.json({ success: true, video: safe });
  } catch (err) {
    console.error('Get video error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch video.' });
  }
});

// POST /api/videos – create (auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const payload = {
      ...req.body,
      creator: {
        id: user.id,
        name: user.name,
        username: user.username || '',
        avatar: user.avatar || '',
        college: user.college || '',
        branch: user.branch || ''
      },
      status: 'published', // default for now
      visibility: req.body.visibility || 'public'
    };
    const video = await createVideo(payload);
    const safe = typeof video.toObject === 'function' && video.toSafeObject
      ? video.toSafeObject(user.id)
      : video;
    res.status(201).json({ success: true, video: safe });
  } catch (err) {
    console.error('Create video error:', err);
    res.status(500).json({ success: false, error: 'Failed to create video.' });
  }
});

// PATCH /api/videos/:id – update (owner only)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const video = await findVideoById(req.params.id);
    if (!video) return res.status(404).json({ success: false, error: 'Video not found.' });
    if (video.creator?.id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the creator can edit this video.' });
    }
    const updated = await updateVideo(req.params.id, req.body);
    const safe = typeof updated.toObject === 'function' && updated.toSafeObject
      ? updated.toSafeObject(req.user.id)
      : updated;
    res.json({ success: true, video: safe });
  } catch (err) {
    console.error('Update video error:', err);
    res.status(500).json({ success: false, error: 'Failed to update video.' });
  }
});
// POST /api/videos/:id/like – toggle like (auth required)
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const video = await findVideoById(req.params.id);
    if (!video) return res.status(404).json({ success: false, error: 'Video not found.' });
    const userId = req.user.id;
    const liked = (video.likedBy || []).includes(userId);
    const updates = {};
    if (liked) {
      updates.likedBy = (video.likedBy || []).filter(id => id !== userId);
      updates.likes = Math.max(0, (video.likes || 0) - 1);
    } else {
      updates.likedBy = [...(video.likedBy || []), userId];
      updates.likes = (video.likes || 0) + 1;
    }
    const updated = await updateVideo(req.params.id, updates);
    const safe = typeof updated.toObject === 'function' && updated.toSafeObject
      ? updated.toSafeObject(userId)
      : { ...updated, isLiked: !liked };
    res.json({ success: true, ...safe });
  } catch (err) {
    console.error('Toggle like error:', err);
    res.status(500).json({ success: false, error: 'Failed to toggle like.' });
  }
});

// POST /api/videos/:id/save – toggle save (auth required)
router.post('/:id/save', requireAuth, async (req, res) => {
  try {
    const video = await findVideoById(req.params.id);
    if (!video) return res.status(404).json({ success: false, error: 'Video not found.' });
    const userId = req.user.id;
    const saved = (video.savedBy || []).includes(userId);
    const updates = {};
    if (saved) {
      updates.savedBy = (video.savedBy || []).filter(id => id !== userId);
    } else {
      updates.savedBy = [...(video.savedBy || []), userId];
    }
    const updated = await updateVideo(req.params.id, updates);
    const safe = typeof updated.toObject === 'function' && updated.toSafeObject
      ? updated.toSafeObject(userId)
      : { ...updated, isSaved: !saved };
    res.json({ success: true, ...safe });
  } catch (err) {
    console.error('Toggle save error:', err);
    res.status(500).json({ success: false, error: 'Failed to toggle save.' });
  }
});

// POST /api/videos/:id/comments – add comment (auth required)
router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Comment text cannot be empty.' });
    }
    const video = await findVideoById(req.params.id);
    if (!video) return res.status(404).json({ success: false, error: 'Video not found.' });

    const newComment = {
      id: `c_${Date.now()}`,
      authorId: req.user.id,
      author: req.user.name,
      avatar: req.user.avatar || '',
      text: text.trim(),
      likes: 0,
      createdAt: new Date()
    };

    video.comments = video.comments || [];
    video.comments.push(newComment);
    await video.save();

    res.status(201).json({
      success: true,
      comment: newComment
    });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ success: false, error: 'Failed to post comment.' });
  }
});

// DELETE /api/videos/:id – delete (owner only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const video = await findVideoById(req.params.id);
    if (!video) return res.status(404).json({ success: false, error: 'Video not found.' });
    if (video.creator?.id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the creator can delete this video.' });
    }
    const success = await deleteVideo(req.params.id);
    res.json({ success, message: success ? 'Video deleted.' : 'Delete failed.' });
  } catch (err) {
    console.error('Delete video error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete video.' });
  }
});

/**
 * GET /api/videos/:id/watch-progress
 * Returns verified watch progress for the authenticated user and rating eligibility
 */
router.get('/:id/watch-progress', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.json({
        success: true,
        progressPercentage: 0,
        maxWatchedSeconds: 0,
        eligibleToRate: false,
        userRating: null
      });
    }

    const video = await findVideoById(req.params.id);
    if (!video) return res.status(404).json({ success: false, error: 'Video not found.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const videoIdStr = String(video._id || video.id);
    const historyItem = (user.watchHistory || []).find(w => String(w.videoId) === videoIdStr);

    const progressPercentage = historyItem ? (historyItem.progressPercentage || 0) : 0;
    const maxWatchedSeconds = historyItem ? (historyItem.maxWatchedSeconds || 0) : 0;
    const eligibleToRate = progressPercentage > 60; // strictly > 60%

    const existingRating = (video.ratings || []).find(r => String(r.userId) === String(userId))?.rating || null;

    res.json({
      success: true,
      progressPercentage,
      maxWatchedSeconds,
      eligibleToRate,
      userRating: existingRating
    });
  } catch (err) {
    console.error('Get watch progress error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve watch progress.' });
  }
});

/**
 * POST /api/videos/:id/watch-progress
 * Records verified playback progress and updates authenticated user's watch time
 */
router.post('/:id/watch-progress', requireAuth, async (req, res) => {
  try {
    const { currentTime, duration } = req.body;
    const parsedCurrentTime = Number(currentTime);
    const parsedDuration = Number(duration);

    if (isNaN(parsedCurrentTime) || isNaN(parsedDuration) || parsedDuration <= 0 || parsedCurrentTime < 0) {
      return res.status(400).json({ success: false, error: 'Invalid playback parameters.' });
    }

    const video = await findVideoById(req.params.id);
    if (!video) return res.status(404).json({ success: false, error: 'Video not found.' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const videoIdStr = String(video._id || video.id);
    user.watchHistory = user.watchHistory || [];
    let historyItem = user.watchHistory.find(w => String(w.videoId) === videoIdStr);

    const boundedCurrentTime = Math.min(parsedCurrentTime, parsedDuration);
    let oldMax = 0;

    if (historyItem) {
      oldMax = historyItem.maxWatchedSeconds || 0;
    } else {
      historyItem = {
        videoId: videoIdStr,
        watchedSeconds: 0,
        maxWatchedSeconds: 0,
        durationSeconds: parsedDuration,
        progressPercentage: 0,
        lastWatchedAt: new Date()
      };
      user.watchHistory.push(historyItem);
    }

    // Only progress forward monotonically (avoid duplicate counting on seek/replay)
    const newMax = Math.max(oldMax, boundedCurrentTime);
    // Reasonable delta cap to prevent arbitrary watch-time jumps (e.g. max 30s per update ping)
    const rawDelta = Math.max(0, newMax - oldMax);
    const deltaSeconds = Math.min(rawDelta, 30);

    historyItem.maxWatchedSeconds = Number(newMax.toFixed(1));
    historyItem.watchedSeconds = (historyItem.watchedSeconds || 0) + deltaSeconds;
    historyItem.durationSeconds = parsedDuration;
    const progressPercentage = Number(((newMax / parsedDuration) * 100).toFixed(1));
    historyItem.progressPercentage = progressPercentage;
    historyItem.lastWatchedAt = new Date();

    // Persist user's total watch time
    user.watchTimeSeconds = (user.watchTimeSeconds || 0) + deltaSeconds;
    user.watchTimeMinutes = Math.floor(user.watchTimeSeconds / 60);
    user.hoursLearned = Number((user.watchTimeMinutes / 60).toFixed(1));

    user.markModified('watchHistory');
    await user.save();

    const eligibleToRate = progressPercentage > 60; // strictly > 60%

    res.json({
      success: true,
      progressPercentage,
      maxWatchedSeconds: newMax,
      duration: parsedDuration,
      eligibleToRate,
      watchTimeMinutes: user.watchTimeMinutes,
      watchTimeSeconds: user.watchTimeSeconds,
      hoursLearned: user.hoursLearned
    });
  } catch (err) {
    console.error('Update watch progress error:', err);
    res.status(500).json({ success: false, error: 'Failed to record watch progress.' });
  }
});

/**
 * POST /api/videos/:id/rate
 * Allows video rating ONLY after more than 60% is watched
 */
router.post('/:id/rate', requireAuth, async (req, res) => {
  try {
    const { rating } = req.body;
    const numericRating = Number(rating);

    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be a number between 1 and 5.' });
    }

    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, error: 'Video not found.' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const videoIdStr = String(video._id);
    const historyItem = (user.watchHistory || []).find(w => String(w.videoId) === videoIdStr);

    if (!historyItem || !historyItem.durationSeconds || historyItem.durationSeconds <= 0) {
      return res.status(403).json({
        success: false,
        error: 'Watch more than 60% of this video to rate it.',
        progressPercentage: 0,
        requiredPercentage: 60
      });
    }

    const progressPercentage = (historyItem.maxWatchedSeconds / historyItem.durationSeconds) * 100;

    // STRICT CHECK: exactly 60% is not sufficient; must be strictly greater than 60%
    if (progressPercentage <= 60) {
      return res.status(403).json({
        success: false,
        error: 'Watch more than 60% of this video to rate it.',
        progressPercentage: Number(progressPercentage.toFixed(1)),
        requiredPercentage: 60
      });
    }

    // Record rating on the Video document
    video.ratings = video.ratings || [];
    const existingIndex = video.ratings.findIndex(r => String(r.userId) === String(req.user.id));
    if (existingIndex >= 0) {
      video.ratings[existingIndex].rating = numericRating;
      video.ratings[existingIndex].createdAt = new Date();
    } else {
      video.ratings.push({
        userId: String(req.user.id),
        rating: numericRating,
        createdAt: new Date()
      });
    }

    video.ratingCount = video.ratings.length;
    const totalScore = video.ratings.reduce((acc, r) => acc + r.rating, 0);
    video.rating = Number((totalScore / video.ratingCount).toFixed(1));
    await video.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully!',
      rating: video.rating,
      ratingCount: video.ratingCount,
      userRating: numericRating
    });
  } catch (err) {
    console.error('Rate video error:', err);
    res.status(500).json({ success: false, error: 'Failed to record rating.' });
  }
});

export default router;