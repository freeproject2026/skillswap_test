import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = express.Router();

// GET /api/connections/status – Get current user's connections and following
router.get('/status', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const statusMap = {};
    (user.connections || []).forEach(c => {
      statusMap[c.userId] = c.status;
    });

    res.json({
      success: true,
      statuses: statusMap,
      following: user.following || []
    });
  } catch (err) {
    console.error('Connection status error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch connection status.' });
  }
});

// POST /api/connections/request/:targetUserId – Send connection request
router.post('/request/:targetUserId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    if (userId === targetUserId) {
      return res.status(400).json({ success: false, error: 'Cannot connect with yourself.' });
    }

    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId)
    ]);

    if (!user || !targetUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Set connection status on both users using atomic operators to prevent VersionError
    await Promise.all([
      User.updateOne(
        { _id: userId },
        {
          $pull: { connections: { userId: targetUserId } }
        }
      ).then(() =>
        User.updateOne(
          { _id: userId },
          { $push: { connections: { userId: targetUserId, status: 'pending', initiatedByMe: true } } }
        )
      ),
      User.updateOne(
        { _id: targetUserId },
        {
          $pull: { connections: { userId } }
        }
      ).then(() =>
        User.updateOne(
          { _id: targetUserId },
          { $push: { connections: { userId, status: 'pending', initiatedByMe: false } } }
        )
      )
    ]);

    res.json({ success: true, message: 'Connection request sent.' });
  } catch (err) {
    console.error('Send request error:', err);
    res.status(500).json({ success: false, error: 'Failed to send connection request.' });
  }
});

// POST /api/connections/accept/:targetUserId – Accept connection request
router.post('/accept/:targetUserId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    await Promise.all([
      User.updateOne(
        { _id: userId },
        { $pull: { connections: { userId: targetUserId } } }
      ).then(() =>
        User.updateOne(
          { _id: userId },
          { $push: { connections: { userId: targetUserId, status: 'connected', initiatedByMe: false } } }
        )
      ),
      User.updateOne(
        { _id: targetUserId },
        { $pull: { connections: { userId } } }
      ).then(() =>
        User.updateOne(
          { _id: targetUserId },
          { $push: { connections: { userId, status: 'connected', initiatedByMe: true } } }
        )
      )
    ]);

    res.json({ success: true, message: 'Connection accepted!' });
  } catch (err) {
    console.error('Accept connection error:', err);
    res.status(500).json({ success: false, error: 'Failed to accept connection.' });
  }
});

// POST /api/connections/decline/:targetUserId – Decline connection request
router.post('/decline/:targetUserId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    await Promise.all([
      User.updateOne({ _id: userId }, { $pull: { connections: { userId: targetUserId } } }),
      User.updateOne({ _id: targetUserId }, { $pull: { connections: { userId } } })
    ]);

    res.json({ success: true, message: 'Connection dismissed.' });
  } catch (err) {
    console.error('Decline connection error:', err);
    res.status(500).json({ success: false, error: 'Failed to dismiss connection.' });
  }
});

// POST /api/connections/follow/:targetUserId – Toggle follow creator
router.post('/follow/:targetUserId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const following = user.following || [];
    const isNowFollowing = !following.includes(targetUserId);

    const updateOp = isNowFollowing
      ? { $addToSet: { following: targetUserId } }
      : { $pull: { following: targetUserId } };

    const updated = await User.findByIdAndUpdate(userId, updateOp, { new: true });

    res.json({
      success: true,
      isFollowing: isNowFollowing,
      following: updated?.following || []
    });
  } catch (err) {
    console.error('Toggle follow error:', err);
    res.status(500).json({ success: false, error: 'Failed to toggle follow status.' });
  }
});

export default router;
