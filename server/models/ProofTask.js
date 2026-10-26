import mongoose from 'mongoose';

const ProofTaskSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  skill: { type: String, required: true },
  status: { type: String, enum: ['Verified', 'Pending Review', 'Draft'], default: 'Verified' },
  verificationType: { type: String, default: 'Project Code Repository' },
  projectUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  endorsedBy: [{
    id: String,
    name: String,
    avatar: String,
    role: String
  }],
  createdAt: { type: Date, default: Date.now }
});

ProofTaskSchema.methods.toSafeObject = function() {
  const obj = this.toObject ? this.toObject() : { ...this };
  obj.id = obj._id ? obj._id.toString() : obj.id;
  delete obj.__v;
  return obj;
};

export const ProofTask = mongoose.model('ProofTask', ProofTaskSchema);
