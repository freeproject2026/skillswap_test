import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Calendar, Wallet, Award, ArrowUpRight } from 'lucide-react';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'discover',
      title: 'Discover Skills',
      description: 'Find mentors & learners',
      icon: Search,
      path: '/connect/people',
      cardBg: 'bg-blue-50/70 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30',
      borderColor: 'border-blue-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700/60',
      iconBg: 'bg-blue-500 text-white shadow-blue-500/25',
      titleColor: 'text-blue-950 dark:text-blue-100',
    },
    {
      id: 'request',
      title: 'Post Learning Request',
      description: 'Need help or want to teach?',
      icon: Plus,
      path: '/requests',
      cardBg: 'bg-teal-50/70 hover:bg-teal-50 dark:bg-teal-950/20 dark:hover:bg-teal-950/30',
      borderColor: 'border-teal-100 dark:border-teal-900/40 hover:border-teal-300 dark:hover:border-teal-700/60',
      iconBg: 'bg-teal-600 text-white shadow-teal-600/25',
      titleColor: 'text-teal-950 dark:text-teal-100',
    },
    {
      id: 'session',
      title: 'Book a Session',
      description: 'Schedule your exchange',
      icon: Calendar,
      path: '/sessions',
      cardBg: 'bg-purple-50/70 hover:bg-purple-50 dark:bg-purple-950/20 dark:hover:bg-purple-950/30',
      borderColor: 'border-purple-100 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700/60',
      iconBg: 'bg-purple-600 text-white shadow-purple-600/25',
      titleColor: 'text-purple-950 dark:text-purple-100',
    },
    {
      id: 'credits',
      title: 'View Credits',
      description: 'Check balance & transactions',
      icon: Wallet,
      path: '/wallet',
      cardBg: 'bg-amber-50/70 hover:bg-amber-50 dark:bg-amber-950/20 dark:hover:bg-amber-950/30',
      borderColor: 'border-amber-100 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-700/60',
      iconBg: 'bg-amber-500 text-white shadow-amber-500/25',
      titleColor: 'text-amber-950 dark:text-amber-100',
    },
    {
      id: 'passport',
      title: 'Open Skill Passport',
      description: 'Showcase your achievements',
      icon: Award,
      path: '/profile',
      cardBg: 'bg-emerald-50/70 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30',
      borderColor: 'border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-700/60',
      iconBg: 'bg-emerald-600 text-white shadow-emerald-600/25',
      titleColor: 'text-emerald-950 dark:text-emerald-100',
    },
  ];

  return (
    <section className="space-y-3">
      {/* Section Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Quick Actions
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Get started with what you want to do today.
        </p>
      </div>

      {/* Cards Grid: 5 columns on desktop (xl), 2-3 on tablet, 1-2 on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {actions.map((act) => {
          const Icon = act.icon;

          return (
            <button
              key={act.id}
              onClick={() => navigate(act.path)}
              className={`group text-left p-4 rounded-2xl border ${act.borderColor} ${act.cardBg} transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between relative overflow-hidden`}
            >
              {/* Top Row: Icon + Corner Arrow */}
              <div className="flex items-start justify-between mb-3 w-full">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-110 ${act.iconBg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className={`text-xs sm:text-sm font-bold leading-snug ${act.titleColor}`}>
                  {act.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                  {act.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default QuickActions;
