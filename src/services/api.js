// Central API client wrapper for SkillSwap frontend
// Prepared for seamless drop-in backend connection (REST / GraphQL / WebSocket)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Helper to simulate realistic network delay during development
export const simulateDelay = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms));

export const apiClient = {
  get: async (endpoint) => {
    await simulateDelay();
    // When real backend is plugged in, replace with:
    // return fetch(`${API_BASE_URL}${endpoint}`).then(res => res.json());
    console.debug(`[API GET] ${endpoint}`);
    return null;
  },

  post: async (endpoint, data) => {
    await simulateDelay();
    console.debug(`[API POST] ${endpoint}`, data);
    return null;
  },

  put: async (endpoint, data) => {
    await simulateDelay();
    console.debug(`[API PUT] ${endpoint}`, data);
    return null;
  },

  delete: async (endpoint) => {
    await simulateDelay();
    console.debug(`[API DELETE] ${endpoint}`);
    return null;
  }
};

export default apiClient;

