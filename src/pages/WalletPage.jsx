import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Coins, ArrowUpRight, ArrowDownRight, Sparkles,
  Info, Wallet, TrendingUp, TrendingDown, ShieldCheck, Lock,
  AlertTriangle, RefreshCw, CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { walletService } from '../services/walletService';
import AuthGate from '../components/auth/AuthGate';
import AuthModal from '../components/auth/AuthModal';

export const WalletPage = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    isGuest,
    showToast,
    authModalOpen,
    setAuthModalOpen,
    authModalTab
  } = useApp();

  const [walletSummary, setWalletSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [activeLedgerTab, setActiveLedgerTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [expandedTxId, setExpandedTxId] = useState(null);

  const loadWallet = async () => {
    setLoading(true);
    try {
      const [summary, txs] = await Promise.all([
        walletService.getWalletSummary(),
        walletService.getLedger({ filterStatus: activeLedgerTab })
      ]);
      setWalletSummary(summary);
      setLedger(txs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadWallet();
    }
  }, [activeLedgerTab, currentUser]);

  // Guest / Unauthenticated Protection
  if (isGuest || !currentUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-8">
        <AuthGate
          featureName="Student Skill-Credit Wallet & Escrow Ledger"
          description="Sign in with your campus account to view your available exchange credits, escrow balances, and audit history."
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialTab={authModalTab}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 space-y-6 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          <span>Student Skill-Credit Wallet & Ledger</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Dual ledger separating community peer-exchange credits from paid tutoring tokens
        </p>
      </div>

      {/* Dual Balances Display Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Peer Skill-Exchange Credits */}
        <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-navy-900 to-slate-800 p-6 text-white overflow-hidden shadow-card border border-slate-700/60">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent"></div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Campus Skill Credits
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold">
                  Peer Escrow Protected
                </span>
              </div>
              <p className="text-4xl font-extrabold text-white mb-1">
                {walletSummary?.balances?.availableCredits ?? 0}
              </p>
              <p className="text-xs text-slate-300">Available Skill-Exchange Balance</p>
            </div>

            {/* Reserved Escrow Row */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-300">
                <Lock className="w-3 h-3 text-amber-400" />
                Reserved in Escrow:
              </span>
              <strong className="text-amber-300 font-bold">
                {walletSummary?.balances?.reservedCredits ?? 0} Credits
              </strong>
            </div>
          </div>
        </div>

        {/* Card 2: Paid Session Tokens */}
        <div className="relative rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 text-white overflow-hidden shadow-card border border-slate-800">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> Paid Tutoring Tokens
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  Peer Balance
                </span>
              </div>
              <p className="text-4xl font-extrabold text-amber-300 mb-1">
                {walletSummary?.balances?.paidTokens ?? 0}
              </p>
              <p className="text-xs text-slate-400">Reserved for compensated student tutoring</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Tokens Earned:</span>
              <strong className="text-emerald-400">{walletSummary?.totalEarnedTokens ?? 0}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Escrow Workflow Transparency Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>How SkillSwap Escrow Protects Students</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">1. Reserve</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Credits are locked in escrow when a booking is accepted. Neither party can withdraw early.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">2. Learn</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Students meet in the Learning Room, take notes, and complete practical task proofs.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-bold text-teal-800 dark:text-teal-300 block">3. Two-Sided Settle</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Both learner and tutor click 'Confirm'. Only then are escrow credits released.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-bold text-rose-700 dark:text-rose-400 block">4. Mediation</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              If an issue occurs, click 'Dispute'. Settlement pauses immediately until campus review.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic pt-1">
          Simulated escrow ledger. Dual balances are strictly validated.
        </p>
      </div>

      {/* Transaction Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Transaction Ledger & Audit Trail
          </h3>

          {/* Ledger Filter Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
            {['All', 'Reserved', 'Completed', 'Disputed', 'Refunded'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveLedgerTab(tab)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeLedgerTab === tab
                    ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {ledger.map(tx => {
            const isExpanded = expandedTxId === tx.id;
            const isPositive = (tx.amount || tx.tokens || 0) > 0;
            const amountVal = tx.amount !== undefined ? tx.amount : tx.tokens;

            return (
              <div
                key={tx.id}
                onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.status === 'Completed'
                        ? isPositive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        : tx.status === 'Reserved'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                        : tx.status === 'Disputed'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                        : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                    }`}>
                      {tx.status === 'Reserved' ? (
                        <Lock className="w-4 h-4" />
                      ) : tx.status === 'Disputed' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                        {tx.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {tx.counterparty} · {tx.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`text-xs sm:text-sm font-extrabold ${
                      tx.status === 'Reserved'
                        ? 'text-amber-600 dark:text-amber-400'
                        : tx.status === 'Disputed'
                        ? 'text-rose-600 dark:text-rose-400'
                        : isPositive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {isPositive ? `+${amountVal}` : amountVal} {tx.currencyType === 'paid_token' ? 'Tokens' : 'Credits'}
                    </p>
                    <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      tx.status === 'Completed'
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                        : tx.status === 'Reserved'
                        ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                        : tx.status === 'Disputed'
                        ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>

                {/* Expanded Details View */}
                {isExpanded && tx.note && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl">
                    <p><strong>Ledger Audit Note:</strong> {tx.note}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Reference ID: {tx.id}</p>
                  </div>
                )}
              </div>
            );
          })}

          {ledger.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No transactions match the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
