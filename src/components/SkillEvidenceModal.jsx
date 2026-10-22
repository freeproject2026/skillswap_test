import React from 'react';
import { X, ShieldCheck, ExternalLink, Calendar, UserCheck, AlertCircle, Award } from 'lucide-react';
import { EVIDENCE_LEVELS } from '../data/mockSkillsData';

export const SkillEvidenceModal = ({ skill, isOpen, onClose }) => {
  if (!isOpen || !skill) return null;

  const evidenceConfig = EVIDENCE_LEVELS.find(e => e.status === skill.evidenceStatus) || EVIDENCE_LEVELS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 leading-tight">Skill Evidence Dossier</h3>
              <p className="text-xs text-slate-500">Transparent peer-verified audit trail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Skill Title & Proficiency */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{skill.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{skill.category || 'Programming & Engineering'}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
              {skill.level || 'Intermediate'} Level
            </span>
          </div>

          {/* Evidence Status Card */}
          <div className={`p-4 rounded-xl border ${
            skill.evidenceStatus === 'Demonstrated Across Projects'
              ? 'bg-purple-50/70 border-purple-200 text-purple-900'
              : skill.evidenceStatus === 'Peer-Reviewed'
              ? 'bg-teal-50/70 border-teal-200 text-teal-900'
              : skill.evidenceStatus === 'Practical Task Completed'
              ? 'bg-blue-50/70 border-blue-200 text-blue-900'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Status: {skill.evidenceStatus || 'Self-Declared'}
              </span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {evidenceConfig.description}
            </p>
          </div>

          {/* Project or Practical Task Evidence */}
          {skill.evidenceProjectUrl ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Submitted Project / Source Code Evidence
              </label>
              <a
                href={skill.evidenceProjectUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 hover:underline break-all"
              >
                <span>{skill.evidenceProjectUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-800">
              No external project link attached yet. The student has self-declared this skill.
            </div>
          )}

          {/* Reviewer Feedback */}
          {skill.evidenceReviewerFeedback && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-teal-600" /> Peer Reviewer Assessment
                </span>
                {skill.evidenceDate && (
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3" /> {skill.evidenceDate}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 italic bg-white p-3 rounded-lg border border-slate-100 leading-relaxed">
                "{skill.evidenceReviewerFeedback}"
              </p>
            </div>
          )}

          {/* Transparent Academic Disclaimer */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-100 text-slate-500 text-[11px] leading-relaxed">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              SkillSwap evidence labels reflect student peer reviews and practical campus tasks. They are authentic indicators of peer collaboration, not official commercial industry certifications.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillEvidenceModal;
