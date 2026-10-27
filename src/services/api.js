// Central API client for SkillSwap frontend
// Connects to Node.js / Express backend with token persistence and safe fallback

const defaultApiUrl =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? 'https://skillswap-test.onrender.com/api'
    : 'http://localhost:5000/api';

const rawApiUrl = (import.meta.env.VITE_API_URL || defaultApiUrl).trim().replace(/\/+$/, '');
export const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
export const BACKEND_URL = API_BASE_URL.replace(/\/api$/, '');

/**
 * Resolves media URLs (videos, thumbnails, avatars).
 * Normalizes local or relative URLs to use the current BACKEND_URL,
 * while preserving valid remote cloud URLs (S3, GCS, CDNs, data/blob URIs).
 */
export const resolveMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // If URL contains localhost or 127.0.0.1 (e.g. from local development or DB record),
  // rewrite it to use the current environment's BACKEND_URL so it plays in deployed environments.
  const localhostMatch = trimmed.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)$/i);
  if (localhostMatch) {
    const relativePath = localhostMatch[3];
    return `${BACKEND_URL}${relativePath}`;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${BACKEND_URL}${cleanPath}`;
};

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
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const resData = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(resData.error || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.data = resData;
      throw error;
    }
    return resData;
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

  patch: async (endpoint, data = {}) => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || `Request failed with status ${res.status}`);
      }
      return resData;
    } catch (err) {
      console.warn(`[apiClient PATCH fallback] ${endpoint}:`, err.message);
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
