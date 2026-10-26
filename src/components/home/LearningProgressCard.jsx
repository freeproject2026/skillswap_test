import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight, CheckCircle2, Clock, BookOpen, Sparkles, Calendar, LogIn } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sessionService } from '../../services/sessionService';

export const LearningProgressCard = () => {
  const navigate = useNavigate();
  const { currentUser, isGuest, setAuthModalOpen } = useApp();
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    if (!currentUser || isGuest) return;
    sessionService.getSessions({ status: 'Completed' })
      .then(sessions => {
        setCompletedSessions(sessions.length);
      })
      .catch(() => {
        setCompletedSessions(currentUser.completedSessionsCount || 0);
      });
  }, [currentUser, isGuest]);

  if (isGuest || !currentUser) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                Learning Progress
              </h3>
              <p className="text-[11px] text-slate-400">Track verified achievements & hours</p>
            </div>
          </div>
        </div>

        <div className="py-6 text-center space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Sign in to track your learning milestones, completed sessions, and verified Skill Passport achievements.
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Track Progress</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Skill Passport
          </span>
          <button
            onClick={() => navigate('/profile')}
            className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
          >
            Preview Passport →
          </button>
        </div>
      </div>
    );
  }

  // Real data calculations
  const totalCompletedSessions = Math.max(completedSessions, currentUser.completedSessionsCount || 0);
  const hoursLearned = currentUser.hoursLearned || 0;
  const completedQuizzesCount = (currentUser.quizHistory || []).length;
  const skillsWanted = currentUser.skillsWanted || [];
  const skillsOffered = currentUser.skillsOffered || [];

  // Total activities registered or completed
  const totalMilestones = totalCompletedSessions + completedQuizzesCount + skillsOffered.length;
  const targetMilestones = Math.max(totalMilestones, 5); // Base benchmark for semester
  const percentage = Math.min(100, Math.round((totalMilestones / targetMilestones) * 100));

  // SVG Circular progress calculation
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const hasActivity = totalCompletedSessions > 0 || completedQuizzesCount > 0 || hoursLearned > 0 || skillsOffered.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              Learning Progress
            </h3>
            <p className="text-[11px] text-slate-400">Verified hours & session milestones</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/sessions')}
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 group"
        >
          <span>Sessions</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Circular Progress + Summary Stat */}
      <div className="py-3 flex items-center gap-4 bg-purple-50/40 dark:bg-purple-950/20 p-3.5 rounded-2xl border border-purple-100/60 dark:border-purple-900/30">
        {/* Circular Progress Ring */}
        <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 76 76">
            <circle
              cx="38"
              cy="38"
              r={radius}
              className="text-purple-100 dark:text-purple-900/40"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="38"
              cy="38"
              r={radius}
              className="text-purple-600 dark:text-purple-400 transition-all duration-1000 ease-out"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">
              {percentage}%
            </span>
            <span className="text-[9px] text-slate-400 font-medium mt-0.5">progress</span>
          </div>
        </div>

        {/* Text Breakdown */}
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            {totalCompletedSessions} Sessions · {hoursLearned} hrs Learned
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {hasActivity
              ? `${completedQuizzesCount} quizzes passed and ${skillsOffered.length} skills listed in your profile.`
              : 'Complete your first exchange or quiz to build verified evidence.'}
          </p>
        </div>
      </div>

      {/* Real Progress Metrics List / Meaningful Empty State */}
      <div className="space-y-2 py-2">
        {hasActivity ? (
          <>
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-xs">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Completed Sessions</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40">
                {totalCompletedSessions} completed
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-xs">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-teal-500 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Learning Hours</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/40">
                {hoursLearned} hrs
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Quizzes Completed</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                {completedQuizzesCount} passed
              </span>
            </div>
          </>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/60 text-center space-y-1.5">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No learning activity yet
            </p>
            <p className="text-[11px] text-slate-400 leading-snug">
              Book a session or take a skill verification quiz to unlock your first verified passport credential.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => navigate('/sessions')}
                className="px-2.5 py-1 rounded-lg bg-teal-600 text-white text-[10px] font-bold hover:bg-teal-700 transition-colors"
              >
                Book a Session
              </button>
              <button
                onClick={() => navigate('/requests')}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Post Request
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          Skill Passport
        </span>
        <button
          onClick={() => navigate('/profile')}
          className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
        >
          View Passport →
        </button>
      </div>
    </div>
  );
};

export default LearningProgressCard;
