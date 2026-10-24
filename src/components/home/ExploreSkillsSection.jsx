import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2, Palette, MessageSquare, GraduationCap,
  Sparkles, ArrowRight, ChevronRight
} from 'lucide-react';

export const ExploreSkillsSection = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'programming',
      name: 'Programming',
      categoryQuery: 'Programming, DSA & Web Dev',
      icon: Code2,
      examples: 'Python, React, TypeScript, DSA, Node.js',
      count: '42 active mentors',
      iconBg: 'bg-blue-500 text-white',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
    },
    {
      id: 'design',
      name: 'Design',
      categoryQuery: 'Graphic Design, Video Editing & UI/UX',
      icon: Palette,
      examples: 'UI/UX Design, Figma Tokens, Blender, Motion',
      count: '28 active mentors',
      iconBg: 'bg-purple-600 text-white',
      badgeBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
    },
    {
      id: 'communication',
      name: 'Communication',
      categoryQuery: 'Communication, English & Interview Prep',
      icon: MessageSquare,
      examples: 'Spanish Conversation, English Fluency, Debate',
      count: '19 active mentors',
      iconBg: 'bg-teal-600 text-white',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300',
    },
    {
      id: 'academic',
      name: 'Academic',
      categoryQuery: 'Academic Subjects, Presentations & Projects',
      icon: GraduationCap,
      examples: 'Calculus, Physics, AI & ML Research, Statistics',
      count: '31 active mentors',
      iconBg: 'bg-indigo-600 text-white',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300',
    },
    {
      id: 'soft-skills',
      name: 'Soft Skills',
      categoryQuery: 'Soft Skills, Productivity & Student Interests',
      icon: Sparkles,
      examples: 'Leadership, Tech Interview Prep, Time Mgmt',
      count: '24 active mentors',
      iconBg: 'bg-amber-500 text-white',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
    },
  ];

  const handleCategoryClick = (catQuery) => {
    navigate(`/connect/people?category=${encodeURIComponent(catQuery)}`);
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Explore Skills
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Popular skills to teach and learn across campus departments.
          </p>
        </div>

        <button
          onClick={() => navigate('/connect/people')}
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 group"
        >
          <span>All Categories</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.categoryQuery)}
              className="group text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Icon */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${cat.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Name */}
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {cat.name}
                </h3>

                {/* Examples */}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {cat.examples}
                </p>
              </div>

              {/* Mentors count badge */}
              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.badgeBg}`}>
                  {cat.count}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ExploreSkillsSection;
