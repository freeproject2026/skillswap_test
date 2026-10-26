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
  }
};

export default chatService;
