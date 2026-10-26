import express from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { ProofTask } from '../models/ProofTask.js';
import { User } from '../models/User.js';

const router = express.Router();

// GET /api/proof – List proof tasks
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    const query = userId ? { userId } : {};
    const tasks = await ProofTask.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks: tasks.map(t => t.toSafeObject())
    });
  } catch (err) {
    console.error('List proof tasks error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve proof tasks.' });
  }
});

// POST /api/proof – Create proof task
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, skill, verificationType, projectUrl, description } = req.body;
    if (!title || !skill) {
      return res.status(400).json({ success: false, error: 'Title and skill are required.' });
    }

    const task = new ProofTask({
      userId: req.user.id,
      title: title.trim(),
      skill: skill.trim(),
      verificationType: verificationType || 'Project Code Repository',
      projectUrl: projectUrl || '',
      description: description || '',
      status: 'Verified',
      endorsedBy: [{
        id: req.user.id,
        name: req.user.name,
        avatar: req.user.avatar || '',
        role: 'Author Submission'
      }]
    });

    await task.save();

    // Link evidence to student's offered skills and increment verified task count
    try {
      await User.updateOne(
        { _id: req.user.id, 'skillsOffered.name': new RegExp(`^${skill.trim()}$`, 'i') },
        {
          $set: { 'skillsOffered.$.evidenceStatus': 'Practical Task Completed' },
          $inc: { tasksApprovedCount: 1 }
        }
      );
    } catch (uErr) {
      console.error('Update user proof stats error:', uErr);
    }

    res.status(201).json({
      success: true,
      message: 'Proof task registered successfully.',
      task: task.toSafeObject()
    });
  } catch (err) {
    console.error('Create proof task error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit proof task.' });
  }
});

export default router;
