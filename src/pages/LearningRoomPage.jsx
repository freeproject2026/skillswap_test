import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Video, Mic, MicOff, VideoOff, MessageSquare, Bot, Share2,
  FileText, Link as LinkIcon, CheckCircle, AlertTriangle, ArrowLeft,
  Sparkles, ExternalLink, Plus, Save, Clock, ShieldCheck
} from 'lucide-react';
import { sessionService } from '../services/sessionService';
import { walletService } from '../services/walletService';
import { LearningCompanionDrawer } from '../components/LearningCompanionDrawer';
import { useApp } from '../context/AppContext';

export const LearningRoomPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sharedResources, setSharedResources] = useState([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [taskSubmissionUrl, setTaskSubmissionUrl] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'resources' | 'tasks' | 'completion'

  useEffect(() => {
    const loadSession = async () => {
      setLoading(true);
      try {
        const s = await sessionService.getSessionById(sessionId);
        setSession(s);
        setSessionNotes(s.sessionNotes || '');
        setSharedResources(s.sharedResources || []);
        setNextSteps(s.nextSteps || '');
        if (s.taskSubmission) {
          setTaskSubmissionUrl(s.taskSubmission.url || '');
          setTaskNotes(s.taskSubmission.notes || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [sessionId]);

  const handleSaveNotes = async () => {
    try {
      await sessionService.updateSessionNotes(session.id, {
        sessionNotes,
        sharedResources,
        nextSteps
      });
      showToast('Session notes & shared resources saved!');
    } catch (err) {
      console.error(err);
      showToast('Failed to save notes', 'error');
    }
  };

  const handleAddResource = () => {
    if (!newLinkUrl.trim()) return;
    const item = {
      title: newLinkTitle.trim() || 'Resource Link',
      url: newLinkUrl.trim()
    };
    const updated = [...sharedResources, item];
    setSharedResources(updated);
    setNewLinkTitle('');
    setNewLinkUrl('');
    sessionService.updateSessionNotes(session.id, { sharedResources: updated });
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!taskSubmissionUrl.trim()) return;
    try {
      await sessionService.submitTaskInRoom(session.id, {
        url: taskSubmissionUrl.trim(),
        notes: taskNotes.trim()
      });
      showToast('Practical evidence submitted to room record!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmCompletion = async (role = 'learner') => {
    try {
      const updated = await sessionService.confirmCompletion(session.id, role);
      setSession({ ...updated });
      if (updated.status === 'Completed' && session.creditCost > 0) {
        await walletService.releaseEscrowOnCompletion(session.skill, session.tutorName, session.creditCost);
        showToast('Both participants confirmed! Escrow credits released to tutor.', 'success');
      } else {
        showToast('Your completion confirmation logged. Awaiting peer confirmation.', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispute = async () => {
    const reason = prompt('State the dispute reason (audio drop, no-show, premature exit):');
    if (!reason || !reason.trim()) return;
    try {
      const updated = await sessionService.disputeSession(session.id, reason.trim());
      await walletService.disputeEscrowHold(session.skill, session.tutorName, session.creditCost, reason.trim());
      setSession({ ...updated });
      showToast('Session settlement paused. Logged for campus moderation.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400 mt-2">Connecting to Learning Room...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Session not found.</p>
        <button onClick={() => navigate('/sessions')} className="mt-3 text-xs font-bold text-teal-600">Back to Sessions</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 pb-24 space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate('/sessions')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All Sessions
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCompanionOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-colors shadow-xs"
          >
            <Bot className="w-4 h-4" />
            <span>AI Companion</span>
          </button>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            session.status === 'Completed'
              ? 'bg-emerald-100 text-emerald-800'
              : session.status === 'Disputed'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-teal-100 text-teal-800'
          }`}>
            {session.status}
          </span>
        </div>
      </div>

      {/* Main Room Layout: Left video/canvas stage, Right collaborative panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Stage Area (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Simulated Video Calling & Collaboration Stage */}
          <div className="relative rounded-2xl bg-slate-950 aspect-video overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between p-4 text-white">
            <div className="flex items-center justify-between text-xs z-10">
              <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold">{session.skill}</span>
              </div>
              <span className="bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-xs text-[11px] text-slate-300">
                Escrow: {session.creditCost} Credits
              </span>
            </div>

            {/* Video Streams Placeholder */}
            <div className="grid grid-cols-2 gap-3 my-auto max-w-md mx-auto w-full">
              {/* Tutor Stream */}
              <div className="relative aspect-video rounded-xl bg-slate-800/80 border border-slate-700 overflow-hidden flex flex-col items-center justify-center p-3 text-center">
                <img src={session.tutorAvatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-400 mb-1" />
                <p className="text-xs font-bold text-white">{session.tutorName}</p>
                <span className="text-[10px] text-teal-300">Tutor / Mentor</span>
              </div>

              {/* Student Stream */}
              <div className="relative aspect-video rounded-xl bg-slate-800/80 border border-slate-700 overflow-hidden flex flex-col items-center justify-center p-3 text-center">
                <img src={session.studentAvatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-400 mb-1" />
                <p className="text-xs font-bold text-white">{session.studentName}</p>
                <span className="text-[10px] text-teal-300">Student Learner</span>
              </div>
            </div>

            {/* Bottom Controls Strip */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 z-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 rounded-xl transition-colors ${isMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-2 rounded-xl transition-colors ${isVideoOff ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
                >
                  {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
                WebRTC & Canvas Whiteboard Placeholder
              </div>
            </div>
          </div>

          {/* Session Overview Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft space-y-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Session Objective & Next Milestones</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {session.learningObjective || 'No objective specified.'}
            </p>
            {session.nextSteps && (
              <p className="text-xs text-teal-800 bg-teal-50 p-2.5 rounded-xl border border-teal-100">
                <strong>Next Steps:</strong> {session.nextSteps}
              </p>
            )}
          </div>
        </div>

        {/* Right Collaborative Workstation (5 cols on desktop) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden flex flex-col h-[560px]">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/70 p-1 text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2 rounded-xl transition-all ${activeTab === 'notes' ? 'bg-white text-teal-700 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Session Notes
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex-1 py-2 rounded-xl transition-all ${activeTab === 'resources' ? 'bg-white text-teal-700 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Resources ({sharedResources.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-2 rounded-xl transition-all ${activeTab === 'tasks' ? 'bg-white text-teal-700 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Task Proof
            </button>
            <button
              onClick={() => setActiveTab('completion')}
              className={`flex-1 py-2 rounded-xl transition-all ${activeTab === 'completion' ? 'bg-white text-teal-700 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Confirm & Settle
            </button>
          </div>

          {/* Tab Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Live Shared Scratchpad</span>
                  <button
                    onClick={handleSaveNotes}
                    className="flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Notes
                  </button>
                </div>
                <textarea
                  value={sessionNotes}
                  onChange={e => setSessionNotes(e.target.value)}
                  placeholder="Record key concepts, code snippets, syntax reminders, or formulas discussed during this session..."
                  className="flex-1 w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none resize-none font-mono leading-relaxed"
                />
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Agreed Next Steps for Student</label>
                  <input
                    type="text"
                    value={nextSteps}
                    onChange={e => setNextSteps(e.target.value)}
                    placeholder="e.g. Complete shader rotation assignment before Saturday"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Shared Reference Materials</span>
                <div className="space-y-2">
                  {sharedResources.map((res, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="truncate mr-2">
                        <p className="font-bold text-slate-800 truncate">{res.title}</p>
                        <a href={res.url} target="_blank" rel="noreferrer" className="text-[10px] text-teal-600 hover:underline flex items-center gap-1">
                          {res.url} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 block">Add Link / Repo</span>
                  <input
                    type="text"
                    placeholder="Resource Title (e.g. Official Documentation)"
                    value={newLinkTitle}
                    onChange={e => setNewLinkTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newLinkUrl}
                    onChange={e => setNewLinkUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                  <button
                    onClick={handleAddResource}
                    disabled={!newLinkUrl.trim()}
                    className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" /> Attach Resource
                  </button>
                </div>
              </div>
            )}

            {/* Task Proof Tab */}
            {activeTab === 'tasks' && (
              <form onSubmit={handleSubmitTask} className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Submit Practical Task Proof</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Submit code links or design prototypes completed during this session to update your Skill Passport.
                </p>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Project / PR / Figma URL</label>
                  <input
                    type="text"
                    value={taskSubmissionUrl}
                    onChange={e => setTaskSubmissionUrl(e.target.value)}
                    placeholder="https://github.com/your-username/project-repo"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Execution Notes & Test Results</label>
                  <textarea
                    value={taskNotes}
                    onChange={e => setTaskNotes(e.target.value)}
                    placeholder="Summary of what you implemented and how to verify it..."
                    rows={3}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!taskSubmissionUrl.trim()}
                  className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-40"
                >
                  Submit for Peer Review
                </button>
              </form>
            )}

            {/* Two-Sided Completion Tab (Feature 9 & 10) */}
            {activeTab === 'completion' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-teal-900 font-bold">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Two-Sided Escrow Settlement</span>
                  </div>
                  <p className="text-[11px] text-teal-800 leading-relaxed">
                    Credits are only transferred when <strong>both</strong> the learner and tutor independently confirm the session occurred according to expectations.
                  </p>
                </div>

                {/* Status Badges */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-semibold text-slate-700">Learner Confirmation (You):</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                      session.learnerConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {session.learnerConfirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-semibold text-slate-700">Tutor Confirmation ({session.tutorName}):</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                      session.teacherConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {session.teacherConfirmed ? 'Confirmed' : 'Awaiting confirmation'}
                    </span>
                  </div>
                </div>

                {/* Settle Action */}
                <button
                  onClick={() => handleConfirmCompletion('learner')}
                  disabled={session.learnerConfirmed}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    session.learnerConfirmed
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                      : 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600 shadow-sm'
                  }`}
                >
                  {session.learnerConfirmed ? 'You Have Confirmed Completion' : 'Confirm Session Occurred'}
                </button>

                {/* Dispute Action */}
                {session.status !== 'Completed' && (
                  <button
                    onClick={handleDispute}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                  >
                    Report Issue / Dispute Session
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Companion Drawer */}
      <LearningCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
        contextTopic={session.skill}
        initialNotes={sessionNotes}
      />
    </div>
  );
};

export default LearningRoomPage;
