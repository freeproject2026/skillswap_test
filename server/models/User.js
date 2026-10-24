import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SkillOfferedSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
  evidenceStatus: { type: String, default: 'Peer-Reviewed' },
  evidenceUrl: { type: String, default: '' },
  endorsedCount: { type: Number, default: 0 }
}, { _id: false });

const SkillWantedSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  phone: { type: String, sparse: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  bio: { type: String, default: '' },
  college: { type: String, default: 'University' },
  branch: { type: String, default: 'Computer Science & Engineering' },
  year: { type: String, default: '1st Year' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  teachingRating: { type: Number, default: 0 },
  communicationRating: { type: Number, default: 0 },
  creditsBalance: { type: Number, default: 0 },
  creditsEscrow: { type: Number, default: 0 },
  tokens: { type: Number, default: 0 },
  earnedTokens: { type: Number, default: 0 },
  spentTokens: { type: Number, default: 0 },
  hoursTaught: { type: Number, default: 0 },
  hoursLearned: { type: Number, default: 0 },
  completedSessionsCount: { type: Number, default: 0 },
  tasksApprovedCount: { type: Number, default: 0 },
  learningProgress: [{ type: Object }],
  quizHistory: [{ type: Object }],
  watchHistory: [{ type: Object }],
  skillsOffered: [SkillOfferedSchema],
  skillsWanted: [SkillWantedSchema],
  availability: { type: String, default: 'Weekdays 5-8 PM' },
  sessionFormat: { type: String, default: 'Online' },
  languages: [{ type: String }],
  role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },
  verifiedStudent: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password helper
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Safe JSON serialization (strip passwordHash)
UserSchema.methods.toSafeObject = function() {
  const obj = this.toObject ? this.toObject() : { ...this };
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model('User', UserSchema);
