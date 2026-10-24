// Central API client for SkillSwap frontend
// Connects to Node.js / Express backend with token persistence and safe fallback

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const simulateDelay = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms));

const getAuthHeaders = () => {
  const token = localStorage.getItem('skillswap_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiClient = {
  get: async (endpoint) => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed with status ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[apiClient GET fallback] ${endpoint}:`, err.message);
      return null;
    }
  },

  post: async (endpoint, data) => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || `Request failed with status ${res.status}`);
      }
      return resData;
    } catch (err) {
      console.warn(`[apiClient POST fallback] ${endpoint}:`, err.message);
      throw err;
    }
  },

  put: async (endpoint, data) => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || `Request failed with status ${res.status}`);
      }
      return resData;
    } catch (err) {
      console.warn(`[apiClient PUT fallback] ${endpoint}:`, err.message);
      throw err;
    }
  },

  delete: async (endpoint) => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || `Request failed with status ${res.status}`);
      }
      return resData;
    } catch (err) {
      console.warn(`[apiClient DELETE fallback] ${endpoint}:`, err.message);
      throw err;
    }
  }
};

export default apiClient;
