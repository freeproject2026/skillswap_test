import { apiClient, API_BASE_URL } from './api';

const STORAGE_KEY_USER = 'skillswap_current_user';
const STORAGE_KEY_AUTH_STATUS = 'skillswap_auth_status'; // 'authenticated' | 'guest'
const STORAGE_KEY_TOKEN = 'skillswap_token';

let currentUser = null;

try {
  const authStatus = localStorage.getItem(STORAGE_KEY_AUTH_STATUS);
  const token = localStorage.getItem(STORAGE_KEY_TOKEN);
  const stored = localStorage.getItem(STORAGE_KEY_USER);
  if (authStatus === 'authenticated' && token && stored) {
    currentUser = JSON.parse(stored);
  }
} catch (e) {
  console.error('Failed to parse cached user state:', e);
}

const saveState = () => {
  if (currentUser) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    localStorage.setItem(STORAGE_KEY_AUTH_STATUS, 'authenticated');
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.setItem(STORAGE_KEY_AUTH_STATUS, 'guest');
  }
};

export const userService = {
  getCurrentUser: async () => {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!token) {
      currentUser = null;
      saveState();
      return null;
    }

    try {
      const res = await apiClient.get('/auth/me');
      if (res?.success && res.user) {
        currentUser = res.user;
        saveState();
        return { ...currentUser };
      }
      currentUser = null;
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      saveState();
      return null;
    } catch (err) {
      // If unauthorized / token invalid / user deleted, invalidate state
      currentUser = null;
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      saveState();
      return null;
    }
  },

  getUserById: async (id) => {
    if (currentUser && (id === currentUser.id || id === currentUser._id || id === 'me')) {
      return { ...currentUser };
    }
    try {
      const res = await apiClient.get(`/users/${id}`);
      if (res?.success && res.user) {
        return res.user;
      }
    } catch (_err) {
      const { MOCK_USERS } = await import('../data/mockUsers.js');
      const foundMock = MOCK_USERS.find(u => u.id === id);
      if (foundMock) return { ...foundMock };
    }
    const { MOCK_USERS } = await import('../data/mockUsers.js');
    const foundMock = MOCK_USERS.find(u => u.id === id);
    if (foundMock) return { ...foundMock };
    throw new Error('Student profile not found');
  },

  getAllUsers: async ({ category, search, skill, topic, hashtag } = {}) => {
    const params = new URLSearchParams();
    if (category && category !== 'All Categories' && category !== 'All') params.set('category', category);
    if (search && search.trim()) params.set('search', search.trim());
    if (skill && skill.trim()) params.set('skill', skill.trim());
    if (topic && topic.trim()) params.set('topic', topic.trim());
    if (hashtag && hashtag.trim()) params.set('hashtag', hashtag.trim());
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await apiClient.get(`/users${query}`);
    return res?.users || [];
  },

  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res?.success && res.user) {
      if (res.token) {
        localStorage.setItem(STORAGE_KEY_TOKEN, res.token);
      }
      currentUser = res.user;
      saveState();
      return { ...currentUser };
    }
    throw new Error(res?.error || 'Authentication failed');
  },

  register: async ({ name, email, password, college, branch }) => {
    const res = await apiClient.post('/auth/register', { name, email, password, college, branch });
    if (res?.success && res.user) {
      if (res.token) {
        localStorage.setItem(STORAGE_KEY_TOKEN, res.token);
      }
      currentUser = res.user;
      saveState();
      return { ...currentUser };
    }
    throw new Error(res?.error || 'Registration failed');
  },

  loginWithPhone: async (phone, otp) => {
    const res = await apiClient.post('/auth/phone/otp-verify', { phone, otp });
    if (res?.success && res.user) {
      if (res.token) {
        localStorage.setItem(STORAGE_KEY_TOKEN, res.token);
      }
      currentUser = res.user;
      saveState();
      return { ...currentUser };
    }
    throw new Error(res?.error || 'Phone verification failed');
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch {
      // Ignore network errors on logout
    }
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    saveState();
    return null;
  },

  updateProfile: async (updatedFields) => {
    const res = await apiClient.put('/users/profile', updatedFields);
    if (res?.success && res.user) {
      currentUser = {
        ...currentUser,
        ...res.user
      };
      saveState();
      return { ...currentUser };
    }
    throw new Error(res?.error || 'Failed to update profile');
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await res.json();
    if (data?.success && data.user) {
      currentUser = {
        ...currentUser,
        ...data.user
      };
      saveState();
      return { ...currentUser };
    }
    throw new Error(data?.error || 'Failed to upload profile photo');
  },

  updateTokens: async (amount, reason = '') => {
    const res = await apiClient.post('/wallet/tokens/update', { amount, reason });
    if (currentUser) {
      currentUser.tokens = res?.newBalance ?? currentUser.tokens;
      saveState();
    }
    return res?.newBalance ?? 0;
  }
};

export default userService;
