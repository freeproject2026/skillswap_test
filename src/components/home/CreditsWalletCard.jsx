import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowRight, TrendingUp, ArrowDownRight, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { walletService } from '../../services/walletService';

export const CreditsWalletCard = () => {
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState({
    availableCredits: 150,
    earnedCredits: 420,
    spentCredits: 270,
    reservedCredits: 60
  });

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const summary = await walletService.getWalletSummary();
        if (summary) {
          setWalletData({
            availableCredits: summary.balances?.availableCredits || 150,
            earnedCredits: summary.totalEarnedCredits || 420,
            spentCredits: summary.totalSpentCredits || 270,
            reservedCredits: summary.balances?.reservedCredits || 60
          });
        }
      } catch (err) {
        console.error('Error fetching wallet summary:', err);
      }
    };
    fetchWallet();
  }, []);

  const totalActivity = walletData.earnedCredits + walletData.spentCredits || 1;
  const earnedRatio = Math.round((walletData.earnedCredits / totalActivity) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              Your Credits
            </h3>
            <p className="text-[11px] text-slate-400">Skill exchange balance & ledger</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/wallet')}
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 group"
        >
          <span>View Wallet</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Main Balance Display */}
      <div className="py-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {walletData.availableCredits}
            </span>
            <span className="ml-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Credits Available
            </span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800/40">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active</span>
          </div>
        </div>

        {/* Horizontal Progress Ratio Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" /> Earned: {walletData.earnedCredits}
            </span>
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              Spent: {walletData.spentCredits} <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${earnedRatio}%` }}
              title={`Earned: ${earnedRatio}%`}
            ></div>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Earned</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              +{walletData.earnedCredits} cr
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Spent</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              -{walletData.spentCredits} cr
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info / Escrow notice */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          {walletData.reservedCredits} credits safe in escrow
        </span>
        <span className="text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => navigate('/wallet')}>
          Top up →
        </span>
      </div>
    </div>
  );
};

export default CreditsWalletCard;
