import mongoose from 'mongoose';

const WalletTransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: [
      'credit_earned',
      'credit_spent',
      'tokens_added',
      'tokens_spent',
      'escrow_reserved',
      'escrow_refunded',
      'escrow_settled'
    ],
    required: true
  },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['credits', 'tokens'], default: 'credits' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['completed', 'pending', 'cancelled'], default: 'completed' },
  counterpartyId: { type: String, default: null },
  counterpartyName: { type: String, default: '' },
  sessionId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

WalletTransactionSchema.methods.toSafeObject = function() {
  const obj = this.toObject ? this.toObject() : { ...this };
  obj.id = obj._id ? obj._id.toString() : obj.id;
  delete obj.__v;
  return obj;
};

export const WalletTransaction = mongoose.model('WalletTransaction', WalletTransactionSchema);
