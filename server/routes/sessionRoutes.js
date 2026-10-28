import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { Notification } from '../models/Notification.js';

const router = express.Router();

// GET /api/sessions – List sessions for current user
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const query = {
      $or: [{ tutorId: userId }, { studentId: userId }]
    };

    if (status && status !== 'All') {
      query.status = status;
    }

    const sessions = await Session.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      sessions: sessions.map(s => s.toSafeObject())
    });
  } catch (err) {
    console.error('List sessions error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch learning sessions.' });
  }
});

// GET /api/sessions/:id – Get session by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    // Authorization: User must be either the tutor or the student
    if (session.tutorId !== req.user.id && session.studentId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view this session.' });
    }

    res.json({ success: true, session: session.toSafeObject() });
  } catch (err) {
    console.error('Get session error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve session details.' });
  }
});

// POST /api/sessions – Book a new session
router.post('/', requireAuth, async (req, res) => {
  try {
    const student = req.user;
    const {
      tutorId,
      tutorName,
      tutorAvatar,
      tutorCollege,
      skill,
      sessionType,
      scheduledDate,
      scheduledTime,
      durationMinutes,
      creditCost,
      format,
      learningObjective
    } = req.body;

    if (!tutorId || !skill) {
      return res.status(400).json({ success: false, error: 'Tutor and skill are required.' });
    }

    if (String(tutorId) === String(student.id)) {
      return res.status(400).json({ success: false, error: 'You cannot book a session with yourself.' });
    }

    // Verify recipient/tutor exists
    const tutorDoc = await User.findById(tutorId);
    if (!tutorDoc) {
      return res.status(404).json({ success: false, error: 'Recipient tutor profile not found.' });
    }

    const sDate = scheduledDate || 'This Weekend';
    const sTime = scheduledTime || '6:00 PM';

    // Check for duplicate pending/accepted booking or time conflict between student and tutor
    const existingConflict = await Session.findOne({
      tutorId,
      studentId: student.id,
      skill,
      scheduledDate: sDate,
      scheduledTime: sTime,
      status: { $in: ['Pending', 'Accepted', 'Upcoming'] }
    });

    if (existingConflict) {
      return res.status(400).json({
        success: false,
        error: 'A session booking with this tutor for the same skill and time already exists.'
      });
    }

    const cost = Number(creditCost) || 0;

    // Check student's balance if session requires credits
    const studentDoc = await User.findById(student.id);
    if (cost > 0 && studentDoc && studentDoc.creditsBalance < cost) {
      return res.status(400).json({
        success: false,
        error: `Insufficient credits balance. You need ${cost} credits but have ${studentDoc.creditsBalance}.`
      });
    }

    // Reserve escrow credits atomically
    if (cost > 0 && studentDoc) {
      studentDoc.creditsBalance -= cost;
      studentDoc.creditsEscrow = (studentDoc.creditsEscrow || 0) + cost;
      await studentDoc.save();

      await WalletTransaction.create({
        userId: student.id,
        type: 'escrow_reserved',
        amount: cost,
        currency: 'credits',
        title: `Reserved for ${skill} Session`,
        description: `Credits held in escrow for session with ${tutorName || tutorDoc.name || 'Tutor'}`,
        counterpartyId: tutorId,
        counterpartyName: tutorName || tutorDoc.name || 'Tutor'
      });
    }

    const meetingId = `room-${Date.now().toString().slice(-6)}`;
    const session = new Session({
      tutorId,
      tutorName: tutorName || tutorDoc.name || 'Tutor',
      tutorAvatar: tutorAvatar || tutorDoc.avatar || '',
      tutorCollege: tutorCollege || tutorDoc.college || 'Campus Tutor',
      studentId: student.id,
      studentName: student.name || 'Student',
      studentAvatar: studentDoc?.avatar || student.avatar || '',
      skill,
      sessionType: sessionType || 'Peer Tutoring',
      status: 'Pending',
      scheduledDate: sDate,
      scheduledTime: sTime,
      durationMinutes: durationMinutes || 20,
      creditCost: cost,
      escrowStatus: cost > 0 ? 'Reserved' : 'Settled',
      tutorPayout: Math.round(cost * 0.83),
      platformFee: Math.round(cost * 0.17),
      format: format || 'Live Online Session',
      meetingLink: `https://meet.skillswap.edu/${meetingId}`,
      learningObjective: learningObjective || 'Peer learning and practice walkthrough',
      sessionNotes: '',
      sharedResources: [],
      learnerConfirmed: false,
      teacherConfirmed: false
    });

    await session.save();

    // Create in-app notification for recipient/teacher
    try {
      await Notification.create({
        userId: tutorId,
        type: 'skill_swap_request',
        title: 'New Session Request',
        message: `${student.name || 'A student'} requested a session for ${skill} on ${sDate} at ${sTime}.`,
        read: false,
        actionUrl: '/sessions',
        sender: {
          id: student.id,
          name: student.name || 'Student',
          avatar: studentDoc?.avatar || ''
        },
        metadata: {
          sessionId: session._id ? session._id.toString() : session.id,
          skill,
          scheduledDate: sDate,
          scheduledTime: sTime
        }
      });
    } catch (notifErr) {
      console.warn('Failed to dispatch notification:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Session booking request submitted.',
      session: session.toSafeObject()
    });
  } catch (err) {
    console.error('Book session error:', err);
    res.status(500).json({ success: false, error: 'Failed to book session.' });
  }
});

