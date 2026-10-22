import { apiClient, simulateDelay } from './api';
import { MOCK_USERS } from '../data/mockUsers';

const STORAGE_KEY_CONNECTIONS = 'skillswap_connections_state';

const getInitialConnectionsState = () => {
  const stored = localStorage.getItem(STORAGE_KEY_CONNECTIONS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  // Default connection status map: { [userId]: 'connected' | 'pending' | 'none' }
  const initialMap = {};
  const initialFollowing = ['usr_1', 'usr_3', 'usr_2'];
  MOCK_USERS.forEach(u => {
    initialMap[u.id] = u.connectionStatus || 'none';
  });
  return { statuses: initialMap, following: initialFollowing };
};

let connectionsState = getInitialConnectionsState();

const saveState = () => {
  localStorage.setItem(STORAGE_KEY_CONNECTIONS, JSON.stringify(connectionsState));
};

export const connectionService = {
  getConnectionStatuses: async () => {
    await simulateDelay(60);
    return { ...connectionsState.statuses };
  },

  getFollowingIds: async () => {
    await simulateDelay(60);
    return [...connectionsState.following];
  },

  sendConnectionRequest: async (userId) => {
    await simulateDelay(150);
    connectionsState.statuses[userId] = 'pending';
    saveState();
    return 'pending';
  },

  acceptConnectionRequest: async (userId) => {
    await simulateDelay(150);
    connectionsState.statuses[userId] = 'connected';
    saveState();
    return 'connected';
  },

  declineConnectionRequest: async (userId) => {
    await simulateDelay(150);
    connectionsState.statuses[userId] = 'none';
    saveState();
    return 'none';
  },

  toggleFollow: async (userId) => {
    await simulateDelay(100);
    const isFollowing = connectionsState.following.includes(userId);
    if (isFollowing) {
      connectionsState.following = connectionsState.following.filter(id => id !== userId);
    } else {
      connectionsState.following.push(userId);
    }
    saveState();
    return !isFollowing;
  }
};

export default connectionService;

