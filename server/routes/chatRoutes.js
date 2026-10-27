import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Conversation } from '../models/Conversation.js';
import { Notification } from '../models/Notification.js';
import { findUserById } from '../data/store.js';

const router = express.Router();

// Fallback directory for known mock peers
const KNOWN_PEERS = {
  usr_1: {
    id: 'usr_1',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    college: 'Stanford University',
    branch: 'Computer Science',
    status: 'online'
  },
  usr_2: {
    id: 'usr_2',
    name: 'Carlos Mendoza',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    college: 'UC Berkeley',
    branch: 'Linguistics & CS',
    status: 'online'
  },
  usr_3: {
    id: 'usr_3',
    name: 'Dr. Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    college: 'MIT',
    branch: 'Artificial Intelligence',
    status: 'online'
  }
};

const resolveParticipant = async (participantId) => {
  if (!participantId) return null;
  try {
    const userDoc = await findUserById(participantId);
    if (userDoc) {
      return {
        id: userDoc.id || userDoc._id?.toString(),
        name: userDoc.name,
        avatar: userDoc.avatar || '',
        college: userDoc.college || 'Student',
        branch: userDoc.branch || '',
        status: 'online'
      };
    }
  } catch (_e) {
    // Non-fatal
  }
  return KNOWN_PEERS[participantId] || {
    id: participantId,
    name: 'Campus Student',
    avatar: '',
    college: 'Student',
    branch: '',
    status: 'online'
  };
};

// GET /api/chat/unread-count – Total unread messages count for current user
router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user.id);
    const convs = await Conversation.find({ participants: userId });
    let unreadCount = 0;
    for (const c of convs) {
      for (const m of (c.messages || [])) {
        if (String(m.senderId) !== userId && !m.read) {
          unreadCount++;
        }
      }
    }
    res.json({ success: true, count: unreadCount });
  } catch (err) {
    console.error('Chat unread count error:', err);
    res.status(500).json({ success: false, count: 0 });
  }
});

// GET /api/chat/conversations – List conversations for current user
router.get('/conversations', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user.id);
    let conversations = await Conversation.find({
      participants: userId
    }).sort({ lastMessageAt: -1 });

    // If user has no conversations yet, seed initial conversation with Elena Rostova (usr_1)
    if (conversations.length === 0 && userId !== 'usr_1') {
      try {
        const seedPartner = 'usr_1';
        const initialConv = new Conversation({
          participants: [userId, seedPartner],
          lastMessage: 'I reviewed your Three.js shaders draft. The lighting coordinates look so much smoother now!',
          lastMessageAt: new Date(Date.now() - 12 * 60 * 1000),
          messages: [
            {
              id: `msg_seed_1_${userId}`,
              senderId: userId,
              senderName: req.user.name || 'You',
              senderAvatar: req.user.avatar || '',
              text: 'Hi Elena! I loved your Three.js video tutorial. I am working on an interactive 3D particle canvas and hitting an issue with GLSL shaders.',
              type: 'text',
              read: true,
              timestamp: new Date(Date.now() - 60 * 60 * 1000)
            },
            {
              id: `msg_seed_2_${userId}`,
              senderId: seedPartner,
              senderName: 'Elena Rostova',
              senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
              text: 'I reviewed your Three.js shaders draft. The lighting coordinates look so much smoother now!',
              type: 'text',
              read: false,
              timestamp: new Date(Date.now() - 12 * 60 * 1000)
            }
          ]
        });
        await initialConv.save();
        conversations = await Conversation.find({ participants: userId }).sort({ lastMessageAt: -1 });
      } catch (seedErr) {
        console.warn('Initial conversation seed warning:', seedErr.message);
      }
    }

    // Attach populated participant details and compute unread counts
    const populated = await Promise.all(
      conversations.map(async (c) => {
        const safe = c.toSafeObject(userId);
        const participantId = safe.participantId;
        safe.participant = await resolveParticipant(participantId);
        return safe;
      })
    );

    res.json({
      success: true,
      conversations: populated
    });
  } catch (err) {
    console.error('List conversations error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve conversations.' });
  }
});

// GET /api/chat/conversations/:participantId – Get or initialize conversation with a user
router.get('/conversations/:participantId', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user.id);
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
    } else {
      // Mark messages received from participant as read
      let modified = false;
      (conv.messages || []).forEach(m => {
        if (String(m.senderId) !== userId && !m.read) {
          m.read = true;
          modified = true;
        }
      });
      if (modified) {
        await conv.save();
      }
    }

    const safe = conv.toSafeObject(userId);
    safe.participant = await resolveParticipant(participantId);

    res.json({
      success: true,
      conversation: safe
    });
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({ success: false, error: 'Failed to load conversation.' });
  }
});

/**
 * GET /api/chat/conversations/:id/messages
 * Poll for messages. Supports ?since=<ISO timestamp> to return only new messages.
 * Automatically marks incoming messages as read when fetched.
 */
router.get('/conversations/:id/messages', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user.id);
    const conv = await Conversation.findById(req.params.id);
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }
    if (!conv.participants.includes(userId)) {
      return res.status(403).json({ success: false, error: 'Unauthorized to read this conversation.' });
    }

    // Mark incoming unread messages as read
    let modified = false;
    (conv.messages || []).forEach(m => {
      if (String(m.senderId) !== userId && !m.read) {
        m.read = true;
        modified = true;
      }
    });
    if (modified) {
      await conv.save();
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

// POST /api/chat/conversations/:id/messages – Send a message & dispatch in-app notification
router.post('/conversations/:id/messages', requireAuth, async (req, res) => {
  try {
    const userId = String(req.user.id);
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
    let senderName = req.user.name || 'Peer';
    let senderAvatar = req.user.avatar || '';
    try {
      const senderUser = await findUserById(userId);
      if (senderUser) {
        senderName = senderUser.name || senderName;
        senderAvatar = senderUser.avatar || senderAvatar;
      }
    } catch (_e) {
      // Non-fatal
    }

    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      senderId: userId,
      senderName,
      senderAvatar,
      text: text || '',
      type: type || 'text',
      sessionData: sessionData || null,
      read: false,
      timestamp: new Date()
    };

    conv.messages.push(newMsg);
    conv.lastMessage = text || (type === 'session_proposal' ? 'Proposed a learning session' : 'Sent a message');
    conv.lastMessageAt = new Date();

    await conv.save();

    // Create in-app notification for the recipient so they get notified with unread counts
    const recipientId = conv.participants.find(p => String(p) !== userId);
    if (recipientId) {
      try {
        const notifTitle = `New message from ${senderName}`;
        const notifBody = text ? (text.length > 80 ? text.slice(0, 77) + '...' : text) : 'Sent a session proposal';
        await Notification.create({
          userId: String(recipientId),
          type: 'message',
          title: notifTitle,
          message: notifBody,
          read: false,
          actionUrl: `/connect/chat/${userId}`,
          sender: {
            id: userId,
            name: senderName,
            avatar: senderAvatar
          },
          metadata: {
            conversationId: conv.id || conv._id?.toString(),
            senderId: userId,
            messageId: newMsg.id
          }
        });
      } catch (notifErr) {
        console.warn('Failed to dispatch message notification:', notifErr.message);
      }
    }

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
