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

    // Set connection status on both users
    const existingIdx = (user.connections || []).findIndex(c => c.userId === targetUserId);
    if (existingIdx !== -1) {
      user.connections[existingIdx].status = 'pending';
    } else {
      user.connections.push({ userId: targetUserId, status: 'pending', initiatedByMe: true });
    }

    const targetIdx = (targetUser.connections || []).findIndex(c => c.userId === userId);
    if (targetIdx !== -1) {
      targetUser.connections[targetIdx].status = 'pending';
    } else {
      targetUser.connections.push({ userId, status: 'pending', initiatedByMe: false });
    }

    await Promise.all([user.save(), targetUser.save()]);

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

    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId)
    ]);

    if (!user || !targetUser) return res.status(404).json({ success: false, error: 'User not found.' });

    const c1 = user.connections.find(c => c.userId === targetUserId);
    if (c1) c1.status = 'connected';
    else user.connections.push({ userId: targetUserId, status: 'connected', initiatedByMe: false });

    const c2 = targetUser.connections.find(c => c.userId === userId);
    if (c2) c2.status = 'connected';
    else targetUser.connections.push({ userId, status: 'connected', initiatedByMe: true });

    await Promise.all([user.save(), targetUser.save()]);

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

    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId)
    ]);

    if (user) {
      user.connections = (user.connections || []).filter(c => c.userId !== targetUserId);
      await user.save();
    }
    if (targetUser) {
      targetUser.connections = (targetUser.connections || []).filter(c => c.userId !== userId);
      await targetUser.save();
    }

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
    const idx = following.indexOf(targetUserId);
    let isNowFollowing = false;

    if (idx === -1) {
      user.following.push(targetUserId);
      isNowFollowing = true;
    } else {
      user.following.splice(idx, 1);
      isNowFollowing = false;
    }

    await user.save();

    res.json({
      success: true,
      isFollowing: isNowFollowing,
      following: user.following
    });
  } catch (err) {
    console.error('Toggle follow error:', err);
    res.status(500).json({ success: false, error: 'Failed to toggle follow status.' });
  }
});

export default router;
