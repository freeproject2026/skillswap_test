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

  /**
   * Poll for new messages since a given ISO timestamp.
   * Returns only messages newer than `since` (or all messages if since is null/undefined).
   */
  pollMessages: async (conversationId, since = null) => {
    const query = since ? `?since=${encodeURIComponent(since)}` : '';
    const res = await apiClient.get(`/chat/conversations/${conversationId}/messages${query}`);
    return {
      messages: res?.messages || [],
      lastMessageAt: res?.lastMessageAt || null
    };
  }
};

export default chatService;
