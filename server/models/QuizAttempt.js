import mongoose from 'mongoose';

const QuizAttemptSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  quizId: { type: String, required: true },
  quizTitle: { type: String, required: true },
  topic: { type: String, default: '' },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  answers: [{
    questionId: String,
    selectedOption: Number,
    isCorrect: Boolean
  }],
  completedAt: { type: Date, default: Date.now }
});

QuizAttemptSchema.methods.toSafeObject = function() {
  const obj = this.toObject ? this.toObject() : { ...this };
  obj.id = obj._id ? obj._id.toString() : obj.id;
  delete obj.__v;
  return obj;
};

export const QuizAttempt = mongoose.model('QuizAttempt', QuizAttemptSchema);
