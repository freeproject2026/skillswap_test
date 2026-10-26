import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightLeft, Sparkles, BookOpen, Users, Compass, Calendar,
  MessageSquare, GraduationCap, ArrowRight, ShieldCheck, CheckCircle
} from 'lucide-react';
import PersonCard from '../components/PersonCard';
import { skillMatchingService } from '../services/skillMatchingService';
import { useApp } from '../context/AppContext';
import { AuthModal } from '../components/auth/AuthModal';

export const ConnectHome = () => {
  const navigate = useNavigate();
  const { currentUser, isGuest } = useApp();

  const [rankedMatches, setRankedMatches] = useState([]);
  const [mutualMatches, setMutualMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      try {
        const matches = await skillMatchingService.getRankedMatches(currentUser || null, null);
        setRankedMatches(matches);
        setMutualMatches(matches.filter(m => m.isMutualMatch));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 space-y-7">
      {/* Hero */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-navy-900 to-slate-800 p-6 sm:p-8 overflow-hidden shadow-card border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Campus Skill Exchange</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
            Intelligent Student Match Engine
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Match with peers ranked by complementary skills, schedule overlap, target proficiency, and verified project evidence.
          </p>

          {/* Quick Access Action Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
            <button
              onClick={() => navigate('/sessions')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" /> My Sessions
            </button>
            <button
              onClick={() => navigate('/requests')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-300" /> Learning Requests
            </button>
            <button
              onClick={() => navigate('/analyzer')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-purple-300" /> Skill Gap Analyzer
            </button>
            <button
              onClick={() => navigate('/campus')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold transition-all"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" /> Campus Community
            </button>
          </div>
        </div>
      </div>

      {/* Top Recommended Matches */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                Top Recommended Matches for You
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ranked using skill complementarity, schedule overlap, evidence tier, and language
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/connect/people')}
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-0.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {rankedMatches.slice(0, 3).map(person => (
            <PersonCard key={person.id} person={person} showMatchInfo={true} />
          ))}
        </div>
      </section>

      {/* Mutual Barter Swaps (0 credits needed) */}
      {mutualMatches.length > 0 && (
        <section className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-purple-700 dark:text-purple-300" />
              <h3 className="text-sm font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                1:1 Mutual Skill Barter Opportunities (0 Credits)
              </h3>
            </div>
            <span className="text-xs text-purple-700 dark:text-purple-300 font-semibold">Perfect Two-Way Exchange</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mutualMatches.map(person => (
              <PersonCard key={person.id} person={person} showMatchInfo={true} />
            ))}
          </div>
        </section>
      )}

      {/* Remaining Candidate Peers */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              More Verified Campus Mentors
            </h3>
          </div>
          <span className="text-xs text-slate-400">({rankedMatches.length} students)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {rankedMatches.slice(3).map(person => (
            <PersonCard key={person.id} person={person} showMatchInfo={true} />
          ))}
        </div>
      </section>
      <AuthModal />
    </div>
  );
};

export default ConnectHome;