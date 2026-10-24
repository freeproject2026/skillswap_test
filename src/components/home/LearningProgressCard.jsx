import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight, CheckCircle2, Clock, CircleDot, Sparkles } from 'lucide-react';

export const LearningProgressCard = () => {
  const navigate = useNavigate();

  // Learning Goals List
  const [goals] = useState([
    { id: 'g1', title: 'Python Basics', status: 'Completed', color: 'emerald', category: 'Programming' },
    { id: 'g2', title: 'Web Development', status: 'Completed', color: 'emerald', category: 'Frontend' },
    { id: 'g3', title: 'UI/UX Design', status: 'In Progress', color: 'blue', category: 'Design Systems' },
    { id: 'g4', title: 'DSA – Algorithms', status: 'In Progress', color: 'blue', category: 'Computer Science' },
    { id: 'g5', title: 'Machine Learning Basics', status: 'Not Started', color: 'slate', category: 'AI & Data' },
  ]);

  const completedCount = goals.filter(g => g.status === 'Completed').length;
  const inProgressCount = goals.filter(g => g.status === 'In Progress').length;
  const totalCount = goals.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  // SVG Circular progress calculation
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
              Your Progress
            </h3>
            <p className="text-[11px] text-slate-400">Semester skill milestones & roadmap</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/requests')}
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 group"
        >
          <span>View Details</span>
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
            <span className="text-[9px] text-slate-400 font-medium mt-0.5">done</span>
          </div>
        </div>

        {/* Text Breakdown */}
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            {completedCount} of {totalCount} Goals Completed
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {inProgressCount} in progress this semester. Keep going to earn your verified badge!
          </p>
        </div>
      </div>

      {/* Goals Status List */}
      <div className="space-y-2 py-2">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-xs"
          >
            <div className="flex items-center gap-2.5">
              {goal.status === 'Completed' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : goal.status === 'In Progress' ? (
                <CircleDot className="w-4 h-4 text-blue-500 animate-pulse shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
              )}
              <span className={`font-semibold ${
                goal.status === 'Completed'
                  ? 'text-slate-800 dark:text-slate-200'
                  : goal.status === 'In Progress'
                  ? 'text-blue-900 dark:text-blue-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {goal.title}
              </span>
            </div>

            {/* Status Pill */}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                goal.status === 'Completed'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                  : goal.status === 'In Progress'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {goal.status}
            </span>
          </div>
        ))}
      </div>

      {/* Footer link */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          Skill Passport Ready
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
