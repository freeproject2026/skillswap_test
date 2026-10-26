import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Conversation } from '../models/Conversation.js';

const router = express.Router();

// GET /api/chat/conversations – List conversations for current user
router.get('/conversations', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({
      participants: userId
    }).sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      conversations: conversations.map(c => c.toSafeObject(userId))
    });
  } catch (err) {
    console.error('List conversations error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve conversations.' });
  }
});

// GET /api/chat/conversations/:participantId – Get or initialize conversation with a user
router.get('/conversations/:participantId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { participantId } = req.params;

    let conv = await Conversation.findOne({
      participants: { $all: [userId, participantId] }
    });

    if (!conv) {
      conv = new Conversation({
        participants: [userId, participantId],
        lastMessage: 'Conversation started',
        lastMessageAt: new Date(),
        messages: []
      });
      await conv.save();
    }

    res.json({
      success: true,
      conversation: conv.toSafeObject(userId)
    });
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({ success: false, error: 'Failed to load conversation.' });
  }
});

// POST /api/chat/conversations/:id/messages – Send a message
router.post('/conversations/:id/messages', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { text, type, sessionData } = req.body;

    if (!text && !sessionData) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
    }

    const conv = await Conversation.findById(req.params.id);
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }

    if (!conv.participants.includes(userId)) {
      return res.status(403).json({ success: false, error: 'Unauthorized to post to this conversation.' });
    }

    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: userId,
      text: text || '',
      type: type || 'text',
      sessionData: sessionData || null,
      timestamp: new Date()
    };

    conv.messages.push(newMsg);
    conv.lastMessage = text || (type === 'session_proposal' ? 'Proposed a learning session' : 'Sent a message');
    conv.lastMessageAt = new Date();

    await conv.save();

    res.status(201).json({
      success: true,
      message: newMsg,
      conversation: conv.toSafeObject(userId)
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ success: false, error: 'Failed to deliver message.' });
  }
});

export default router;
