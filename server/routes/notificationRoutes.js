import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Notification } from '../models/Notification.js';

const router = express.Router();

// GET /api/notifications – List notifications
router.get('/', requireAuth, async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      notifications: notifs.map(n => n.toSafeObject())
    });
  } catch (err) {
    console.error('List notifications error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications.' });
  }
});

// GET /api/notifications/unread-count – Count unread notifications
router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.id, read: false });
    res.json({ success: true, count });
  } catch (err) {
    console.error('Unread count error:', err);
    res.status(500).json({ success: false, count: 0 });
  }
});

// PATCH /api/notifications/:id/read – Mark read
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );
    res.json({ success: true, notification: notif ? notif.toSafeObject() : null });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ success: false, error: 'Failed to update notification.' });
  }
});

// PATCH /api/notifications/mark-all-read – Mark all read
router.patch('/mark-all-read', requireAuth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ success: false, error: 'Failed to update notifications.' });
  }
});

export default router;
