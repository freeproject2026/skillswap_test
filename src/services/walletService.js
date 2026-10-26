import { apiClient } from './api';

export const walletService = {
  getWalletSummary: async () => {
    const res = await apiClient.get('/wallet/summary');
    if (!res) {
      return {
        balances: {
          availableCredits: 0,
          reservedCredits: 0,
          paidTokens: 0,
          pendingSettlementCredits: 0
        },
        totalEarnedCredits: 0,
        totalSpentCredits: 0
      };
    }
    return {
      balances: res.balances || {
        availableCredits: 0,
        reservedCredits: 0,
        paidTokens: 0,
        pendingSettlementCredits: 0
      },
      totalEarnedCredits: res.totalEarnedCredits || 0,
      totalSpentCredits: res.totalSpentCredits || 0
    };
  },

  getLedger: async ({ filterStatus = 'All' } = {}) => {
    const query = filterStatus && filterStatus !== 'All' ? `?filterStatus=${encodeURIComponent(filterStatus)}` : '';
    const res = await apiClient.get(`/wallet/ledger${query}`);
    return res?.transactions || [];
  },

  updateTokens: async (amount, reason = '') => {
    const res = await apiClient.post('/wallet/tokens/update', { amount, reason });
    return res?.newBalance ?? 0;
  }
};

export default walletService;
