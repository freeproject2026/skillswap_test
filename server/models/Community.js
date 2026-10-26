import mongoose from 'mongoose';

const CommunitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Users' },
  category: { type: String, default: 'Engineering' },
  members: [{ type: String }],
  memberCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  activeDiscussions: { type: Number, default: 0 },
  workshops: [{
    id: String,
    title: String,
    speaker: String,
    speakerRole: String,
    speakerAvatar: String,
    date: String,
    time: String,
    attendees: [{ type: String }],
    attendeesCount: { type: Number, default: 0 },
    isHandsOn: { type: Boolean, default: true }
  }],
  challenges: [{
    id: String,
    title: String,
    badge: String,
    category: String,
    difficulty: String,
    deadline: String,
    participants: [{ type: String }],
    participantsCount: { type: Number, default: 0 },
    tokenReward: Number,
    solvedBy: [{ type: String }]
  }],
  createdAt: { type: Date, default: Date.now }
});

CommunitySchema.methods.toSafeObject = function(currentUserId = null) {
  const obj = this.toObject ? this.toObject() : { ...this };
  obj.id = obj._id ? obj._id.toString() : obj.id;
  obj.isJoined = currentUserId ? (obj.members || []).includes(currentUserId) : false;
  if (obj.workshops) {
    obj.workshops = obj.workshops.map(w => ({
      ...w,
      isRegistered: currentUserId ? (w.attendees || []).includes(currentUserId) : false
    }));
  }
  if (obj.challenges) {
    obj.challenges = obj.challenges.map(c => ({
      ...c,
      isSubmitted: currentUserId ? (c.solvedBy || []).includes(currentUserId) : false
    }));
  }
  delete obj.__v;
  return obj;
};

export const Community = mongoose.model('Community', CommunitySchema);
