import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, default: '' },
  senderAvatar: { type: String, default: '' },
  text: { type: String, default: '' },
  type: { type: String, enum: ['text', 'session_proposal', 'code', 'file', 'system'], default: 'text' },
  sessionData: { type: Object, default: null },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: String, required: true }],
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now }
});

ConversationSchema.methods.toSafeObject = function(currentUserId = null) {
  const obj = this.toObject ? this.toObject() : { ...this };
  obj.id = obj._id ? obj._id.toString() : obj.id;
  if (currentUserId) {
    obj.participantId = (obj.participants || []).find(p => p !== currentUserId) || obj.participants?.[0];
  }
  // Sort messages chronologically
  if (obj.messages && Array.isArray(obj.messages)) {
    obj.messages = obj.messages.slice().sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return ta - tb;
    });
  }
  delete obj.__v;
  return obj;
};

export const Conversation = mongoose.model('Conversation', ConversationSchema);
