import { apiClient } from './api';

export const notificationService = {
  getNotifications: async () => {
    const res = await apiClient.get('/notifications');
    return res?.notifications || [];
  },

  getUnreadCount: async () => {
    const res = await apiClient.get('/notifications/unread-count');
    return res?.count || 0;
  },

  markAsRead: async (id) => {
    const res = await apiClient.patch(`/notifications/${id}/read`, {});
    return !!res?.success;
  },

  markAllAsRead: async () => {
    const res = await apiClient.patch('/notifications/mark-all-read', {});
    return !!res?.success;
  }
};

export default notificationService;
