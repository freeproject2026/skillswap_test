import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Star, UserPlus, CheckCircle2 } from 'lucide-react';
import { skillMatchingService } from '../../services/skillMatchingService';
import { useApp } from '../../context/AppContext';

export const RecommendedStudentsCard = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const matches = await skillMatchingService.getRankedMatches(
          currentUser || null,
          null
        );
        // Take top 3 recommendations
        setRecommended(matches.slice(0, 3));
      } catch (err) {
        console.error('Error loading recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, [currentUser]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Recommended For You
          </h3>
        </div>

        <button
          onClick={() => navigate('/connect/people')}
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-6 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          recommended.map((student) => {
            const topSkill = student.skillsOffered?.[0]?.name || 'Web Development';
            const secondSkill = student.skillsOffered?.[1]?.name;

            return (
              <div
                key={student.id}
                className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100/80 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-teal-300 dark:hover:border-teal-700/60 transition-all group"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    {student.matchScore && (
                      <span className="absolute -bottom-1 -right-1 px-1 rounded-sm bg-teal-600 text-[9px] font-bold text-white shadow-xs">
                        {student.matchScore}%
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {student.name}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {student.college || 'Peer Mentor'}
                    </p>

                    {/* Skill tag & Rating */}
                    <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                      <span className="px-1.5 py-0.2 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold truncate max-w-[110px]">
                        {topSkill}
                      </span>
                      {student.rating && (
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>{student.rating}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Connect / View Profile button */}
                <button
                  onClick={() => navigate(`/connect/chat/${student.id}`)}
                  className="shrink-0 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-600 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 transition-all shadow-2xs"
                >
                  Connect
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecommendedStudentsCard;
