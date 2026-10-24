import { apiClient, simulateDelay } from './api';
import { CURRENT_USER, MOCK_USERS } from '../data/mockUsers';

const STORAGE_KEY_USER = 'skillswap_current_user';
const STORAGE_KEY_USERS = 'skillswap_all_users';
const STORAGE_KEY_AUTH_STATUS = 'skillswap_auth_status'; // 'authenticated' | 'guest'
const STORAGE_KEY_TOKEN = 'skillswap_token';

const getInitialUser = () => {
  const authStatus = localStorage.getItem(STORAGE_KEY_AUTH_STATUS);
  if (authStatus === 'guest') {
    return null;
  }
  const stored = localStorage.getItem(STORAGE_KEY_USER);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return CURRENT_USER;
};

const getInitialUsers = () => {
  const stored = localStorage.getItem(STORAGE_KEY_USERS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return MOCK_USERS;
};

let currentUser = getInitialUser();
let allUsers = getInitialUsers();

const saveState = () => {
  if (currentUser) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    localStorage.setItem(STORAGE_KEY_AUTH_STATUS, 'authenticated');
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.setItem(STORAGE_KEY_AUTH_STATUS, 'guest');
  }
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(allUsers));
};

export const userService = {
  getCurrentUser: async () => {
    // If token exists, try fetching fresh user from server
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (token) {
      try {
        const res = await apiClient.get('/auth/me');
        if (res?.success && res.user) {
          currentUser = { ...currentUser, ...res.user };
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
          return { ...currentUser };
        }
      } catch (err) {
        // Fall back to local currentUser
      }
    }
    return currentUser ? { ...currentUser } : null;
  },

  getUserById: async (id) => {
    if (currentUser && (id === currentUser.id || id === 'me')) {
      return { ...currentUser };
    }
    try {
      const res = await apiClient.get(`/users/${id}`);
      if (res?.success && res.user) {
        return res.user;
      }
    } catch {
      // Local fallback
    }
    const found = allUsers.find(u => u.id === id);
    if (!found) throw new Error('User not found');
    return { ...found };
  },

  getAllUsers: async () => {
    try {
      const res = await apiClient.get('/users');
      if (res?.success && res.users && res.users.length > 0) {
        return res.users;
      }
    } catch {
      // Fallback
    }
    return [...allUsers];
  },

  login: async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res?.success && res.user) {
        if (res.token) {
          localStorage.setItem(STORAGE_KEY_TOKEN, res.token);
        }
        currentUser = {
          ...CURRENT_USER,
          ...res.user
        };
        saveState();
        return { ...currentUser };
      }
    } catch (err) {
      console.warn('Backend login error, checking fallback:', err.message);
      // Fallback for offline demo
      const found = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase()) || CURRENT_USER;
      currentUser = {
        ...found,
        email: email || found.email
      };
      saveState();
      return { ...currentUser };
    }
  },

  register: async ({ name, email, password, college, branch }) => {
    try {
      const res = await apiClient.post('/auth/register', { name, email, password, college, branch });
      if (res?.success && res.user) {
        if (res.token) {
          localStorage.setItem(STORAGE_KEY_TOKEN, res.token);
        }
        currentUser = {
          ...CURRENT_USER,
          ...res.user
        };
        allUsers = [currentUser, ...allUsers];
        saveState();
        return { ...currentUser };
      }
    } catch (err) {
      console.warn('Backend register error, checking fallback:', err.message);
      // Fallback
      const newUser = {
        ...CURRENT_USER,
        id: `usr_${Date.now()}`,
        name,
        username: name.toLowerCase().replace(/\s+/g, ''),
        email,
        college,
        branch: branch || 'Computer Science',
        semester: '1st Semester',
        emailVerified: true,
        bio: `Student at ${college}. Excited to learn and exchange skills on SkillSwap!`,
        credits: 100,
        tokens: 50,
        skillsOffered: [],
        skillsWanted: []
      };
      currentUser = newUser;
      allUsers = [newUser, ...allUsers];
      saveState();
      return { ...newUser };
    }
  },

  loginWithPhone: async (phone, otp) => {
    try {
      const res = await apiClient.post('/auth/phone/otp-verify', { phone, otp });
      if (res?.success && res.user) {
        if (res.token) {
          localStorage.setItem(STORAGE_KEY_TOKEN, res.token);
        }
        currentUser = {
          ...CURRENT_USER,
          ...res.user
        };
        saveState();
        return { ...currentUser };
      }
    } catch (err) {
      console.warn('Backend phone OTP error, using local fallback:', err.message);
      currentUser = {
        ...CURRENT_USER,
        phone
      };
      saveState();
      return { ...currentUser };
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch {}
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    saveState();
    return null;
  },

  updateProfile: async (updatedFields) => {
    try {
      const res = await apiClient.put('/users/profile', updatedFields);
      if (res?.success && res.user) {
        currentUser = {
          ...currentUser,
          ...res.user
        };
        saveState();
        return { ...currentUser };
      }
    } catch (err) {
      console.warn('Backend profile update fallback:', err.message);
    }

    if (!currentUser) throw new Error('Unauthenticated');
    currentUser = {
      ...currentUser,
      ...updatedFields
    };
    saveState();
    return { ...currentUser };
  },

  updateTokens: async (amount, reason = '') => {
    await simulateDelay(100);
    if (!currentUser) return 0;
    currentUser.tokens = Math.max(0, (currentUser.tokens || 0) + amount);
    if (amount > 0) {
      currentUser.earnedTokens = (currentUser.earnedTokens || 0) + amount;
    } else {
      currentUser.spentTokens = (currentUser.spentTokens || 0) + Math.abs(amount);
    }
    saveState();
    return currentUser.tokens;
  },

  getRecommendedMatches: async () => {
    await simulateDelay(150);
    const targetUser = currentUser || CURRENT_USER;
    const wantedSkillNames = (targetUser.skillsWanted || []).map(s => s.name.toLowerCase());
    const offeredSkillNames = (targetUser.skillsOffered || []).map(s => s.name.toLowerCase());

    const canTeachYou = allUsers.filter(u =>
      u.skillsOffered.some(so => wantedSkillNames.some(w => so.name.toLowerCase().includes(w) || w.includes(so.name.toLowerCase())))
    );

    const wantsToLearnFromYou = allUsers.filter(u =>
      u.skillsWanted.some(sw => offeredSkillNames.some(o => sw.name.toLowerCase().includes(o) || o.includes(sw.name.toLowerCase())))
    );

    return {
      canTeachYou,
      wantsToLearnFromYou,
      allRecommended: allUsers
    };
  }
};

export default userService;
