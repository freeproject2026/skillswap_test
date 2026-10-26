import { apiClient } from './api';

export const connectionService = {
  getConnectionStatuses: async () => {
    const res = await apiClient.get('/connections/status');
    return res?.statuses || {};
  },

  getFollowingIds: async () => {
    const res = await apiClient.get('/connections/status');
    return res?.following || [];
  },

  sendConnectionRequest: async (userId) => {
    const res = await apiClient.post(`/connections/request/${userId}`, {});
    return res?.success ? 'pending' : 'none';
  },

  acceptConnectionRequest: async (userId) => {
    const res = await apiClient.post(`/connections/accept/${userId}`, {});
    return res?.success ? 'connected' : 'none';
  },

  declineConnectionRequest: async (userId) => {
    const res = await apiClient.post(`/connections/decline/${userId}`, {});
    return res?.success ? 'none' : 'pending';
  },

  toggleFollow: async (userId) => {
    const res = await apiClient.post(`/connections/follow/${userId}`, {});
    return !!res?.isFollowing;
  }
};

export default connectionService;
