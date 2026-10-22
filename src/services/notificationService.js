import { apiClient, simulateDelay } from './api';
import { MOCK_NOTIFICATIONS } from '../data/mockNotifications';

const STORAGE_KEY_NOTIFS = 'skillswap_notifications';

const getInitialNotifications = () => {
  const stored = localStorage.getItem(STORAGE_KEY_NOTIFS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return MOCK_NOTIFICATIONS;
};

let notifications = getInitialNotifications();

const saveState = () => {
  localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
};

export const notificationService = {
  getNotifications: async () => {
    await simulateDelay(80);
    return [...notifications];
  },

  getUnreadCount: async () => {
    await simulateDelay(50);
    return notifications.filter(n => !n.isRead).length;
  },

  markAsRead: async (id) => {
    await simulateDelay(60);
    notifications = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    saveState();
    return true;
  },

  markAllAsRead: async () => {
    await simulateDelay(80);
    notifications = notifications.map(n => ({ ...n, isRead: true }));
    saveState();
    return true;
  },

  updateNotificationStatus: async (id, status) => {
    await simulateDelay(100);
    notifications = notifications.map(n => n.id === id ? { ...n, status, isRead: true } : n);
    saveState();
    return status;
  }
};

export default notificationService;