// PATCH /api/sessions/:id/accept – Accept booking request (recipient teacher only)
router.patch('/:id/accept', requireAuth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session request not found.' });
    }

    const currentUserId = String(req.user.id);

    // Prevent users from accepting their own requests
    if (String(session.studentId) === currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'You cannot accept your own booking request.'
      });
    }

    // Allow only the intended recipient (tutor)
    if (String(session.tutorId) !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized. Only the requested teacher can accept this session request.'
      });
    }

    // Prevent accepting already processed requests
    if (session.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        error: `Cannot accept request. This session has already been ${session.status.toLowerCase()}.`
      });
    }

    session.status = 'Accepted';
    await session.save();

    // Create notification for requester (student)
    try {
      await Notification.create({
        userId: session.studentId,
        type: 'session_accepted',
        title: 'Session Request Accepted!',
        message: `${session.tutorName} accepted your session booking for ${session.skill}.`,
        read: false,
        actionUrl: '/sessions',
        sender: {
          id: req.user.id,
          name: req.user.name,
          avatar: session.tutorAvatar || ''
        },
        metadata: {
          sessionId: session._id ? session._id.toString() : session.id,
          skill: session.skill
        }
      });
    } catch (notifErr) {
      console.warn('Failed to dispatch accepted notification:', notifErr.message);
    }

    res.json({
      success: true,
      message: 'Session booking accepted successfully!',
      session: session.toSafeObject()
    });
  } catch (err) {
    console.error('Accept session error:', err);
    res.status(500).json({ success: false, error: 'Failed to accept session booking.' });
  }
});

