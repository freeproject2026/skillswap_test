import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  tutorId: { type: String, required: true },
  tutorName: { type: String, required: true },
  tutorAvatar: { type: String, default: '' },
  tutorCollege: { type: String, default: '' },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentAvatar: { type: String, default: '' },
  skill: { type: String, required: true },
  sessionType: { type: String, default: 'Peer Tutoring' },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Upcoming', 'Awaiting Confirmation', 'Confirmed', 'Completed', 'Disputed', 'Cancelled'],
    default: 'Pending'
  },
  rejectReason: { type: String, default: '' },
  scheduledDate: { type: String, default: 'This Weekend' },
  scheduledTime: { type: String, default: '6:00 PM' },
  durationMinutes: { type: Number, default: 20 },
  creditCost: { type: Number, default: 60 },
  escrowStatus: {
    type: String,
    enum: ['Reserved', 'Settled', 'Refunded', 'Paused'],
    default: 'Reserved'
  },
  tutorPayout: { type: Number, default: 50 },
  platformFee: { type: Number, default: 10 },
  format: { type: String, default: 'Live Online Session' },
  meetingLink: { type: String, default: '' },
  learningObjective: { type: String, default: '' },
  sessionNotes: { type: String, default: '' },
  sharedResources: [{ type: String }],
  whiteboardData: {
    strokes: [
      {
        strokeId: { type: String },
        userId: { type: String },
        tool: { type: String, default: 'pen' },
        color: { type: String, default: '#000000' },
        width: { type: Number, default: 2 },
        points: [{ x: Number, y: Number }],
        timestamp: { type: Date, default: Date.now }
      }
    ],
    lastClearedAt: { type: Date, default: null }
  },
  taskSubmission: {
    url: String,
    notes: String,
    submittedAt: String
  },
  nextSteps: { type: String, default: '' },
  learnerConfirmed: { type: Boolean, default: false },
  teacherConfirmed: { type: Boolean, default: false },
  disputeReason: { type: String, default: null },
  ratingGiven: {
    teachingQuality: Number,
    communication: Number,
    feedback: String
  },
  createdAt: { type: Date, default: Date.now }
});

SessionSchema.methods.toSafeObject = function() {
  const obj = this.toObject ? this.toObject() : { ...this };
  obj.id = obj._id ? obj._id.toString() : obj.id;
  delete obj.__v;
  return obj;
};

export const Session = mongoose.model('Session', SessionSchema);
