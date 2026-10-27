import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Video, MapPin, ArrowRight,
  BookOpen, GraduationCap, ChevronRight, CheckCircle2,
  X, ExternalLink, ShieldCheck, Sparkles, User
} from 'lucide-react';
import { sessionService } from '../../services/sessionService';
import { useApp } from '../../context/AppContext';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Confirmed':
    case 'Accepted':
    case 'Upcoming':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40';
    case 'Awaiting Confirmation':
    case 'Pending':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40';
    case 'Disputed':
    case 'Cancelled':
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40';
    default:
      return 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/40';
  }
};

export const UpcomingSessionsCard = () => {
  const navigate = useNavigate();
  const { currentUser, isGuest, showToast } = useApp();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchSessions = async () => {
    if (isGuest || !currentUser) {
      setSessions([]);
      setLoading(false);
      return;
    }
    try {
      const data = await sessionService.getSessions();
      if (data && data.length > 0) {
        const currentUserId = currentUser.id || currentUser._id;
        // Filter strictly for active/upcoming sessions
        const upcomingStatuses = ['Upcoming', 'Awaiting Confirmation', 'Confirmed', 'Accepted', 'Pending'];
        const upcomingOnly = data.filter(s => upcomingStatuses.includes(s.status));
        const formatted = upcomingOnly.slice(0, 3).map(s => {
          const isLearning = String(s.studentId) === String(currentUserId);
          return {
            id: s.id || s._id,
            skill: s.skill,
            title: s.learningObjective ? `${s.skill} · ${s.learningObjective}` : s.skill,
            partnerName: isLearning ? s.tutorName : s.studentName,
            partnerRole: isLearning ? 'Teacher' : 'Student',
            partnerDetails: isLearning ? (s.tutorCollege || 'Campus Peer Tutor') : (s.studentCollege || 'Student Learner'),
            partnerAvatar: (isLearning ? s.tutorAvatar : s.studentAvatar) || DEFAULT_AVATAR,
            dateTime: `${s.scheduledDate}, ${s.scheduledTime}`,
            format: s.format || 'Live Online Session',
            type: isLearning ? 'Learning' : 'Teaching',
            status: s.status || 'Upcoming',
            durationMinutes: s.durationMinutes || 20,
            creditCost: s.creditCost || 60,
            meetingLink: s.meetingLink || '',
            learningObjective: s.learningObjective || ''
          };
        });
        setSessions(formatted);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error('Error fetching upcoming sessions:', err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [currentUser, isGuest]);

  const handleAccept = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await sessionService.acceptSession(sessionId);
      showToast('Session booking accepted!', 'success');
      fetchSessions();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to accept session', 'error');
    }
  };

  const handleReject = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await sessionService.rejectSession(sessionId);
      showToast('Session booking declined.', 'info');
      fetchSessions();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to reject session', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[340px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              Upcoming Sessions
            </h3>
            <p className="text-[11px] text-slate-400">
              Scheduled 1:1 peer learning & exchanges
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/sessions')}
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Sessions List */}
      <div className="my-2">
        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs space-y-2">
            <Calendar className="w-8 h-8 mx-auto mb-1 opacity-30 text-teal-500" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">No upcoming sessions scheduled.</p>
            <p className="text-slate-400 text-[11px]">Book a peer session or post a learning request to get started.</p>
            <button
              onClick={() => navigate('/sessions')}
              className="mt-2 px-3.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 font-bold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors shadow-2xs"
            >
              Book a Session
            </button>
          </div>
        ) : (
          <div className="space-y-2.5 my-1">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 hover:border-teal-300 dark:hover:border-teal-700/50 transition-all flex flex-col gap-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={sess.partnerAvatar}
                      alt={sess.partnerName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                        {sess.skill}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{sess.partnerRole}:</span> {sess.partnerName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        sess.type === 'Learning'
                          ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40'
                          : 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40'
                      }`}
                    >
                      {sess.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadge(sess.status)}`}>
                      {sess.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100/80 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-teal-500" />
                      {sess.dateTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="w-3 h-3 text-purple-500" />
                      {sess.format}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {sess.status === 'Pending' && sess.type === 'Teaching' ? (
                      <>
                        <button
                          onClick={(e) => handleAccept(e, sess.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => handleReject(e, sess.id)}
                          className="px-2 py-1 rounded-lg border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all"
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedSession(sess)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 text-xs font-bold transition-all shadow-2xs border border-slate-200/80 dark:border-slate-600"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => navigate(`/room/${sess.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-2xs"
                        >
                          Join Room
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom status note */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span>{sessions.length > 0 ? `${sessions.length} upcoming session${sessions.length > 1 ? 's' : ''}` : 'No sessions scheduled'}</span>
        <span className="text-teal-600 dark:text-teal-400 font-semibold cursor-pointer hover:underline" onClick={() => navigate('/sessions')}>
          Calendar View →
        </span>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300">
                  {selectedSession.type} Session Details
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedSession.skill}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <img
                  src={selectedSession.partnerAvatar}
                  alt={selectedSession.partnerName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/30"
                />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedSession.partnerName}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">{selectedSession.partnerRole} · {selectedSession.partnerDetails}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date & Time</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedSession.dateTime}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Format & Mode</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedSession.format}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedSession.durationMinutes} minutes</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedSession.status}</p>
                </div>
              </div>

              {selectedSession.learningObjective && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Learning Objective</span>
                  <p className="text-slate-700 dark:text-slate-300">{selectedSession.learningObjective}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setSelectedSession(null)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const id = selectedSession.id;
                  setSelectedSession(null);
                  navigate(`/room/${id}`);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Enter Session Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingSessionsCard;
