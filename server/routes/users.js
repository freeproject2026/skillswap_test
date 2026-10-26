import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { listUsers, findUserById, updateUser } from '../data/store.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure uploads directory exists for avatars
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer storage for profile photos
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `avatar_${req.user?.id || 'usr'}_${Date.now()}${ext}`);
  }
});

const avatarFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, WebP, GIF).'), false);
  }
};

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});

/**
 * GET /api/users
 * Permitted for both guests and authenticated users. Supports category, search, skill, topic, and hashtag filtering.
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, skill, topic, hashtag } = req.query;
    let users = await listUsers();

    if (search) {
      const q = search.trim().toLowerCase();
      users = users.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.college?.toLowerCase().includes(q) ||
        u.branch?.toLowerCase().includes(q) ||
        u.skillsOffered?.some(s => (typeof s === 'string' ? s : s?.name)?.toLowerCase().includes(q)) ||
        u.skillsWanted?.some(s => (typeof s === 'string' ? s : s?.name)?.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'All Categories' && category !== 'All') {
      users = users.filter(u =>
        u.skillsOffered?.some(s => (s?.category || s?.name || '')?.toLowerCase() === category.toLowerCase())
      );
    }

    const filterTopic = (skill || topic || hashtag || '').replace(/^#/, '').trim().toLowerCase();
    if (filterTopic) {
      users = users.filter(u =>
        u.skillsOffered?.some(s => (typeof s === 'string' ? s : s?.name)?.toLowerCase().includes(filterTopic)) ||
        u.skillsWanted?.some(s => (typeof s === 'string' ? s : s?.name)?.toLowerCase().includes(filterTopic)) ||
        u.name?.toLowerCase().includes(filterTopic)
      );
    }

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve student profiles.' });
  }
});

/**
 * GET /api/users/profile
 * Authenticated user profile retrieval
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }
    const safeUser = user.toSafeObject ? user.toSafeObject() : { ...user };
    delete safeUser.passwordHash;
    res.json({
      success: true,
      user: safeUser
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, error: 'Failed to load profile.' });
  }
});

/**
 * GET /api/users/:id
 * Public profile inspection
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Student profile not found.' });
    }

    const safeUser = user.toSafeObject ? user.toSafeObject() : { ...user };
    delete safeUser.passwordHash;

    res.json({
      success: true,
      user: safeUser
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ success: false, error: 'Failed to load profile.' });
  }
});

/**
 * PUT /api/users/profile
 * Requires valid authenticated student session.
 * Preserves unchanged fields and ignores empty/undefined values.
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Disallow modifying sensitive / system-controlled fields directly via profile update
    delete updates.password;
    delete updates.passwordHash;
    delete updates.creditsBalance;
    delete updates.creditsEscrow;
    delete updates.tokens;
    delete updates.earnedTokens;
    delete updates.spentTokens;
    delete updates.role;
    delete updates.email;
    delete updates._id;
    delete updates.id;

    // Validate name if provided
    if (updates.name !== undefined && !updates.name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name cannot be empty.' });
    }

    const updatedUser = await updateUser(req.user.id, updates);
    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    res.json({
      success: true,
      message: 'Student profile updated successfully.',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, error: 'Failed to update student profile.' });
  }
});

/**
 * POST /api/users/avatar
 * Uploads user profile photo, saves to uploads, and updates MongoDB profile.
 */
router.post('/avatar', requireAuth, (req, res) => {
  uploadAvatar.single('avatar')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, error: 'Image file too large. Maximum size is 5 MB.' });
      }
      return res.status(400).json({ success: false, error: err.message || 'Image upload error.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided.' });
    }

    try {
      const avatarUrl = `/uploads/${req.file.filename}`;
      const updatedUser = await updateUser(req.user.id, { avatar: avatarUrl });
      if (!updatedUser) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      res.json({
        success: true,
        message: 'Profile photo updated successfully.',
        avatar: avatarUrl,
        avatarUrl: avatarUrl,
        user: updatedUser
      });
    } catch (dbErr) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      console.error('Avatar DB save error:', dbErr);
      res.status(500).json({ success: false, error: 'Failed to update profile photo in database.' });
    }
  });
});

export default router;
