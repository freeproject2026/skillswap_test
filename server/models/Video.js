import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  authorId: { type: String, required: true },
  author: { type: String, required: true },
  avatar: { type: String, default: '' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 }
}, { _id: false });

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  category: { type: String, required: true, default: 'General' },
  duration: { type: String, default: '00:00' },
  durationSeconds: { type: Number, default: 0 },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, default: '' },
  fileName: { type: String },
  fileSize: { type: Number },
  mimeType: { type: String },
  skillsTaught: [{ type: String }],
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  language: { type: String, default: 'English' },
  visibility: { type: String, enum: ['public', 'private', 'selected'], default: 'public' },
  allowedStudentIds: [{ type: String }],
  status: { type: String, enum: ['uploading', 'processing', 'published', 'failed'], default: 'published' },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  savedBy: [{ type: String }],
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  ratings: [{
    userId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
  }],
  isFeatured: { type: Boolean, default: false },
  creator: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    username: { type: String, default: '' },
    avatar: { type: String, default: '' },
    college: { type: String, default: '' },
    branch: { type: String, default: '' }
  },
  comments: [CommentSchema],
  createdAt: { type: Date, default: Date.now }
});

VideoSchema.methods.toSafeObject = function(currentUserId = null) {
  const obj = this.toObject ? this.toObject() : { ...this };
  obj.id = obj._id ? obj._id.toString() : obj.id;
  obj.isLiked = currentUserId ? (obj.likedBy || []).includes(currentUserId) : false;
  obj.isSaved = currentUserId ? (obj.savedBy || []).includes(currentUserId) : false;
  obj.rating = this.rating || 0;
  obj.ratingCount = this.ratingCount || (this.ratings ? this.ratings.length : 0);
  obj.userRating = currentUserId && this.ratings
    ? (this.ratings.find(r => String(r.userId) === String(currentUserId))?.rating || null)
    : null;
  // Normalize any hardcoded localhost URLs to relative path so client resolves to active backend
  if (typeof obj.videoUrl === 'string' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)$/i.test(obj.videoUrl)) {
    obj.videoUrl = obj.videoUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, '');
  }
  delete obj.__v;
  return obj;
};

export const Video = mongoose.model('Video', VideoSchema);
