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
  delete obj.__v;
  return obj;
};

export const Video = mongoose.model('Video', VideoSchema);
