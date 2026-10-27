import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Video, CheckCircle, AlertTriangle, ArrowRight,
  ShieldAlert, RefreshCw, XCircle, Star, Sparkles, MessageCircle, ExternalLink,
  Plus, X, User
} from 'lucide-react';
import { sessionService } from '../services/sessionService';
import { walletService } from '../services/walletService';
import { userService } from '../services/userService';
import { useApp } from '../context/AppContext';
import { ReportModal } from '../components/ReportModal';
import { AuthGate } from '../components/auth/AuthGate';
import { AuthModal } from '../components/auth/AuthModal';

const TABS = ['All', 'Pending', 'Accepted', 'Upcoming', 'Awaiting Confirmation', 'Completed', 'Disputed', 'Cancelled'];

export const SessionsPage = () => {
  const navigate = useNavigate();
  const { showToast, isGuest, currentUser, setAuthModalOpen } = useApp();

  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [reportTarget, setReportTarget] = useState(null);
  const [reviewModalSession, setReviewModalSession] = useState(null);
  const [reviewRating, setReviewRating] = useState({ teaching: 5, communication: 5, feedback: '' });

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [availableTutors, setAvailableTutors] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    tutorId: '',
    skill: '',
    scheduledDate: 'This Weekend',
    scheduledTime: '6:00 PM',
    durationMinutes: 30,
    creditCost: 0,
    format: 'Live Online Session',
    learningObjective: ''
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await sessionService.getSessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isGuest && currentUser) {
      loadSessions();
      // Load tutors for booking modal
      userService.getAllUsers().then(users => {
        const myId = currentUser.id || currentUser._id;
        setAvailableTutors(users.filter(u => (u.id || u._id) !== myId));
      }).catch(() => {});
    } else {
      setLoading(false);
    }
  }, [isGuest, currentUser]);

  const handleAccept = async (session) => {
    try {
      await sessionService.acceptSession(session.id);
      showToast('Session request accepted! Session is now confirmed.', 'success');
      loadSessions();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to accept session request', 'error');
    }
  };

  const handleReject = async (session) => {
    const reason = prompt('Optional: Reason for declining this session request:') || '';
    try {
      await sessionService.rejectSession(session.id, reason);
      showToast('Session request declined.', 'info');
      loadSessions();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to decline session request', 'error');
    }
  };

  const handleConfirm = async (session, role = 'learner') => {
    try {
      const updated = await sessionService.confirmCompletion(session.id, role);
      if (updated.status === 'Completed' && session.creditCost > 0) {
        await walletService.releaseEscrowOnCompletion(session.skill, session.tutorName, session.creditCost);
        showToast('Two-sided completion verified! Escrow credits settled.', 'success');
      } else {
        showToast('Your confirmation recorded. Awaiting peer confirmation.', 'info');
      }
      loadSessions();
    } catch (err) {
      console.error(err);
      showToast('Confirmation failed', 'error');
    }
  };

  const handleDispute = async (session) => {
    const reason = prompt('Please explain the issue or dispute reason:');
    if (!reason || !reason.trim()) return;

    try {
      await sessionService.disputeSession(session.id, reason.trim());
      await walletService.disputeEscrowHold(session.skill, session.tutorName, session.creditCost, reason.trim());
      showToast('Session flagged for campus mediation. Escrow settlement paused.', 'info');
      loadSessions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (session) => {
    if (!window.confirm('Are you sure you want to cancel this session? Your credit escrow will be refunded.')) return;

    try {
      await sessionService.cancelSession(session.id, 'Cancelled by student');
      await walletService.refundEscrowHold(session.skill, session.tutorName, session.creditCost);
      showToast('Session cancelled. Reserved escrow returned to your balance.', 'info');
      loadSessions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.tutorId || !bookingForm.skill.trim()) {
      showToast('Please select a teacher and specify the skill topic.', 'error');
      return;
    }
    const selectedTutor = availableTutors.find(t => (t.id || t._id) === bookingForm.tutorId);
    if (!selectedTutor) {
      showToast('Selected tutor was not found.', 'error');
      return;
    }

    setBookingSubmitting(true);
    try {
      await sessionService.bookSession({
        tutorId: selectedTutor.id || selectedTutor._id,
        tutorName: selectedTutor.name,
        tutorAvatar: selectedTutor.avatar || '',
        tutorCollege: selectedTutor.college || 'Campus Peer',
        skill: bookingForm.skill.trim(),
        sessionType: 'Peer Tutoring',
        scheduledDate: bookingForm.scheduledDate || 'This Weekend',
        scheduledTime: bookingForm.scheduledTime || '6:00 PM',
        durationMinutes: Number(bookingForm.durationMinutes) || 30,
        creditCost: Number(bookingForm.creditCost) || 0,
        format: bookingForm.format || 'Live Online Session',
        learningObjective: bookingForm.learningObjective.trim() || 'Peer learning & code review'
      });
      showToast(`Session request sent to ${selectedTutor.name}!`, 'success');
      setBookingModalOpen(false);
      setBookingForm({
        tutorId: '',
        skill: '',
        scheduledDate: 'This Weekend',
        scheduledTime: '6:00 PM',
        durationMinutes: 30,
        creditCost: 0,
        format: 'Live Online Session',
        learningObjective: ''
      });
      loadSessions();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to submit booking request.', 'error');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModalSession) return;
    try {
      await sessionService.reviewSession(reviewModalSession.id, {
        teachingQuality: reviewRating.teaching,
        communication: reviewRating.communication,
        feedback: reviewRating.feedback.trim()
      });
      showToast('Session review submitted! Thank you for strengthening campus trust.');
      setReviewModalSession(null);
      loadSessions();
    } catch (err) {
      console.error(err);
      showToast('Failed to submit review', 'error');
    }
  };

  if (isGuest || !currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AuthGate
          title="Student Learning Sessions"
          description="Sign in or register a verified student profile to view scheduled sessions, join active learning rooms, manage escrow releases, and complete mutual reviews."
          actionText="Sign In to Access Sessions"
          onAction={() => setAuthModalOpen(true)}
        />
        <AuthModal />
      </div>
    );
  }

  const filteredSessions = sessions.filter(s => {
    if (activeTab === 'All') return true;
    return s.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 pb-24 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>Learning Sessions & Escrow</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage session bookings, accept peer requests, launch learning rooms, and complete reviews
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBookingModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Book a Session</span>
          </button>
          <button
            onClick={() => navigate('/requests')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Learning Requests</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map(session => {
            const myId = currentUser?.id || currentUser?._id;
            const isTeacher = String(session.tutorId) === String(myId);
            const isLearner = String(session.studentId) === String(myId);

            return (
              <div
                key={session.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-card transition-all"
              >
                {/* Top Row: Skill & Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                      session.status === 'Completed'
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400'
                        : session.status === 'Accepted'
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-bold'
                        : session.status === 'Upcoming'
                        ? 'bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-400'
                        : session.status === 'Pending'
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-bold animate-pulse'
                        : session.status === 'Awaiting Confirmation'
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 animate-pulse'
                        : session.status === 'Rejected'
                        ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 font-bold'
                        : session.status === 'Disputed'
                        ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {session.status}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight">
                      {session.skill}
                    </h3>
                  </div>

                  {/* Credit Cost Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-teal-700 dark:text-teal-400">
                      {session.creditCost === 0 ? 'Mutual Swap (0 Cr)' : `${session.creditCost} Credits`}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Escrow: <strong className={session.escrowStatus === 'Reserved' ? 'text-amber-600 dark:text-amber-400' : session.escrowStatus === 'Paused' ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}>{session.escrowStatus}</strong>
                    </p>
                  </div>
                </div>

                {/* Participant & Schedule Strip */}
                <div className="flex flex-wrap items-center gap-4 py-3 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <img src={session.tutorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt="" className="w-6 h-6 rounded-full object-cover ring-1 ring-teal-500" />
                    <span>Teacher: <strong>{session.tutorName}</strong> {isTeacher ? '(You)' : `(${session.tutorCollege})`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src={session.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} alt="" className="w-6 h-6 rounded-full object-cover ring-1 ring-purple-500" />
                    <span>Student: <strong>{session.studentName}</strong> {isLearner ? '(You)' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{session.scheduledDate} at {session.scheduledTime} ({session.durationMinutes} mins)</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    Format: <strong>{session.format}</strong>
                  </div>
                </div>

                {/* Objective */}
                {session.learningObjective && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    <strong className="text-slate-700 dark:text-slate-200">Objective:</strong> {session.learningObjective}
                  </p>
                )}

                {/* Rejection Notice if rejected */}
                {session.status === 'Rejected' && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Booking Request Declined:</strong> {session.rejectReason || 'Teacher was unable to accept this session request.'}
                      {session.escrowStatus === 'Refunded' && (
                        <p className="text-[11px] mt-0.5 text-rose-700 dark:text-rose-400">Credit escrow refunded to student wallet.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Dispute Warning Notice if active */}
                {session.status === 'Disputed' && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Dispute Under Mediation:</strong> {session.disputeReason}
                      <p className="text-[11px] mt-0.5 text-rose-700 dark:text-rose-400">Credit settlement is paused. Both parties may submit chat logs to campus moderation.</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {/* Pending Request Action: Accept / Reject for Teacher */}
                    {session.status === 'Pending' ? (
                      isTeacher ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAccept(session)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Accept Session</span>
                          </button>
                          <button
                            onClick={() => handleReject(session)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800/40">
                            ⏳ Awaiting Teacher's Acceptance
                          </span>
                          <button
                            onClick={() => handleCancel(session)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs flex items-center gap-1"
                            title="Cancel booking request"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      )
                    ) : (
                      <>
                        {/* Enter Learning Room */}
                        {(session.status === 'Accepted' || session.status === 'Upcoming' || session.status === 'Awaiting Confirmation' || session.status === 'Completed') && (
                          <button
                            onClick={() => navigate(`/room/${session.id}`)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-xs"
                          >
                            <Video className="w-3.5 h-3.5 text-teal-400" />
                            <span>Enter Learning Room</span>
                          </button>
                        )}

                        {/* Two-Sided Completion Buttons */}
                        {(session.status === 'Awaiting Confirmation' || session.status === 'Accepted' || session.status === 'Upcoming') && (
                          <button
                            onClick={() => handleConfirm(session, isLearner ? 'learner' : 'teacher')}
                            disabled={isLearner ? session.learnerConfirmed : session.teacherConfirmed}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              (isLearner && session.learnerConfirmed) || (!isLearner && session.teacherConfirmed)
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 cursor-default'
                                : 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>
                              {(isLearner && session.learnerConfirmed) || (!isLearner && session.teacherConfirmed)
                                ? 'You Confirmed'
                                : 'Confirm Complete'}
                            </span>
                          </button>
                        )}

                        {/* Rate / Review when completed */}
                        {session.status === 'Completed' && (
                          <button
                            onClick={() => setReviewModalSession(session)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{session.ratingGiven ? 'Update Review' : 'Leave Peer Review'}</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Report / Dispute */}
                    {session.status !== 'Completed' && session.status !== 'Cancelled' && session.status !== 'Rejected' && (
                      <button
                        onClick={() => handleDispute(session)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs flex items-center gap-1"
                        title="File session dispute"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Dispute</span>
                      </button>
                    )}

                    {/* Cancel Booking */}
                    {(session.status === 'Upcoming' || session.status === 'Accepted') && (
                      <button
                        onClick={() => handleCancel(session)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1"
                        title="Cancel booking"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-soft">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No {activeTab.toLowerCase()} sessions found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            Connect with campus peers or browse the skill marketplace to book your next collaborative session.
          </p>
          <button
            onClick={() => navigate('/connect')}
            className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-xs"
          >
            Discover Mentors
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Book Peer Learning Session</h3>
              </div>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Select Mentor / Peer Teacher *</label>
                <select
                  value={bookingForm.tutorId}
                  onChange={e => {
                    const selTutor = availableTutors.find(t => (t.id || t._id) === e.target.value);
                    const suggestedSkill = selTutor?.skillsOffered?.[0]?.name || selTutor?.skillsOffered?.[0] || '';
                    setBookingForm({
                      ...bookingForm,
                      tutorId: e.target.value,
                      skill: suggestedSkill ? (typeof suggestedSkill === 'string' ? suggestedSkill : suggestedSkill.name) : bookingForm.skill
                    });
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none focus:border-teal-500"
                  required
                >
                  <option value="">-- Choose a Campus Peer --</option>
                  {availableTutors.map(t => (
                    <option key={t.id || t._id} value={t.id || t._id}>
                      {t.name} ({t.college || 'Peer'}) — {Array.isArray(t.skillsOffered) ? t.skillsOffered.map(s => typeof s === 'string' ? s : s.name).slice(0, 2).join(', ') : 'Peer Tutor'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Skill Topic *</label>
                <input
                  type="text"
                  value={bookingForm.skill}
                  onChange={e => setBookingForm({ ...bookingForm, skill: e.target.value })}
                  placeholder="e.g. React & State Management, Machine Learning Algorithms"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Scheduled Date</label>
                  <input
                    type="text"
                    value={bookingForm.scheduledDate}
                    onChange={e => setBookingForm({ ...bookingForm, scheduledDate: e.target.value })}
                    placeholder="Tomorrow, Oct 28, etc."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={bookingForm.scheduledTime}
                    onChange={e => setBookingForm({ ...bookingForm, scheduledTime: e.target.value })}
                    placeholder="6:00 PM (EST)"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Duration (Mins)</label>
                  <select
                    value={bookingForm.durationMinutes}
                    onChange={e => setBookingForm({ ...bookingForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none"
                  >
                    <option value={20}>20 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Format</label>
                  <select
                    value={bookingForm.format}
                    onChange={e => setBookingForm({ ...bookingForm, format: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none"
                  >
                    <option value="Live Online Session">Live Online Session</option>
                    <option value="Campus In-Person">Campus In-Person</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Learning Objective / Goals</label>
                <textarea
                  value={bookingForm.learningObjective}
                  onChange={e => setBookingForm({ ...bookingForm, learningObjective: e.target.value })}
                  placeholder="What would you like to focus on or solve together during this session?"
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {bookingSubmitting ? 'Sending Request...' : 'Send Booking Request'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Review {reviewModalSession.tutorName}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Provide authentic academic feedback on session quality and communication.</p>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Teaching Quality (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewRating({ ...reviewRating, teaching: n })}
                    className={`p-2 rounded-lg text-xs font-bold ${reviewRating.teaching >= n ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                  >
                    ★ {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Communication & Preparedness (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewRating({ ...reviewRating, communication: n })}
                    className={`p-2 rounded-lg text-xs font-bold ${reviewRating.communication >= n ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                  >
                    ★ {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Written Feedback</label>
              <textarea
                value={reviewRating.feedback}
                onChange={e => setReviewRating({ ...reviewRating, feedback: e.target.value })}
                placeholder="What went well? How was the pacing and clarity of explanations?"
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:border-teal-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewModalSession(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-xs"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
      <AuthModal />
    </div>
  );
};

export default SessionsPage;