// Video file upload route — handles multipart/form-data via multer
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { requireAuth } from '../middleware/auth.js';
import { createVideo } from '../data/store.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer storage — save with original extension, unique name
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `vid_${Date.now()}${ext}`);
  }
});

// Only allow video mime types
const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (MP4, WebM, MOV, AVI, MKV).'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500 MB max
});

/**
 * POST /api/upload/video
 * Accepts multipart/form-data with fields:
 *   - video  (file, required)
 *   - title, description, category, skills, visibility, level, language (text)
 */
router.post('/video', requireAuth, (req, res) => {
  upload.single('video')(req, res, async (err) => {
    // Handle multer errors (file type, size, etc.)
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, error: 'File too large. Maximum size is 500 MB.' });
      }
      return res.status(400).json({ success: false, error: err.message || 'File upload error.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file provided.' });
    }

    const { title, description, category, skills, visibility, level, language } = req.body;

    if (!title || !title.trim()) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'Title is required.' });
    }

    try {
      const user = req.user;

      // Build a publicly accessible URL for the video
      // In production, replace this with your CDN/cloud storage URL
      const videoUrl = `/uploads/${req.file.filename}`;

      const skillsTaught = skills
        ? skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const videoData = {
        title: title.trim(),
        description: description?.trim() || '',
        category: category || 'Education',
        videoUrl,
        thumbnailUrl: '',
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        skillsTaught,
        level: level || 'Beginner',
        language: language || 'English',
        visibility: visibility || 'public',
        status: 'published',
        views: 0,
        likes: 0,
        creator: {
          id: user.id,
          name: user.name,
          username: user.username || '',
          avatar: user.avatar || '',
          college: user.college || '',
          branch: user.branch || ''
        }
      };

      const video = await createVideo(videoData);

      const safe = typeof video.toObject === 'function' && video.toSafeObject
        ? video.toSafeObject(user.id)
        : video;

      res.status(201).json({
        success: true,
        message: 'Video uploaded and published successfully.',
        video: safe
      });
    } catch (dbErr) {
      // If DB save fails, clean up the uploaded file
      fs.unlinkSync(req.file.path);
      console.error('Video DB save error:', dbErr);
      res.status(500).json({ success: false, error: 'Failed to save video record. Upload rolled back.' });
    }
  });
});

export default router;
