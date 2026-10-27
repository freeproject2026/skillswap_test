import { apiClient } from './api';

export const chatService = {
  getConversations: async () => {
    const res = await apiClient.get('/chat/conversations');
    return res?.conversations || [];
  },

  getConversationByUserId: async (userId) => {
    const res = await apiClient.get(`/chat/conversations/${userId}`);
    return res?.conversation || null;
  },

  sendMessage: async (conversationId, messagePayload) => {
    const res = await apiClient.post(`/chat/conversations/${conversationId}/messages`, messagePayload);
    if (!res?.message) throw new Error(res?.error || 'Failed to send message');
    return res.message;
  },

  getUnreadCount: async () => {
    try {
      const res = await apiClient.get('/chat/unread-count');
      return res?.count || 0;
    } catch {
      return 0;
    }
  },

  /**
   * Poll for new messages since a given ISO timestamp.
   * Returns only messages newer than `since` (or all messages if since is null/undefined).
   */
  pollMessages: async (conversationId, since = null) => {
    const sinceParam = since instanceof Date ? since.toISOString() : since;
    const query = sinceParam ? `?since=${encodeURIComponent(sinceParam)}` : '';
    const res = await apiClient.get(`/chat/conversations/${conversationId}/messages${query}`);
    return {
      messages: res?.messages || [],
      lastMessageAt: res?.lastMessageAt || null
    };
  }
};

export default chatService;
