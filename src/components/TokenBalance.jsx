import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TokenBalance = ({ className = '', compact = false }) => {
  const { tokens, currentUser } = useApp();
  const navigate = useNavigate();

  const credits = currentUser?.creditsBalance ?? currentUser?.credits ?? 0;

  return (
    <button
      onClick={() => navigate('/wallet')}
      title="Click to view Skill Credits & Tutoring Token wallet"
      aria-label="View credit and token balance"
      className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-teal-500/10 via-amber-500/10 to-teal-500/15 hover:from-teal-500/20 hover:to-amber-500/20 border border-teal-300/40 hover:border-teal-500/50 shadow-xs transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/40 ${className}`}
    >
      {/* Coin Icon */}
      <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-900 shadow-xs group-hover:scale-110 transition-transform">
        <Coins className="w-3 h-3 text-slate-950 font-bold" />
      </div>

      {/* Credits & Tokens display */}
      <div className="flex items-center gap-1 font-bold text-xs sm:text-xs text-slate-800 tracking-tight">
        <span className="text-teal-700">{credits}</span>
        <span className="text-[10px] text-teal-600 font-semibold uppercase">Cr</span>
        <span className="text-slate-300">·</span>
        <span className="text-amber-700">{tokens}</span>
        <span className="text-[10px] text-amber-600 font-semibold uppercase hidden xs:inline">Tk</span>
      </div>

      {/* Tiny Sparkle badge */}
      <Sparkles className="w-3 h-3 text-amber-500 opacity-80 group-hover:opacity-100 transition-opacity hidden sm:inline" />
    </button>
  );
};

export default TokenBalance;
