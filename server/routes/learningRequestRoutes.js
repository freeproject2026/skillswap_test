import express from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { LearningRequest } from '../models/LearningRequest.js';

const router = express.Router();

// GET /api/learning-requests – List requests with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, format, search } = req.query;
    const query = {};

    if (category && category !== 'All Categories') {
      query.category = category;
    }

    if (format && format !== 'All') {
      query.format = { $regex: format, $options: 'i' };
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { skill: { $regex: q, $options: 'i' } },
        { authorName: { $regex: q, $options: 'i' } }
      ];
    }

    const requests = await LearningRequest.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      requests: requests.map(r => r.toSafeObject())
    });
  } catch (err) {
    console.error('List learning requests error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch learning requests.' });
  }
});

// POST /api/learning-requests – Create new request
router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const {
      title,
      description,
      skill,
      category,
      currentProficiency,
      targetProficiency,
      learningGoal,
      desiredOutcome,
      preferredSchedule,
      language,
      format,
      proposedCredits
    } = req.body;

    if (!title || !description || !skill) {
      return res.status(400).json({ success: false, error: 'Title, description, and skill are required.' });
    }

    const request = new LearningRequest({
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar || '',
      authorCollege: user.college || 'Campus Student',
      title: title.trim(),
      description: description.trim(),
      skill: skill.trim(),
      category: category || 'General',
      currentProficiency: currentProficiency || 'Beginner',
      targetProficiency: targetProficiency || 'Intermediate',
      learningGoal: learningGoal || '',
      desiredOutcome: desiredOutcome || '',
      preferredSchedule: preferredSchedule || 'Weekday Evenings',
      language: language || 'English',
      format: format || 'Live Online Session',
      proposedCredits: Number(proposedCredits) || 40,
      responses: []
    });

    await request.save();

    res.status(201).json({
      success: true,
      message: 'Learning request posted successfully!',
      request: request.toSafeObject()
    });
  } catch (err) {
    console.error('Create learning request error:', err);
    res.status(500).json({ success: false, error: 'Failed to create learning request.' });
  }
});

// POST /api/learning-requests/:id/respond – Respond to request
router.post('/:id/respond', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Response message cannot be empty.' });
    }

    const request = await LearningRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Learning request not found.' });
    }

    request.responses.push({
      responderId: user.id,
      responderName: user.name,
      responderAvatar: user.avatar || '',
      message: message.trim(),
      createdAt: new Date()
    });

    await request.save();

    res.json({
      success: true,
      message: 'Response sent to author!',
      request: request.toSafeObject()
    });
  } catch (err) {
    console.error('Respond to request error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit response.' });
  }
});

export default router;