// PATCH /api/sessions/:id/reject – Reject booking request (recipient teacher only)
router.patch('/:id/reject', requireAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session request not found.' });
    }

    const currentUserId = String(req.user.id);

    // Prevent users from rejecting requests belonging to others or their own
    if (String(session.studentId) === currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'You cannot reject your own booking request. Please cancel it instead.'
      });
    }

    // Allow only the intended recipient (tutor)
    if (String(session.tutorId) !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized. Only the requested teacher can reject this session request.'
      });
    }

    // Prevent rejecting already processed requests
    if (session.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        error: `Cannot reject request. This session has already been ${session.status.toLowerCase()}.`
      });
    }

    // Refund escrow if reserved
    if (session.escrowStatus === 'Reserved' && session.creditCost > 0) {
      const studentDoc = await User.findById(session.studentId);
      if (studentDoc && (studentDoc.creditsEscrow || 0) >= session.creditCost) {
        studentDoc.creditsEscrow -= session.creditCost;
        studentDoc.creditsBalance += session.creditCost;
        await studentDoc.save();

        await WalletTransaction.create({
          userId: session.studentId,
          type: 'escrow_refunded',
          amount: session.creditCost,
          currency: 'credits',
          title: `Refund: ${session.skill} Booking Declined`,
          description: `Escrow refunded because booking request was declined by ${session.tutorName}`,
          sessionId: session.id
        });
      }
      session.escrowStatus = 'Refunded';
    }

    session.status = 'Rejected';
    session.rejectReason = reason || 'Declined by teacher';
    await session.save();

    // Create notification for requester (student)
    try {
      await Notification.create({
        userId: session.studentId,
        type: 'session_rejected',
        title: 'Session Request Declined',
        message: `${session.tutorName} was unable to accept your session request for ${session.skill}.${reason ? ` Reason: ${reason}` : ''}`,
        read: false,
        actionUrl: '/sessions',
        sender: {
          id: req.user.id,
          name: req.user.name,
          avatar: session.tutorAvatar || ''
        },
        metadata: {
          sessionId: session._id ? session._id.toString() : session.id,
          skill: session.skill
        }
      });
    } catch (notifErr) {
      console.warn('Failed to dispatch rejected notification:', notifErr.message);
    }

    res.json({
      success: true,
      message: 'Session booking request declined.',
      session: session.toSafeObject()
    });
  } catch (err) {
    console.error('Reject session error:', err);
    res.status(500).json({ success: false, error: 'Failed to reject session booking.' });
  }
});

// PATCH /api/sessions/:id/confirm – Two-sided confirmation
router.get('/:id/confirm', (req, res) => res.status(405).json({ error: 'Use PATCH' }));
router.patch('/:id/confirm', requireAuth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    const userId = req.user.id;
    const isLearner = session.studentId === userId;
    const isTeacher = session.tutorId === userId;

    if (!isLearner && !isTeacher) {
      return res.status(403).json({ success: false, error: 'Unauthorized to confirm this session.' });
    }

    if (isLearner) session.learnerConfirmed = true;
    if (isTeacher) session.teacherConfirmed = true;

    // Both parties confirmed: Settle escrow and complete session
    if (session.learnerConfirmed && session.teacherConfirmed) {
      session.status = 'Completed';
      session.escrowStatus = 'Settled';

      // Release escrow payout to tutor
      if (session.creditCost > 0) {
        const studentDoc = await User.findById(session.studentId);
        if (studentDoc && studentDoc.creditsEscrow >= session.creditCost) {
          studentDoc.creditsEscrow -= session.creditCost;
          studentDoc.completedSessionsCount = (studentDoc.completedSessionsCount || 0) + 1;
          studentDoc.hoursLearned = (studentDoc.hoursLearned || 0) + Math.round(session.durationMinutes / 60);
          await studentDoc.save();
        }

        const tutorDoc = await User.findById(session.tutorId);
        if (tutorDoc) {
          tutorDoc.creditsBalance = (tutorDoc.creditsBalance || 0) + session.tutorPayout;
          tutorDoc.hoursTaught = (tutorDoc.hoursTaught || 0) + Math.round(session.durationMinutes / 60);
          tutorDoc.completedSessionsCount = (tutorDoc.completedSessionsCount || 0) + 1;
          await tutorDoc.save();

          await WalletTransaction.create({
            userId: session.tutorId,
            type: 'credit_earned',
            amount: session.tutorPayout,
            currency: 'credits',
            title: `Session Payout: ${session.skill}`,
            description: `Completed peer lesson with ${session.studentName}`,
            counterpartyId: session.studentId,
            counterpartyName: session.studentName,
            sessionId: session.id
          });
        }
      }
    } else {
      session.status = 'Awaiting Confirmation';
    }

    await session.save();

    res.json({
      success: true,
      message: session.status === 'Completed' ? 'Session completed and escrow settled!' : 'Confirmation saved. Awaiting peer confirmation.',
      session: session.toSafeObject()
    });
  } catch (err) {
    console.error('Confirm session error:', err);
    res.status(500).json({ success: false, error: 'Failed to confirm session.' });
  }
});

