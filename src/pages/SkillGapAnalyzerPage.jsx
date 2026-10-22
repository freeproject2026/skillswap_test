import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass, CheckCircle2, Circle, ArrowRight, Award, UserPlus,
  BookOpen, Sparkles, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { learningRoadmapService } from '../services/learningRoadmapService';
import { useApp } from '../context/AppContext';

export const SkillGapAnalyzerPage = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState('road_fullstack');
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await learningRoadmapService.getRoadmaps();
        setRoadmaps(list);
        const current = list.find(r => r.id === selectedRoadmapId) || list[0];
        setActiveRoadmap(current);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedRoadmapId]);

  const handleToggleMilestone = async (milestoneId) => {
    try {
      const updated = await learningRoadmapService.toggleMilestoneStatus(selectedRoadmapId, milestoneId);
      setActiveRoadmap({ ...updated });
      showToast('Milestone status updated!');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !activeRoadmap) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  const completionPercent = Math.round((activeRoadmap.completedMilestones / activeRoadmap.totalMilestones) * 100);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 pb-24 space-y-6">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-teal-600" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">AI Skill Gap Analyzer</h1>
          <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">Demo Engine</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Select your target career aspiration to benchmark existing competencies and chart milestone paths with matching peer mentors
        </p>
      </div>

      {/* Career Goal Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {roadmaps.map(r => (
          <button
            key={r.id}
            onClick={() => setSelectedRoadmapId(r.id)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedRoadmapId === r.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-teal-500/50'
                : 'bg-white text-slate-800 border-slate-200 hover:border-teal-300'
            }`}
          >
            <h3 className="text-sm font-bold">{r.title}</h3>
            <p className={`text-[11px] mt-1 line-clamp-2 ${selectedRoadmapId === r.id ? 'text-slate-300' : 'text-slate-500'}`}>
              {r.role}
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] font-semibold">
              <span className={selectedRoadmapId === r.id ? 'text-teal-400' : 'text-teal-600'}>
                {r.completedMilestones} of {r.totalMilestones} Completed
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Progress Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-900 uppercase tracking-wider block mb-1">
            Career Goal Readiness: {activeRoadmap.title}
          </span>
          <p className="text-xs text-teal-800 max-w-lg leading-relaxed">
            {activeRoadmap.description}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-3xl font-extrabold text-teal-700">{completionPercent}%</p>
          <span className="text-[11px] text-teal-600 font-semibold">Readiness Score</span>
        </div>
      </div>

      {/* Milestones Stepper */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-500" />
          <span>Recommended Learning Sequence & Milestones</span>
        </h3>

        <div className="space-y-3">
          {activeRoadmap.milestones.map((m, index) => {
            const isCompleted = m.status === 'Completed';
            const isInProgress = m.status === 'In Progress';

            return (
              <div
                key={m.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-white border-emerald-200/80 shadow-xs'
                    : isInProgress
                    ? 'bg-white border-teal-300 shadow-soft ring-1 ring-teal-500/20'
                    : 'bg-slate-50/70 border-slate-200/80 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleMilestone(m.id)}
                      className="shrink-0 p-1 hover:scale-110 transition-transform"
                      title={isCompleted ? 'Mark In Progress' : 'Mark Completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Milestone 0{index + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 leading-snug">
                        {m.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' : isInProgress ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {m.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {m.currentLevel}
                    </span>
                  </div>
                </div>

                {/* Skills In This Milestone */}
                <div className="flex flex-wrap gap-1.5 ml-8 mb-3">
                  {m.skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Practical Project Recommendation */}
                <div className="ml-8 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p>
                    <strong className="text-slate-700">Recommended Project Evidence:</strong> {m.suggestedProject}
                  </p>
                  {m.mentors && m.mentors.length > 0 && (
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-teal-700">Matching Campus Mentors: <strong>{m.mentors.join(', ')}</strong></span>
                      <button
                        onClick={() => navigate('/connect')}
                        className="font-bold text-teal-600 hover:text-teal-800"
                      >
                        Find Tutor →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          Roadmaps and skill gap projections are simulated heuristic recommendations designed for student peer guidance. They do not guarantee employment or commercial certifications.
        </p>
      </div>
    </div>
  );
};

export default SkillGapAnalyzerPage;
