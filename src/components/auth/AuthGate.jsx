import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, UserPlus, Compass, Shield, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthGate = ({
  featureName = 'Student Feature',
  description = 'This feature requires an authenticated SkillSwap student profile to access.'
}) => {
  const navigate = useNavigate();
  const { setAuthModalOpen } = useApp();

  return (
    <div className="max-w-xl mx-auto my-12 px-4 text-center">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Lock Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/25">
          <Lock className="w-8 h-8" />
        </div>

        {/* Title & Description */}
        <div className="relative space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800/40">
            <Shield className="w-3.5 h-3.5" />
            <span>Student Authentication Required</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sign In to Access {featureName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Unlocked Benefits */}
        <div className="text-left bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            <span>Exchange knowledge 1:1 and earn semester learning credits</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            <span>Schedule peer sessions in the live interactive learning room</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            <span>Build a verified Skill Passport with peer-reviewed evidence</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-500/20"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Student Account</span>
          </button>

          <button
            onClick={() => navigate('/connect/people')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Public Skills</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthGate;
