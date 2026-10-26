import { apiClient } from './api';

export const sessionService = {
  getSessions: async ({ status = 'All' } = {}) => {
    const query = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
    const res = await apiClient.get(`/sessions${query}`);
    return res?.sessions || [];
  },

  getSessionById: async (sessionId) => {
    const res = await apiClient.get(`/sessions/${sessionId}`);
    if (!res?.session) throw new Error('Session not found');
    return res.session;
  },

  bookSession: async (sessionPayload) => {
    const res = await apiClient.post('/sessions', sessionPayload);
    if (!res?.session) throw new Error(res?.error || 'Failed to book session');
    return res.session;
  },

  updateSessionNotes: async (sessionId, { sessionNotes, sharedResources, nextSteps }) => {
    const res = await apiClient.patch(`/sessions/${sessionId}/notes`, {
      sessionNotes,
      sharedResources,
      nextSteps
    });
    if (!res?.session) throw new Error(res?.error || 'Failed to update session notes');
    return res.session;
  },

  submitTaskInRoom: async (sessionId, taskPayload) => {
    const res = await apiClient.post(`/sessions/${sessionId}/task`, taskPayload);
    if (!res?.session) throw new Error(res?.error || 'Failed to submit task');
    return res.session;
  },

  confirmCompletion: async (sessionId, role = 'learner') => {
    const res = await apiClient.patch(`/sessions/${sessionId}/confirm`, { role });
    if (!res?.session) throw new Error(res?.error || 'Failed to confirm session');
    return res.session;
  },

  disputeSession: async (sessionId, reason) => {
    const res = await apiClient.patch(`/sessions/${sessionId}/dispute`, { reason });
    if (!res?.session) throw new Error(res?.error || 'Failed to dispute session');
    return res.session;
  },

  cancelSession: async (sessionId, reason = '') => {
    const res = await apiClient.patch(`/sessions/${sessionId}/cancel`, { reason });
    if (!res?.session) throw new Error(res?.error || 'Failed to cancel session');
    return res.session;
  },

  submitSessionReview: async (sessionId, { teachingQuality, communication, feedback }) => {
    const res = await apiClient.post(`/sessions/${sessionId}/review`, {
      teachingQuality,
      communication,
      feedback
    });
    if (!res?.session) throw new Error(res?.error || 'Failed to submit review');
    return res.session;
  }
};

export default sessionService;
