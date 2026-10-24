import express from 'express';
import { listUsers, findUserById, updateUser } from '../data/store.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users
 * Permitted for both guests and authenticated users
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search } = req.query;
    let users = await listUsers();

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.college?.toLowerCase().includes(q) ||
        u.skillsOffered?.some(s => s.name.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'All Categories') {
      users = users.filter(u =>
        u.skillsOffered?.some(s => s.category === category)
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
 * Requires valid authenticated student session
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    // Disallow modifying sensitive fields directly via profile update
    delete updates.password;
    delete updates.passwordHash;
    delete updates.creditsBalance;
    delete updates.creditsEscrow;
    delete updates.role;
    delete updates.email;

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

export default router;
