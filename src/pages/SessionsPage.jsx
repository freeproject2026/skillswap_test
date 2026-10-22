import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Video, CheckCircle, AlertTriangle, ArrowRight,
  ShieldAlert, RefreshCw, XCircle, Star, Sparkles, MessageCircle, ExternalLink
} from 'lucide-react';
import { sessionService } from '../services/sessionService';
import { walletService } from '../services/walletService';
import { useApp } from '../context/AppContext';
import { ReportModal } from '../components/ReportModal';

const TABS = ['All', 'Upcoming', 'Awaiting Confirmation', 'Completed', 'Disputed'];

export const SessionsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [reportTarget, setReportTarget] = useState(null);
  const [reviewModalSession, setReviewModalSession] = useState(null);
  const [reviewRating, setReviewRating] = useState({ teaching: 5, communication: 5, feedback: '' });

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
    loadSessions();
  }, []);

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
      if (session.creditCost > 0) {
        await walletService.refundCreditsOnCancel(session.skill, session.tutorName, session.creditCost);
      }
      showToast('Session cancelled. 100% escrow credits refunded.', 'info');
      loadSessions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModalSession) return;
    try {
      await sessionService.submitSessionReview(reviewModalSession.id, {
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

  const filteredSessions = sessions.filter(s => {
    if (activeTab === 'All') return true;
    return s.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 pb-24 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600" />
            <span>Learning Sessions & Escrow</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage upcoming bookings, launch learning rooms, and two-sided completion reviews
          </p>
        </div>

        <button
          onClick={() => navigate('/requests')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-xs"
        >
          <Sparkles className="w-4 h-4" />
          <span>Post Learning Request</span>
        </button>
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
                : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
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
          {filteredSessions.map(session => (
            <div
              key={session.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft hover:shadow-card transition-all"
            >
              {/* Top Row: Skill & Status */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                    session.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : session.status === 'Upcoming'
                      ? 'bg-teal-100 text-teal-800'
                      : session.status === 'Awaiting Confirmation'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : session.status === 'Disputed'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {session.status}
                  </span>
                  <h3 className="text-base font-bold text-slate-800 leading-tight">
                    {session.skill}
                  </h3>
                </div>

                {/* Credit Cost Badge */}
                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-teal-700">
                    {session.creditCost === 0 ? 'Mutual Swap (0 Cr)' : `${session.creditCost} Credits`}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Escrow: <strong className={session.escrowStatus === 'Reserved' ? 'text-amber-600' : session.escrowStatus === 'Paused' ? 'text-rose-500' : 'text-emerald-600'}>{session.escrowStatus}</strong>
                  </p>
                </div>
              </div>

              {/* Participant & Schedule Strip */}
              <div className="flex flex-wrap items-center gap-4 py-3 border-y border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <img src={session.tutorAvatar} alt="" className="w-6 h-6 rounded-full object-cover ring-1 ring-teal-500" />
                  <span>Tutor: <strong>{session.tutorName}</strong> ({session.tutorCollege})</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>{session.scheduledDate} at {session.scheduledTime} ({session.durationMinutes} mins)</span>
                </div>
                <div className="text-slate-500">
                  Format: <strong>{session.format}</strong>
                </div>
              </div>

              {/* Objective */}
              {session.learningObjective && (
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  <strong className="text-slate-700">Objective:</strong> {session.learningObjective}
                </p>
              )}

              {/* Dispute Warning Notice if active */}
              {session.status === 'Disputed' && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Dispute Under Mediation:</strong> {session.disputeReason}
                    <p className="text-[11px] mt-0.5 text-rose-700">Credit settlement is paused. Both parties may submit chat logs to campus moderation.</p>
                  </div>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {/* Enter Learning Room */}
                  <button
                    onClick={() => navigate(`/room/${session.id}`)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5 text-teal-400" />
                    <span>Enter Learning Room</span>
                  </button>

                  {/* Two-Sided Completion Buttons */}
                  {session.status === 'Awaiting Confirmation' || session.status === 'Upcoming' ? (
                    <button
                      onClick={() => handleConfirm(session, 'learner')}
                      disabled={session.learnerConfirmed}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        session.learnerConfirmed
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                          : 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{session.learnerConfirmed ? 'You Confirmed' : 'Confirm Complete'}</span>
                    </button>
                  ) : null}

                  {/* Rate / Review when completed */}
                  {session.status === 'Completed' && (
                    <button
                      onClick={() => setReviewModalSession(session)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{session.ratingGiven ? 'Update Review' : 'Leave Peer Review'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Report / Dispute */}
                  {session.status !== 'Completed' && session.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleDispute(session)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs flex items-center gap-1"
                      title="File session dispute"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Dispute</span>
                    </button>
                  )}

                  {/* Cancel Booking */}
                  {session.status === 'Upcoming' && (
                    <button
                      onClick={() => handleCancel(session)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs flex items-center gap-1"
                      title="Cancel booking"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 p-8 shadow-soft">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No {activeTab.toLowerCase()} sessions found</h3>
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

      {/* Review Modal */}
      {reviewModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Review {reviewModalSession.tutorName}</h3>
            <p className="text-xs text-slate-500">Provide authentic academic feedback on session quality and communication.</p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Teaching Quality (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewRating({ ...reviewRating, teaching: n })}
                    className={`p-2 rounded-lg text-xs font-bold ${reviewRating.teaching >= n ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'}`}
                  >
                    ★ {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Communication & Preparedness (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewRating({ ...reviewRating, communication: n })}
                    className={`p-2 rounded-lg text-xs font-bold ${reviewRating.communication >= n ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-400'}`}
                  >
                    ★ {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Written Feedback</label>
              <textarea
                value={reviewRating.feedback}
                onChange={e => setReviewRating({ ...reviewRating, feedback: e.target.value })}
                placeholder="What went well? How was the pacing and clarity of explanations?"
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewModalSession(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
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
    </div>
  );
};

export default SessionsPage;