// PATCH /api/sessions/:id/dispute – Dispute session
router.patch('/:id/dispute', requireAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    if (session.studentId !== req.user.id && session.tutorId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }

    session.status = 'Disputed';
    session.escrowStatus = 'Paused';
    session.disputeReason = reason || 'Session dispute raised. Escrow held pending moderation.';
    await session.save();

    res.json({ success: true, message: 'Dispute submitted.', session: session.toSafeObject() });
  } catch (err) {
    console.error('Dispute session error:', err);
    res.status(500).json({ success: false, error: 'Failed to dispute session.' });
  }
});

// PATCH /api/sessions/:id/cancel – Cancel session
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    if (session.studentId !== req.user.id && session.tutorId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }

    // Refund escrow to student if session was upcoming/reserved
    if (session.escrowStatus === 'Reserved' && session.creditCost > 0) {
      const studentDoc = await User.findById(session.studentId);
      if (studentDoc && studentDoc.creditsEscrow >= session.creditCost) {
        studentDoc.creditsEscrow -= session.creditCost;
        studentDoc.creditsBalance += session.creditCost;
        await studentDoc.save();

        await WalletTransaction.create({
          userId: session.studentId,
          type: 'escrow_refunded',
          amount: session.creditCost,
          currency: 'credits',
          title: `Refund: ${session.skill} Cancelled`,
          description: `Escrow refunded for cancelled session with ${session.tutorName}`,
          sessionId: session.id
        });
      }
    }

    session.status = 'Cancelled';
    session.escrowStatus = 'Refunded';
    session.sessionNotes += ` [Cancelled: ${reason || 'Cancelled by participant'}]`;
    await session.save();

    res.json({ success: true, message: 'Session cancelled and refunded.', session: session.toSafeObject() });
  } catch (err) {
    console.error('Cancel session error:', err);
    res.status(500).json({ success: false, error: 'Failed to cancel session.' });
  }
});

// PATCH /api/sessions/:id/notes – Update notes and shared resources
router.patch('/:id/notes', requireAuth, async (req, res) => {
  try {
    const { sessionNotes, sharedResources, nextSteps } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    if (session.studentId !== req.user.id && session.tutorId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }

    if (sessionNotes !== undefined) session.sessionNotes = sessionNotes;
    if (sharedResources !== undefined) session.sharedResources = sharedResources;
    if (nextSteps !== undefined) session.nextSteps = nextSteps;

    await session.save();
    res.json({ success: true, session: session.toSafeObject() });
  } catch (err) {
    console.error('Update notes error:', err);
    res.status(500).json({ success: false, error: 'Failed to update session notes.' });
  }
});

// POST /api/sessions/:id/task – Submit task in learning room
router.post('/:id/task', requireAuth, async (req, res) => {
  try {
    const { url, notes } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    if (session.studentId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the learner can submit tasks.' });
    }

    session.taskSubmission = {
      url: url || '',
      notes: notes || '',
      submittedAt: new Date().toISOString()
    };

    await session.save();
    res.json({ success: true, session: session.toSafeObject() });
  } catch (err) {
    console.error('Submit task error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit task.' });
  }
});

// POST /api/sessions/:id/review – Review completed session
router.post('/:id/review', requireAuth, async (req, res) => {
  try {
    const { teachingQuality, communication, feedback } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    if (session.status !== 'Completed') {
      return res.status(400).json({ success: false, error: 'Only completed sessions can be reviewed.' });
    }

    if (session.studentId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the learner can review this session.' });
    }

    session.ratingGiven = {
      teachingQuality: Number(teachingQuality) || 5,
      communication: Number(communication) || 5,
      feedback: feedback || ''
    };

    await session.save();

    // Update tutor's overall rating on User model
    const tutorDoc = await User.findById(session.tutorId);
    if (tutorDoc) {
      const newReviewCount = (tutorDoc.reviewCount || 0) + 1;
      const currentRating = tutorDoc.rating || 5.0;
      const newScore = (teachingQuality + communication) / 2;
      tutorDoc.rating = Number(((currentRating * (newReviewCount - 1) + newScore) / newReviewCount).toFixed(2));
      tutorDoc.reviewCount = newReviewCount;
      await tutorDoc.save();
    }

    res.json({ success: true, message: 'Review recorded!', session: session.toSafeObject() });
  } catch (err) {
    console.error('Review session error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit review.' });
  }
});

