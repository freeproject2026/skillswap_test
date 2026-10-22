import { apiClient, simulateDelay } from './api';
import { CURRENT_USER, MOCK_USERS } from '../data/mockUsers';

const STORAGE_KEY_USER = 'skillswap_current_user';
const STORAGE_KEY_USERS = 'skillswap_all_users';

const getInitialUser = () => {
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
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(allUsers));
};

export const userService = {
  getCurrentUser: async () => {
    await simulateDelay(80);
    return { ...currentUser };
  },

  getUserById: async (id) => {
    await simulateDelay(100);
    if (id === currentUser.id || id === 'me') {
      return { ...currentUser };
    }
    const found = allUsers.find(u => u.id === id);
    if (!found) throw new Error('User not found');
    return { ...found };
  },

  getAllUsers: async () => {
    await simulateDelay(120);
    return [...allUsers];
  },

  updateProfile: async (updatedFields) => {
    await simulateDelay(200);
    currentUser = {
      ...currentUser,
      ...updatedFields
    };
    saveState();
    return { ...currentUser };
  },

  updateTokens: async (amount, reason = '') => {
    await simulateDelay(100);
    currentUser.tokens = Math.max(0, currentUser.tokens + amount);
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
    // Find users who teach what current user wants to learn, or want what current user teaches
    const wantedSkillNames = (currentUser.skillsWanted || []).map(s => s.name.toLowerCase());
    const offeredSkillNames = (currentUser.skillsOffered || []).map(s => s.name.toLowerCase());

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

