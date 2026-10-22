import { simulateDelay } from './api';
import { MOCK_WALLET_TRANSACTIONS } from '../data/mockNotifications';

const STORAGE_KEY_WALLET_LEDGER = 'skillswap_wallet_ledger';
const STORAGE_KEY_WALLET_BALANCES = 'skillswap_wallet_balances';

const getInitialLedger = () => {
  const stored = localStorage.getItem(STORAGE_KEY_WALLET_LEDGER);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return MOCK_WALLET_TRANSACTIONS;
};

const getInitialBalances = () => {
  const stored = localStorage.getItem(STORAGE_KEY_WALLET_BALANCES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return {
    availableCredits: 150,
    reservedCredits: 60,
    paidTokens: 100,
    pendingSettlementCredits: 0
  };
};

let ledger = getInitialLedger();
let balances = getInitialBalances();

const saveState = () => {
  localStorage.setItem(STORAGE_KEY_WALLET_LEDGER, JSON.stringify(ledger));
  localStorage.setItem(STORAGE_KEY_WALLET_BALANCES, JSON.stringify(balances));
};

export const walletService = {
  getWalletSummary: async () => {
    await simulateDelay(60);
    return {
      balances: { ...balances },
      totalEarnedCredits: 420,
      totalSpentCredits: 270,
      totalEarnedTokens: 420,
      totalSpentTokens: 320
    };
  },

  getLedger: async ({ filterStatus = 'All', currencyType = 'All' } = {}) => {
    await simulateDelay(80);
    let results = [...ledger];

    if (filterStatus && filterStatus !== 'All') {
      results = results.filter(tx => tx.status.toLowerCase() === filterStatus.toLowerCase());
    }

    if (currencyType && currencyType !== 'All') {
      results = results.filter(tx => tx.currencyType === currencyType);
    }

    return results;
  },

  // Reserve credits into escrow upon booking
  reserveCreditsForSession: async (sessionTitle, counterparty, amount) => {
    await simulateDelay(100);
    if (balances.availableCredits < amount) {
      throw new Error(`Insufficient skill credits. Available: ${balances.availableCredits}, Needed: ${amount}`);
    }

    balances.availableCredits -= amount;
    balances.reservedCredits += amount;

    const newTx = {
      id: `tx_res_${Date.now()}`,
      type: 'reserved',
      currencyType: 'skill_credit',
      title: `Escrow Lock: ${sessionTitle}`,
      counterparty,
      date: 'Today',
      amount: -amount,
      status: 'Reserved',
      category: 'escrow_hold',
      note: 'Credits locked in platform escrow until two-sided session completion is confirmed.'
    };

    ledger = [newTx, ...ledger];
    saveState();
    return balances;
  },

  // Release escrow upon two-sided confirmation
  releaseEscrowOnCompletion: async (sessionTitle, counterparty, amount) => {
    await simulateDelay(100);
    balances.reservedCredits = Math.max(0, balances.reservedCredits - amount);

    const newTx = {
      id: `tx_rel_${Date.now()}`,
      type: 'debit',
      currencyType: 'skill_credit',
      title: `Session Settled: ${sessionTitle}`,
      counterparty,
      date: 'Today',
      amount: -amount,
      status: 'Completed',
      category: 'tutoring_spent',
      note: 'Both participants confirmed completion. Escrow released to tutor.'
    };

    ledger = [newTx, ...ledger];
    saveState();
    return balances;
  },

  // Refund credits on cancellation
  refundCreditsOnCancel: async (sessionTitle, counterparty, amount) => {
    await simulateDelay(100);
    balances.reservedCredits = Math.max(0, balances.reservedCredits - amount);
    balances.availableCredits += amount;

    const newTx = {
      id: `tx_ref_${Date.now()}`,
      type: 'credit',
      currencyType: 'skill_credit',
      title: `Automated Refund: ${sessionTitle}`,
      counterparty,
      date: 'Today',
      amount,
      status: 'Refunded',
      category: 'refund',
      note: 'Session cancelled in advance. 100% credit escrow returned.'
    };

    ledger = [newTx, ...ledger];
    saveState();
    return balances;
  },

  // Pause settlement on dispute
  disputeEscrowHold: async (sessionTitle, counterparty, amount, reason) => {
    await simulateDelay(100);
    const newTx = {
      id: `tx_disp_${Date.now()}`,
      type: 'hold',
      currencyType: 'skill_credit',
      title: `Settlement Paused: ${sessionTitle}`,
      counterparty,
      date: 'Today',
      amount: -amount,
      status: 'Disputed',
      category: 'disputed_hold',
      note: `Escrow settlement paused. Reason: ${reason}`
    };

    ledger = [newTx, ...ledger];
    saveState();
    return balances;
  }
};

export default walletService;