// ==========================================
// REAL-TIME LIVE SESSION & WHITEBOARD SIGNALING
// ==========================================

const sessionRooms = new Map();

function getOrCreateRoom(sessionId) {
  if (!sessionRooms.has(sessionId)) {
    sessionRooms.set(sessionId, {
      clients: new Set(),
      signals: [],
      events: [],
      seq: 0
    });
  }
  return sessionRooms.get(sessionId);
}

function broadcastToRoom(sessionId, eventData, excludeUserId = null) {
  const room = sessionRooms.get(sessionId);
  if (!room) return;
  const payload = `data: ${JSON.stringify(eventData)}\n\n`;
  for (const client of room.clients) {
    if (excludeUserId && client.userId === excludeUserId) continue;
    try {
      client.res.write(payload);
    } catch (_e) {
      // Ignore write errors; handled by on('close')
    }
  }
}

// GET /api/sessions/:id/live-events – Server-Sent Events (SSE) for signaling & real-time events
router.get('/:id/live-events', requireAuth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    if (session.tutorId !== req.user.id && session.studentId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to join live session events.' });
    }

    const sessionId = String(req.params.id);
    const userId = String(req.user.id);
    const room = getOrCreateRoom(sessionId);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (res.flushHeaders) res.flushHeaders();

    const clientRecord = { userId, res };
    room.clients.add(clientRecord);

    // Initial connection event
    res.write(`data: ${JSON.stringify({ type: 'connected', userId, timestamp: Date.now() })}\n\n`);

    // Notify other participant that peer joined
    broadcastToRoom(sessionId, { type: 'peer-joined', userId, timestamp: Date.now() }, userId);

    // Replay any recent buffered signals intended for this joining peer
    for (const item of room.signals) {
      if (item.senderId !== userId && item.timestamp > Date.now() - 30000) {
        res.write(`data: ${JSON.stringify({
          type: 'signal',
          senderId: item.senderId,
          signal: item.signal,
          timestamp: item.timestamp
        })}\n\n`);
      }
    }

    // Keep-alive heartbeat every 15 seconds
    const heartbeat = setInterval(() => {
      try {
        res.write(': keep-alive\n\n');
      } catch (_e) {
        clearInterval(heartbeat);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeat);
      room.clients.delete(clientRecord);
      broadcastToRoom(sessionId, { type: 'peer-left', userId, timestamp: Date.now() }, userId);
      if (room.clients.size === 0) {
        // Keep room buffer for a few minutes then clean up if empty
        setTimeout(() => {
          const r = sessionRooms.get(sessionId);
          if (r && r.clients.size === 0) {
            sessionRooms.delete(sessionId);
          }
        }, 120000);
      }
    });
  } catch (err) {
    console.error('SSE live-events error:', err);
    res.status(500).end();
  }
});

// POST /api/sessions/:id/signal – WebRTC signaling exchange (offer, answer, ice-candidate)
router.post('/:id/signal', requireAuth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    if (session.tutorId !== req.user.id && session.studentId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }

    const sessionId = String(req.params.id);
    const userId = String(req.user.id);
    const { signal } = req.body;

    if (!signal) {
      return res.status(400).json({ success: false, error: 'Missing signal body.' });
    }

    const room = getOrCreateRoom(sessionId);
    const signalItem = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: userId,
      signal,
      timestamp: Date.now()
    };

    room.signals.push(signalItem);
    if (room.signals.length > 60) room.signals.shift();

    // Broadcast immediately over SSE
    broadcastToRoom(sessionId, {
      type: 'signal',
      senderId: userId,
      signal,
      timestamp: signalItem.timestamp
    }, userId);

    res.json({ success: true, timestamp: signalItem.timestamp });
  } catch (err) {
    console.error('Signal post error:', err);
    res.status(500).json({ success: false, error: 'Failed to dispatch signal.' });
  }
});

