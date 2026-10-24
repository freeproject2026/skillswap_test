import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star, ArrowRightLeft, MessageCircle, UserPlus, Check, Clock,
  Sparkles, GraduationCap, ShieldCheck, Calendar, ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SkillEvidenceModal } from './SkillEvidenceModal';
import { ReportModal } from './ReportModal';

export const PersonCard = ({ person, showMatchInfo = true }) => {
  const navigate = useNavigate();
  const { connectionStatuses, sendConnectionRequest, followingIds, toggleFollow, showToast, isGuest, currentUser, setAuthModalOpen } = useApp();

  const [evidenceSkill, setEvidenceSkill] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);

  const connStatus = connectionStatuses[person.id] || person.connectionStatus || 'none';
  const isFollowing = followingIds.includes(person.id);

  const handleConnect = async (e) => {
    e.stopPropagation();
    if (isGuest || !currentUser) {
      setAuthModalOpen(true);
      return;
    }
    if (connStatus === 'none') {
      await sendConnectionRequest(person.id, person.name);
    } else if (connStatus === 'connected') {
      navigate(`/connect/chat/${person.id}`);
    }
  };

  const handleFollow = async (e) => {
    e.stopPropagation();
    if (isGuest || !currentUser) {
      setAuthModalOpen(true);
      return;
    }
    await toggleFollow(person.id, person.name);
  };

  const handleBookSession = (e) => {
    e.stopPropagation();
    if (isGuest || !currentUser) {
      setAuthModalOpen(true);
      return;
    }
    navigate(`/connect/chat/${person.id}`);
    showToast(`Opening session proposal with ${person.name}...`, 'info');
  };

  const openProfile = () => {
    if (isGuest || !currentUser) {
      setAuthModalOpen(true);
      return;
    }
    navigate(`/connect/chat/${person.id}`);
  };

  return (
    <>
      <div
        onClick={openProfile}
        className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-card hover:border-teal-200/80 dark:hover:border-teal-800 transition-all duration-300 h-full"
      >
        {/* Cover Image & Academic Tag */}
        <div className="relative h-24 sm:h-28 overflow-hidden">
          <img
            src={person.coverImage || person.avatar}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>

          {/* Academic College Pill */}
          {person.college && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1 border border-white/10">
              <GraduationCap className="w-3 h-3 text-teal-400" />
              <span className="truncate max-w-[130px]">{person.college}</span>
            </div>
          )}

          {/* Online Status */}
          {person.status === 'online' && (
            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[9px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              Online
            </span>
          )}

          {/* Availability */}
          {person.availability && (
            <span className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs text-white text-[10px] font-medium flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-teal-300" />
              <span className="truncate max-w-[170px]">{person.availability}</span>
            </span>
          )}
        </div>

        {/* Avatar overlapping */}
        <div className="relative px-3.5 -mt-7 z-10 flex items-end justify-between">
          <div className="relative">
            <img
              src={person.avatar}
              alt={person.name}
              className="w-14 h-14 rounded-2xl object-cover ring-3 ring-white dark:ring-slate-900 shadow-md bg-white dark:bg-slate-800"
            />
            {person.emailVerified && (
              <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-teal-600 text-white shadow-xs" title="Verified Campus Student">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Safety / Report flag trigger */}
          <button
            onClick={(e) => { e.stopPropagation(); setReportOpen(true); }}
            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors"
            title="Report student or session issue"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Student Profile Info */}
        <div className="flex flex-col flex-1 px-3.5 pt-2 pb-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate flex items-center gap-1">
                {person.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {person.branch || person.title}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md border border-amber-100 dark:border-amber-800/50">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">{person.rating}</span>
            </div>
          </div>

          {/* Credit rate & format */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
            {person.creditsRate ? (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-100/80 dark:border-teal-800/60 text-teal-800 dark:text-teal-300 font-semibold">
                <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span>{person.creditsRate} credits / session</span>
              </div>
            ) : null}
            {person.sessionFormat && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                {person.sessionFormat}
              </span>
            )}
          </div>

          {/* Skills Offered with Evidence Labels */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teaches</p>
              <span className="text-[9px] text-teal-600 dark:text-teal-400 font-medium">Click for evidence</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(person.skillsOffered || []).slice(0, 3).map((skill, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setEvidenceSkill(skill); }}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
                    skill.evidenceStatus === 'Demonstrated Across Projects'
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100'
                      : skill.evidenceStatus === 'Peer-Reviewed'
                      ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-100'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{skill.name}</span>
                  <span className="opacity-70 text-[9px]">({skill.level?.[0] || 'I'})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="mt-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Wants to learn</p>
            <div className="flex flex-wrap gap-1">
              {(person.skillsWanted || []).slice(0, 2).map((skill, i) => (
                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50/70 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-[10px] font-medium border border-purple-100 dark:border-purple-800/50">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          {/* Match Rationale Info */}
          {showMatchInfo && (person.rationale || person.teachingMatch || person.learningMatch) && (
            <div className="mt-2.5 px-2.5 py-2 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-800/50 text-[11px] text-teal-800 dark:text-teal-300 leading-snug">
              {person.rationale ? (
                <p className="flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>{person.rationale}</span>
                </p>
              ) : (
                <p className="flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3 h-3 shrink-0 text-teal-600 dark:text-teal-400" />
                  <span>{person.teachingMatch || person.learningMatch}</span>
                </p>
              )}
            </div>
          )}

          {/* Languages */}
          {person.languages && person.languages.length > 0 && (
            <p className="text-[10px] text-slate-400 mt-2 truncate">
              🗣 {person.languages.join(' · ')}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-auto pt-3">
            <button
              onClick={handleBookSession}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-xs shadow-teal-500/20 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Session</span>
            </button>

            <button
              onClick={handleConnect}
              className={`flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                connStatus === 'connected'
                  ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-100'
                  : connStatus === 'pending'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {connStatus === 'connected' ? (
                <><MessageCircle className="w-3.5 h-3.5" /> Chat</>
              ) : connStatus === 'pending' ? (
                <><Clock className="w-3.5 h-3.5" /> Pending</>
              ) : (
                <><UserPlus className="w-3.5 h-3.5" /> Connect</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Skill Evidence Modal */}
      <SkillEvidenceModal
        skill={evidenceSkill}
        isOpen={Boolean(evidenceSkill)}
        onClose={() => setEvidenceSkill(null)}
      />

      {/* Trust & Safety Report Modal */}
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetUser={person}
      />
    </>
  );
};

export default PersonCard;