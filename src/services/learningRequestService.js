import { simulateDelay } from './api';
import { MOCK_LEARNING_REQUESTS } from '../data/mockLearningRequests';

const STORAGE_KEY_REQUESTS = 'skillswap_learning_requests';

const getInitialRequests = () => {
  const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse learning requests', e);
    }
  }
  return MOCK_LEARNING_REQUESTS;
};

let learningRequests = getInitialRequests();

const saveState = () => {
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(learningRequests));
};

export const learningRequestService = {
  getRequests: async ({ category = 'All Categories', format = 'All', search = '' } = {}) => {
    await simulateDelay(100);
    let results = [...learningRequests];

    if (category && category !== 'All Categories') {
      results = results.filter(r => r.category === category);
    }

    if (format && format !== 'All') {
      results = results.filter(r => r.format.toLowerCase().includes(format.toLowerCase()));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.skill.toLowerCase().includes(q) ||
        r.authorName.toLowerCase().includes(q)
      );
    }

    return results;
  },

  createRequest: async (newRequestPayload) => {
    await simulateDelay(200);
    const newReq = {
      id: `req_${Date.now()}`,
      authorId: newRequestPayload.authorId || 'usr_me',
      authorName: newRequestPayload.authorName || 'Alex Rivera',
      authorAvatar: newRequestPayload.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      college: newRequestPayload.college || 'UC Berkeley',
      title: newRequestPayload.title,
      description: newRequestPayload.description,
      skill: newRequestPayload.skill,
      category: newRequestPayload.category || 'Programming, DSA & Web Dev',
      currentProficiency: newRequestPayload.currentProficiency || 'Beginner',
      targetProficiency: newRequestPayload.targetProficiency || 'Intermediate',
      learningGoal: newRequestPayload.learningGoal || '',
      desiredOutcome: newRequestPayload.desiredOutcome || '',
      preferredSchedule: newRequestPayload.preferredSchedule || 'Flexible',
      language: newRequestPayload.language || 'English',
      format: newRequestPayload.format || 'Live Online Session',
      proposedCredits: Number(newRequestPayload.proposedCredits) || 0,
      status: 'Open',
      createdAt: 'Just now',
      responses: []
    };

    learningRequests = [newReq, ...learningRequests];
    saveState();
    return newReq;
  },

  respondToRequest: async (requestId, responsePayload) => {
    await simulateDelay(150);
    const idx = learningRequests.findIndex(r => r.id === requestId);
    if (idx !== -1) {
      const newResponse = {
        id: `resp_${Date.now()}`,
        responderId: responsePayload.responderId || 'usr_me',
        responderName: responsePayload.responderName || 'Alex Rivera',
        responderAvatar: responsePayload.responderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        message: responsePayload.message,
        proposedTime: responsePayload.proposedTime || 'This Weekend',
        status: 'Pending'
      };

      learningRequests[idx].responses = [newResponse, ...(learningRequests[idx].responses || [])];
      if (learningRequests[idx].status === 'Open') {
        learningRequests[idx].status = 'Responses Received';
      }
      saveState();
      return learningRequests[idx];
    }
    throw new Error('Request not found');
  },

  acceptResponse: async (requestId, responseId) => {
    await simulateDelay(150);
    const idx = learningRequests.findIndex(r => r.id === requestId);
    if (idx !== -1) {
      learningRequests[idx].status = 'Accepted';
      learningRequests[idx].responses = learningRequests[idx].responses.map(r =>
        r.id === responseId ? { ...r, status: 'Accepted' } : { ...r, status: 'Declined' }
      );
      saveState();
      return learningRequests[idx];
    }
    throw new Error('Request not found');
  },

  updateStatus: async (requestId, newStatus) => {
    await simulateDelay(100);
    const idx = learningRequests.findIndex(r => r.id === requestId);
    if (idx !== -1) {
      learningRequests[idx].status = newStatus;
      saveState();
      return learningRequests[idx];
    }
    throw new Error('Request not found');
  }
};

export default learningRequestService;