// GET /api/sessions/:id/signals – Polling fallback for signals
router.get('/:id/signals', requireAuth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    if (session.tutorId !== req.user.id && session.studentId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }

    const sessionId = String(req.params.id);
    const userId = String(req.user.id);
    const since = Number(req.query.since) || 0;

    const room = getOrCreateRoom(sessionId);
    const pending = room.signals.filter(s => s.senderId !== userId && s.timestamp > since);

    res.json({ success: true, signals: pending, now: Date.now() });
  } catch (err) {
    console.error('Signals get error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch signals.' });
  }
});

// GET /api/sessions/:id/whiteboard – Retrieve full saved whiteboard state
router.get('/:id/whiteboard', requireAuth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    if (session.tutorId !== req.user.id && session.studentId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }

    const strokes = (session.whiteboardData && session.whiteboardData.strokes) || [];
    res.json({
      success: true,
      strokes,
      lastClearedAt: session.whiteboardData?.lastClearedAt || null
    });
  } catch (err) {
    console.error('Whiteboard get error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch whiteboard.' });
  }
});

// POST /api/sessions/:id/whiteboard/stroke – Append an incremental stroke
router.post('/:id/whiteboard/stroke', requireAuth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    if (session.tutorId !== req.user.id && session.studentId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }

    const { stroke } = req.body;
    if (!stroke || !stroke.points || !Array.isArray(stroke.points)) {
      return res.status(400).json({ success: false, error: 'Invalid stroke data.' });
    }

    const sanitizedStroke = {
      strokeId: stroke.strokeId || `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: String(req.user.id),
      tool: stroke.tool || 'pen',
      color: stroke.color || '#000000',
      width: Number(stroke.width) || 2,
      points: stroke.points,
      timestamp: new Date()
    };

    // Save to persistent Session document
    await Session.findByIdAndUpdate(req.params.id, {
      $push: { 'whiteboardData.strokes': sanitizedStroke }
    });

    const sessionId = String(req.params.id);
    const room = getOrCreateRoom(sessionId);
    room.seq += 1;
    const event = {
      seq: room.seq,
      type: 'stroke',
      stroke: sanitizedStroke,
      timestamp: Date.now()
    };
    room.events.push(event);
    if (room.events.length > 200) room.events.shift();

    // Broadcast incremental stroke to other participants in the room
    broadcastToRoom(sessionId, event, String(req.user.id));

    res.json({ success: true, stroke: sanitizedStroke, seq: room.seq });
  } catch (err) {
    console.error('Whiteboard stroke error:', err);
    res.status(500).json({ success: false, error: 'Failed to save stroke.' });
  }
});

// POST /api/sessions/:id/whiteboard/clear – Clear whiteboard canvas
router.post('/:id/whiteboard/clear', requireAuth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    if (session.tutorId !== req.user.id && session.studentId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }

    const clearedAt = new Date();
    await Session.findByIdAndUpdate(req.params.id, {
      $set: {
        'whiteboardData.strokes': [],
        'whiteboardData.lastClearedAt': clearedAt
      }
    });

    const sessionId = String(req.params.id);
    const room = getOrCreateRoom(sessionId);
    room.seq += 1;
    const event = {
      seq: room.seq,
      type: 'clear',
      userId: String(req.user.id),
      timestamp: Date.now()
    };
    room.events.push(event);
    if (room.events.length > 200) room.events.shift();

    // Broadcast clear event
    broadcastToRoom(sessionId, event, String(req.user.id));

    res.json({ success: true, clearedAt });
  } catch (err) {
    console.error('Whiteboard clear error:', err);
    res.status(500).json({ success: false, error: 'Failed to clear whiteboard.' });
  }
});

// GET /api/sessions/:id/whiteboard/events – Polling fallback for whiteboard events
router.get('/:id/whiteboard/events', requireAuth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

    if (session.tutorId !== req.user.id && session.studentId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }

    const sessionId = String(req.params.id);
    const sinceSeq = Number(req.query.since) || 0;
    const room = getOrCreateRoom(sessionId);
    const newEvents = room.events.filter(e => e.seq > sinceSeq);

    res.json({
      success: true,
      events: newEvents,
      currentSeq: room.seq
    });
  } catch (err) {
    console.error('Whiteboard events error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch events.' });
  }
});

export default router;
