import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { WalletTransaction } from '../models/WalletTransaction.js';

const router = express.Router();

// GET /api/wallet/summary – Balances & transaction metrics
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const txs = await WalletTransaction.find({ userId: req.user.id });

    const totalEarnedCredits = txs
      .filter(t => t.type === 'credit_earned')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpentCredits = txs
      .filter(t => t.type === 'credit_spent' || t.type === 'escrow_reserved')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      balances: {
        availableCredits: user.creditsBalance || 0,
        reservedCredits: user.creditsEscrow || 0,
        paidTokens: user.tokens || 0,
        pendingSettlementCredits: 0
      },
      totalEarnedCredits,
      totalSpentCredits
    });
  } catch (err) {
    console.error('Wallet summary error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve wallet summary.' });
  }
});

// GET /api/wallet/ledger – Paginated transaction history
router.get('/ledger', requireAuth, async (req, res) => {
  try {
    const { filterStatus } = req.query;
    const query = { userId: req.user.id };

    if (filterStatus && filterStatus !== 'All') {
      if (filterStatus === 'Completed') query.status = 'completed';
      else if (filterStatus === 'Reserved') query.type = 'escrow_reserved';
      else if (filterStatus === 'Earned') query.type = 'credit_earned';
    }

    const txs = await WalletTransaction.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      transactions: txs.map(t => t.toSafeObject())
    });
  } catch (err) {
    console.error('Wallet ledger error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve wallet ledger.' });
  }
});

// POST /api/wallet/tokens/update – Adjust tokens
router.post('/tokens/update', requireAuth, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const delta = Number(amount);
    if (isNaN(delta)) return res.status(400).json({ success: false, error: 'Invalid token amount.' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    user.tokens = Math.max(0, (user.tokens || 0) + delta);
    if (delta > 0) {
      user.earnedTokens = (user.earnedTokens || 0) + delta;
    } else {
      user.spentTokens = (user.spentTokens || 0) + Math.abs(delta);
    }
    await user.save();

    await WalletTransaction.create({
      userId: req.user.id,
      type: delta >= 0 ? 'tokens_added' : 'tokens_spent',
      amount: Math.abs(delta),
      currency: 'tokens',
      title: delta >= 0 ? 'Tokens Received' : 'Tokens Spent',
      description: reason || (delta >= 0 ? 'Token balance credit' : 'Token usage')
    });

    res.json({
      success: true,
      newBalance: user.tokens
    });
  } catch (err) {
    console.error('Update tokens error:', err);
    res.status(500).json({ success: false, error: 'Failed to update token balance.' });
  }
});

export default router;
