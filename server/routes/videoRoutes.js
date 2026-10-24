// Video CRUD routes for SkillSwap
import express from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { listVideos, findVideoById, createVideo, updateVideo, deleteVideo } from '../data/store.js';

const router = express.Router();

// GET /api/videos?category=...&search=...
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search } = req.query;
    const videos = await listVideos({ category, search });
    // Attach user‑specific flags (liked/saved) if user is present
    const currentUserId = req.user?.id;
    const safeVideos = videos.map(v => {
      if (typeof v.toObject === 'function') {
        // Mongoose doc
        return v.toSafeObject ? v.toSafeObject(currentUserId) : v.toObject();
      }
      // In‑memory plain object
      const isLiked = currentUserId ? (v.likedBy || []).includes(currentUserId) : false;
      const isSaved = currentUserId ? (v.savedBy || []).includes(currentUserId) : false;
      return { ...v, isLiked, isSaved };
    });
    res.json({ success: true, videos: safeVideos });
  } catch (err) {
    console.error('List videos error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch videos.' });
  }
});

// GET /api/videos/:id – public view (visibility enforced)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const video = await findVideoById(req.params.id);
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

// DELETE /api/videos/:id – delete (owner only)
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

export default router;