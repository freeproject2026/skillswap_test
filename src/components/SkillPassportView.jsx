import React, { useState } from 'react';
import {
  Award, Shield, CheckCircle, Share2, Eye, Lock, Globe, Users,
  TrendingUp, Clock, BookOpen, ExternalLink, Sparkles, Copy, Check
} from 'lucide-react';
import { SkillEvidenceModal } from './SkillEvidenceModal';
import { useApp } from '../context/AppContext';

export const SkillPassportView = ({ student, isOwnProfile = false }) => {
  const { showToast } = useApp();
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [privacySetting, setPrivacySetting] = useState(student?.privacySettings?.profileVisibility || 'public');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const demoUrl = `${window.location.origin}/profile/${student.username || 'student'}?view=passport`;
    navigator.clipboard.writeText(demoUrl);
    setCopied(true);
    showToast('Demo Skill Passport link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Passport Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-navy-900 to-slate-800 p-6 sm:p-7 text-white overflow-hidden shadow-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 text-slate-950 flex items-center justify-center font-extrabold shadow-lg shadow-teal-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold">Verified Skill Passport</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider border border-teal-500/30">
                  Campus Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {student.name} · {student.college} ({student.branch || 'Undergraduate'})
              </p>
            </div>
          </div>

          {/* Privacy & Share Actions */}
          <div className="flex items-center gap-2">
            {isOwnProfile && (
              <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/10 text-xs">
                <button
                  onClick={() => { setPrivacySetting('public'); showToast('Passport set to Public', 'info'); }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                    privacySetting === 'public' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Visible to everyone"
                >
                  <Globe className="w-3 h-3" /> Public
                </button>
                <button
                  onClick={() => { setPrivacySetting('connections'); showToast('Passport set to Connections Only', 'info'); }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                    privacySetting === 'connections' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Visible to connections only"
                >
                  <Users className="w-3 h-3" /> Peers
                </button>
                <button
                  onClick={() => { setPrivacySetting('private'); showToast('Passport set to Private', 'info'); }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                    privacySetting === 'private' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Visible only to you"
                >
                  <Lock className="w-3 h-3" /> Private
                </button>
              </div>
            )}

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share Passport'}</span>
            </button>
          </div>
        </div>

        {/* High-Level Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div>
            <p className="text-xl font-extrabold text-teal-400">{student.hoursTaught || 54}h</p>
            <p className="text-[11px] text-slate-400 font-medium">Peer Teaching Delivered</p>
          </div>
          <div>
            <p className="text-xl font-extrabold text-teal-300">{student.hoursLearned || 38}h</p>
            <p className="text-[11px] text-slate-400 font-medium">Learning Hours Completed</p>
          </div>
          <div>
            <p className="text-xl font-extrabold text-amber-400">{student.completedSessionsCount || 42}</p>
            <p className="text-[11px] text-slate-400 font-medium">Completed Sessions</p>
          </div>
          <div>
            <p className="text-xl font-extrabold text-purple-400">{student.skillsOffered?.length || 4}</p>
            <p className="text-[11px] text-slate-400 font-medium">Evidence-Backed Skills</p>
          </div>
        </div>
      </div>

      {/* Skills Taught with Evidence Badges */}
      <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Skills Taught & Peer-Reviewed
            </h3>
          </div>
          <span className="text-xs text-slate-400">Click any skill for evidence audit trail</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(student.skillsOffered || []).map((skill, i) => (
            <div
              key={i}
              onClick={() => setSelectedSkill(skill)}
              className="group p-4 rounded-xl border border-slate-200/80 hover:border-teal-300 hover:shadow-sm bg-slate-50/50 hover:bg-white cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                    {skill.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">{skill.category || 'Engineering'}</p>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200/80 text-slate-700">
                  {skill.level || 'Intermediate'}
                </span>
              </div>

              {/* Evidence Tag */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                  skill.evidenceStatus === 'Demonstrated Across Projects'
                    ? 'bg-purple-100 text-purple-700'
                    : skill.evidenceStatus === 'Peer-Reviewed'
                    ? 'bg-teal-100 text-teal-800'
                    : skill.evidenceStatus === 'Practical Task Completed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  <CheckCircle className="w-3 h-3" />
                  {skill.evidenceStatus || 'Self-Declared'}
                </span>
                <span className="text-slate-400 text-[10px] group-hover:text-teal-600 font-semibold flex items-center gap-0.5">
                  View Dossier →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Learned & Target Goals */}
      <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Active Learning Goals & Progression
          </h3>
        </div>

        <div className="space-y-3">
          {(student.skillsWanted || []).map((skill, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-slate-100 bg-purple-50/40">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-bold text-slate-800">{skill.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Target: {skill.targetLevel || 'Advanced'}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{skill.reason}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Passport Milestones & Badges */}
      <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Verified Passport Badges & Milestones
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(student.passportBadges || []).map(badge => (
            <div key={badge.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Award className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800">{badge.name}</p>
                  {badge.dateAwarded && (
                    <span className="text-[10px] text-slate-400">{badge.dateAwarded}</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal for evidence breakdown */}
      <SkillEvidenceModal
        skill={selectedSkill}
        isOpen={Boolean(selectedSkill)}
        onClose={() => setSelectedSkill(null)}
      />
    </div>
  );
};

export default SkillPassportView;
