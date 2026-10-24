import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, Sparkles, Award } from 'lucide-react';

export const CommunityPromoCard = () => {
  const navigate = useNavigate();

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-teal-900 p-5 text-white overflow-hidden shadow-lg border border-indigo-500/20 space-y-3">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-teal-400/20 rounded-full blur-xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-24 h-24 bg-purple-500/20 rounded-full blur-xl pointer-events-none"></div>

      {/* Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-bold uppercase tracking-wider text-teal-300">
          <Sparkles className="w-3 h-3 text-teal-300" />
          <span>Campus Circles</span>
        </span>
        <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-300">
          <Users className="w-4 h-4" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 space-y-1">
        <h4 className="text-base font-extrabold text-white tracking-tight leading-snug">
          Level up your skills
        </h4>
        <p className="text-xs text-slate-200/90 leading-relaxed">
          Join campus challenges, workshops and group learning circles.
        </p>
      </div>

      {/* Action Button */}
      <div className="relative z-10 pt-1">
        <button
          onClick={() => navigate('/campus')}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-500/30 flex items-center justify-center gap-1.5 group"
        >
          <span>Explore Community</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default CommunityPromoCard;
