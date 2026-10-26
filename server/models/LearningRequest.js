import mongoose from 'mongoose';

const LearningRequestSchema = new mongoose.Schema({
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorAvatar: { type: String, default: '' },
  authorCollege: { type: String, default: '' },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  skill: { type: String, required: true },
  category: { type: String, default: 'General' },
  currentProficiency: { type: String, default: 'Beginner' },
  targetProficiency: { type: String, default: 'Intermediate' },
  learningGoal: { type: String, default: '' },
  desiredOutcome: { type: String, default: '' },
  preferredSchedule: { type: String, default: 'Weekday Evenings' },
  language: { type: String, default: 'English' },
  format: { type: String, default: 'Live Online Session' },
  proposedCredits: { type: Number, default: 40 },
  responses: [{
    responderId: String,
    responderName: String,
    responderAvatar: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['Open', 'In Progress', 'Fulfilled', 'Closed'], default: 'Open' },
  createdAt: { type: Date, default: Date.now }
});

LearningRequestSchema.methods.toSafeObject = function() {
  const obj = this.toObject ? this.toObject() : { ...this };
  obj.id = obj._id ? obj._id.toString() : obj.id;
  obj.responsesCount = (obj.responses || []).length;
  delete obj.__v;
  return obj;
};

export const LearningRequest = mongoose.model('LearningRequest', LearningRequestSchema);
