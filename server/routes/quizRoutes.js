// Quiz CRUD routes for SkillSwap
import express from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { listQuizzes, findQuizById, createQuiz, updateQuiz, deleteQuiz } from '../data/store.js';

const router = express.Router();

// GET /api/quizzes?subject=...&level=...
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { subject, level } = req.query;
    const quizzes = await listQuizzes({ subject, level });

    const safeQuizzes = quizzes.map(q => {
      if (typeof q.toObject === 'function' && q.toSafeObject) return q.toSafeObject();
      return { ...q };
    });

    res.json({ success: true, quizzes: safeQuizzes });
  } catch (err) {
    console.error('List quizzes error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch quizzes.' });
  }
});

// GET /api/quizzes/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const quiz = await findQuizById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found.' });

    const safe = typeof quiz.toObject === 'function' && quiz.toSafeObject
      ? quiz.toSafeObject()
      : { ...quiz };

    res.json({ success: true, quiz: safe });
  } catch (err) {
    console.error('Get quiz error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch quiz.' });
  }
});

// POST /api/quizzes – create (auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { title, description, topic, category, level, questions } = req.body;

    if (!title || !topic || !category) {
      return res.status(400).json({ success: false, error: 'Title, topic, and category are required.' });
    }
    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one question is required.' });
    }

    const payload = {
      title,
      description: description || '',
      topic,
      category,
      level: level || 'Beginner',
      questions,
      creator: {
        id: user.id,
        name: user.name,
        avatar: user.avatar || ''
      },
      status: 'published'
    };

    const quiz = await createQuiz(payload);
    const safe = typeof quiz.toObject === 'function' && quiz.toSafeObject
      ? quiz.toSafeObject()
      : quiz;

    res.status(201).json({ success: true, quiz: safe });
  } catch (err) {
    console.error('Create quiz error:', err);
    res.status(500).json({ success: false, error: 'Failed to create quiz.' });
  }
});

// PATCH /api/quizzes/:id – update (owner only)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const quiz = await findQuizById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found.' });

    if (quiz.creator?.id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the creator can edit this quiz.' });
    }

    const updated = await updateQuiz(req.params.id, req.body);
    const safe = typeof updated.toObject === 'function' && updated.toSafeObject
      ? updated.toSafeObject()
      : updated;

    res.json({ success: true, quiz: safe });
  } catch (err) {
    console.error('Update quiz error:', err);
    res.status(500).json({ success: false, error: 'Failed to update quiz.' });
  }
});

// DELETE /api/quizzes/:id – delete (owner only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const quiz = await findQuizById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found.' });

    if (quiz.creator?.id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the creator can delete this quiz.' });
    }

    const success = await deleteQuiz(req.params.id);
    res.json({ success, message: success ? 'Quiz deleted.' : 'Delete failed.' });
  } catch (err) {
    console.error('Delete quiz error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete quiz.' });
  }
});

export default router;
