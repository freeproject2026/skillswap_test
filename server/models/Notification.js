import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: [
      'connection_request',
      'new_follower',
      'session_accepted',
      'session_rejected',
      'skill_swap_request',
      'session_completed',
      'token_credit',
      'general'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  actionUrl: { type: String, default: '' },
  sender: {
    id: String,
    name: String,
    avatar: String
  },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

NotificationSchema.methods.toSafeObject = function() {
  const obj = this.toObject ? this.toObject() : { ...this };
  obj.id = obj._id ? obj._id.toString() : obj.id;
  obj.data = obj.metadata || {};
  delete obj.__v;
  return obj;
};

export const Notification = mongoose.model('Notification', NotificationSchema);
