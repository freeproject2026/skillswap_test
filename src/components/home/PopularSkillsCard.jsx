import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';

export const PopularSkillsCard = () => {
  const navigate = useNavigate();

  const skills = [
    { name: 'Python', count: 48, trend: 'hot' },
    { name: 'Java', count: 32 },
    { name: 'Web Development', count: 64, trend: 'hot' },
    { name: 'UI/UX Design', count: 41 },
    { name: 'Graphic Design', count: 27 },
    { name: 'DSA', count: 52, trend: 'hot' },
    { name: 'Communication', count: 23 },
    { name: 'Excel', count: 18 },
    { name: 'Data Science', count: 39 },
  ];

  const handleSkillClick = (skillName) => {
    const cleanTopic = skillName.replace(/^#/, '').trim();
    navigate(`/connect/people?topic=${encodeURIComponent(cleanTopic)}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Popular Skills on Campus
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          Trending
        </span>
      </div>

      {/* Skill Tags */}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <button
            key={skill.name}
            onClick={() => handleSkillClick(skill.name)}
            className="group px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200/70 dark:border-slate-700/70 hover:border-teal-300 dark:hover:border-teal-700 transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1.5 shadow-2xs"
          >
            <span>{skill.name}</span>
            <span className="text-[10px] font-normal text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400">
              ({skill.count})
            </span>
            {skill.trend === 'hot' && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 pt-1">
        Click any skill to view campus mentors and study circles.
      </p>
    </div>
  );
};

export default PopularSkillsCard;
