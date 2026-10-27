import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Conversation } from '../models/Conversation.js';
import { findUserById } from '../data/store.js';

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

/**
 * GET /api/chat/conversations/:id/messages
 * Poll for messages. Supports ?since=<ISO timestamp> to return only new messages.
 * Used by the frontend for real-time polling fallback.
 */
router.get('/conversations/:id/messages', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conv = await Conversation.findById(req.params.id);
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }
    if (!conv.participants.includes(userId)) {
      return res.status(403).json({ success: false, error: 'Unauthorized to read this conversation.' });
    }

    const safe = conv.toSafeObject(userId);
    let messages = safe.messages || [];

    // If ?since= is provided, only return messages newer than that timestamp
    const since = req.query.since;
    if (since) {
      const sinceTime = new Date(since).getTime();
      if (!isNaN(sinceTime)) {
        messages = messages.filter(m => {
          const t = m.timestamp ? new Date(m.timestamp).getTime() : 0;
          return t > sinceTime;
        });
      }
    }

    res.json({
      success: true,
      messages,
      lastMessageAt: conv.lastMessageAt
    });
  } catch (err) {
    console.error('Poll messages error:', err);
    res.status(500).json({ success: false, error: 'Failed to poll messages.' });
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

    // Fetch sender info to embed name & avatar in the message record
    let senderName = req.user.name || '';
    let senderAvatar = req.user.avatar || '';
    try {
      const senderUser = await findUserById(userId);
      if (senderUser) {
        senderName = senderUser.name || senderName;
        senderAvatar = senderUser.avatar || senderAvatar;
      }
    } catch (_e) {
      // Non-fatal – message still sends even if user lookup fails
    }

    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      senderId: userId,
      senderName,
      senderAvatar,
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
