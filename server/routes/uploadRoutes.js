// Video file upload route — handles multipart/form-data via multer
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { requireAuth } from '../middleware/auth.js';
import { createVideo, findUserById } from '../data/store.js';

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
    const prefix = file.fieldname === 'thumbnail' ? 'thumb_' : 'vid_';
    cb(null, `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`);
  }
});

// Allow video and image mime types based on field
const fileFilter = (_req, file, cb) => {
  if (file.fieldname === 'video') {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for video (MP4, WebM, MOV, AVI, MKV).'), false);
    }
  } else if (file.fieldname === 'thumbnail') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnail (JPEG, PNG, WebP).'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500 MB max
});

const uploadFields = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

/**
 * POST /api/upload/video
 * Accepts multipart/form-data with fields:
 *   - video  (file, required)
 *   - thumbnail (file, optional)
 *   - title, description, category, skills, visibility, level, language (text)
 */
router.post('/video', requireAuth, (req, res) => {
  uploadFields(req, res, async (err) => {
    // Handle multer errors (file type, size, etc.)
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, error: 'File too large. Maximum size is 500 MB.' });
      }
      return res.status(400).json({ success: false, error: err.message || 'File upload error.' });
    }

    const videoFile = req.files?.video?.[0] || req.file;
    const thumbFile = req.files?.thumbnail?.[0];

    if (!videoFile) {
      return res.status(400).json({ success: false, error: 'No video file provided.' });
    }

    const { title, description, category, skills, visibility, level, language } = req.body;

    if (!title || !title.trim()) {
      if (fs.existsSync(videoFile.path)) fs.unlinkSync(videoFile.path);
      if (thumbFile && fs.existsSync(thumbFile.path)) fs.unlinkSync(thumbFile.path);
      return res.status(400).json({ success: false, error: 'Title is required.' });
    }

    try {
      const userDoc = await findUserById(req.user.id);
      const videoUrl = `/uploads/${videoFile.filename}`;
      const thumbnailUrl = thumbFile ? `/uploads/${thumbFile.filename}` : '';

      const skillsTaught = skills
        ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean))
        : [];

      const videoData = {
        title: title.trim(),
        description: description?.trim() || '',
        category: category || 'Education',
        videoUrl,
        thumbnailUrl,
        fileName: videoFile.originalname,
        fileSize: videoFile.size,
        mimeType: videoFile.mimetype,
        skillsTaught,
        level: level || 'Beginner',
        language: language || 'English',
        visibility: visibility || 'public',
        status: 'published',
        views: 0,
        likes: 0,
        creator: {
          id: req.user.id,
          name: userDoc?.name || req.user.name || 'Student Creator',
          username: userDoc?.username || req.user.username || '',
          avatar: userDoc?.avatar || req.user.avatar || '',
          college: userDoc?.college || 'Campus Student',
          branch: userDoc?.branch || 'General Studies'
        }
      };

      const video = await createVideo(videoData);

      const safe = typeof video.toObject === 'function' && video.toSafeObject
        ? video.toSafeObject(req.user.id)
        : video;

      res.status(201).json({
        success: true,
        message: 'Video uploaded and published successfully.',
        video: safe
      });
    } catch (dbErr) {
      if (fs.existsSync(videoFile.path)) fs.unlinkSync(videoFile.path);
      if (thumbFile && fs.existsSync(thumbFile.path)) fs.unlinkSync(thumbFile.path);
      console.error('Video DB save error:', dbErr);
      res.status(500).json({ success: false, error: 'Failed to save video record. Upload rolled back.' });
    }
  });
});

export default router;
