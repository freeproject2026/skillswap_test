import { apiClient, simulateDelay } from './api';
import { MOCK_CONVERSATIONS } from '../data/mockMessages';

const STORAGE_KEY_CHATS = 'skillswap_chat_conversations';

const getInitialConversations = () => {
  const stored = localStorage.getItem(STORAGE_KEY_CHATS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return MOCK_CONVERSATIONS;
};

let conversations = getInitialConversations();

const saveState = () => {
  localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(conversations));
};

export const chatService = {
  getConversations: async () => {
    await simulateDelay(100);
    return [...conversations];
  },

  getConversationByUserId: async (userId) => {
    await simulateDelay(80);
    let conv = conversations.find(c => c.participantId === userId);
    if (!conv) {
      // Create empty new conversation if starting fresh chat with connected person
      conv = {
        id: `conv_${Date.now()}`,
        participantId: userId,
        unreadCount: 0,
        lastMessage: 'Started a new conversation',
        lastMessageAt: 'Just now',
        messages: []
      };
      conversations = [conv, ...conversations];
      saveState();
    }
    return { ...conv };
  },

  sendMessage: async (conversationId, messagePayload) => {
    await simulateDelay(100);
    const convIndex = conversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      const newMsg = {
        id: `msg_${Date.now()}`,
        senderId: messagePayload.senderId || 'usr_me',
        text: messagePayload.text,
        timestamp: 'Just now',
        type: messagePayload.type || 'text',
        sessionData: messagePayload.sessionData || null
      };

      conversations[convIndex].messages.push(newMsg);
      conversations[convIndex].lastMessage = messagePayload.text;
      conversations[convIndex].lastMessageAt = 'Just now';

      if (messagePayload.sessionData) {
        conversations[convIndex].activeSession = messagePayload.sessionData;
      }

      saveState();
      return newMsg;
    }
    throw new Error('Conversation not found');
  },

  updateSessionStatus: async (conversationId, sessionId, newStatus) => {
    await simulateDelay(150);
    const convIndex = conversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      const conv = conversations[convIndex];
      if (conv.activeSession && conv.activeSession.id === sessionId) {
        conv.activeSession.status = newStatus;
      }

      // Also update in message stream if present
      conv.messages = conv.messages.map(m => {
        if (m.sessionData && m.sessionData.id === sessionId) {
          return {
            ...m,
            sessionData: {
              ...m.sessionData,
              status: newStatus
            }
          };
        }
        return m;
      });

      // Add system confirmation message in chat
      const statusText = newStatus === 'Accepted'
        ? 'Session proposal was accepted! The token escrow is locked until the session completes.'
        : newStatus === 'Declined'
        ? 'Session proposal was declined.'
        : `Session marked as ${newStatus}.`;

      conv.messages.push({
        id: `msg_sys_${Date.now()}`,
        senderId: 'system',
        text: statusText,
        timestamp: 'Just now',
        type: 'system'
      });

      saveState();
      return conv.activeSession;
    }
    throw new Error('Conversation not found');
  }
};

export default chatService;

