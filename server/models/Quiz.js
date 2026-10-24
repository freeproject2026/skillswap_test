import mongoose from 'mongoose';

const QuizQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  explanation: { type: String, default: '' }
}, { _id: false });

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  topic: { type: String, required: true, trim: true },
  category: { type: String, required: true, default: 'General' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  questions: [QuizQuestionSchema],
  creator: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' }
  },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  createdAt: { type: Date, default: Date.now }
});

QuizSchema.methods.toSafeObject = function() {
  const obj = this.toObject ? this.toObject() : { ...this };
  obj.id = obj._id ? obj._id.toString() : obj.id;
  delete obj.__v;
  return obj;
};

export const Quiz = mongoose.model('Quiz', QuizSchema);
