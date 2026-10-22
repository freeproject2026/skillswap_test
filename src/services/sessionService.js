import { simulateDelay } from './api';
import { MOCK_SESSIONS } from '../data/mockSessions';

const STORAGE_KEY_SESSIONS = 'skillswap_learning_sessions';

const getInitialSessions = () => {
  const stored = localStorage.getItem(STORAGE_KEY_SESSIONS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse sessions from storage', e);
    }
  }
  return MOCK_SESSIONS;
};

let sessions = getInitialSessions();

const saveState = () => {
  localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
};

export const sessionService = {
  getSessions: async ({ status = 'All' } = {}) => {
    await simulateDelay(80);
    if (status === 'All') return [...sessions];
    return sessions.filter(s => s.status.toLowerCase() === status.toLowerCase());
  },

  getSessionById: async (sessionId) => {
    await simulateDelay(60);
    const session = sessions.find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found');
    return { ...session };
  },

  bookSession: async (sessionPayload) => {
    await simulateDelay(200);
    const newSession = {
      id: `sess_${Date.now()}`,
      tutorId: sessionPayload.tutorId,
      tutorName: sessionPayload.tutorName,
      tutorAvatar: sessionPayload.tutorAvatar,
      tutorCollege: sessionPayload.tutorCollege || 'Campus Tutor',
      studentId: sessionPayload.studentId || 'usr_me',
      studentName: sessionPayload.studentName || 'Alex Rivera',
      studentAvatar: sessionPayload.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      skill: sessionPayload.skill,
      status: 'Upcoming',
      scheduledDate: sessionPayload.scheduledDate || 'This Weekend',
      scheduledTime: sessionPayload.scheduledTime || '6:00 PM',
      durationMinutes: sessionPayload.durationMinutes || 20,
      creditCost: sessionPayload.creditCost || 60,
      escrowStatus: sessionPayload.creditCost > 0 ? 'Reserved' : 'Settled',
      tutorPayout: Math.round((sessionPayload.creditCost || 60) * 0.83),
      platformFee: Math.round((sessionPayload.creditCost || 60) * 0.17),
      format: sessionPayload.format || 'Live Online Session',
      meetingLink: `https://meet.skillswap.edu/room-${Date.now().toString().slice(-4)}`,
      learningObjective: sessionPayload.learningObjective || 'Peer learning and practice walkthrough',
      sessionNotes: sessionPayload.sessionNotes || '',
      sharedResources: sessionPayload.sharedResources || [],
      taskSubmission: null,
      nextSteps: '',
      learnerConfirmed: false,
      teacherConfirmed: false,
      disputeReason: null,
      ratingGiven: null
    };

    sessions = [newSession, ...sessions];
    saveState();
    return newSession;
  },

  updateSessionNotes: async (sessionId, { sessionNotes, sharedResources, nextSteps }) => {
    await simulateDelay(100);
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx !== -1) {
      if (sessionNotes !== undefined) sessions[idx].sessionNotes = sessionNotes;
      if (sharedResources !== undefined) sessions[idx].sharedResources = sharedResources;
      if (nextSteps !== undefined) sessions[idx].nextSteps = nextSteps;
      saveState();
      return sessions[idx];
    }
    throw new Error('Session not found');
  },

  submitTaskInRoom: async (sessionId, taskPayload) => {
    await simulateDelay(150);
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx !== -1) {
      sessions[idx].taskSubmission = {
        url: taskPayload.url,
        notes: taskPayload.notes,
        submittedAt: 'Just now'
      };
      saveState();
      return sessions[idx];
    }
    throw new Error('Session not found');
  },

  // TWO-SIDED SESSION COMPLETION:
  // Both parties must confirm independently. Session only becomes Completed when BOTH have confirmed!
  confirmCompletion: async (sessionId, role = 'learner') => {
    await simulateDelay(150);
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx !== -1) {
      if (role === 'learner') {
        sessions[idx].learnerConfirmed = true;
      } else {
        sessions[idx].teacherConfirmed = true;
      }

      if (sessions[idx].learnerConfirmed && sessions[idx].teacherConfirmed) {
        sessions[idx].status = 'Completed';
        sessions[idx].escrowStatus = 'Settled';
      } else {
        sessions[idx].status = 'Awaiting Confirmation';
      }

      saveState();
      return sessions[idx];
    }
    throw new Error('Session not found');
  },

  // DISPUTE SESSION:
  // Settlement is immediately paused in escrow.
  disputeSession: async (sessionId, reason) => {
    await simulateDelay(150);
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx !== -1) {
      sessions[idx].status = 'Disputed';
      sessions[idx].escrowStatus = 'Paused';
      sessions[idx].disputeReason = reason || 'Session issue reported. Escrow paused pending campus moderation review.';
      saveState();
      return sessions[idx];
    }
    throw new Error('Session not found');
  },

  cancelSession: async (sessionId, reason = '') => {
    await simulateDelay(120);
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx !== -1) {
      sessions[idx].status = 'Cancelled';
      sessions[idx].escrowStatus = 'Refunded';
      sessions[idx].sessionNotes += ` [Cancelled: ${reason || 'Cancelled by student'}]`;
      saveState();
      return sessions[idx];
    }
    throw new Error('Session not found');
  },

  submitSessionReview: async (sessionId, { teachingQuality, communication, feedback }) => {
    await simulateDelay(150);
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx !== -1) {
      if (sessions[idx].status !== 'Completed') {
        throw new Error('Reviews are only allowed after eligible completed sessions');
      }
      sessions[idx].ratingGiven = { teachingQuality, communication, feedback };
      saveState();
      return sessions[idx];
    }
    throw new Error('Session not found');
  }
};

export default sessionService;
