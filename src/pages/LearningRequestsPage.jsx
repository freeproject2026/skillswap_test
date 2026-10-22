import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Plus, Search, Filter, Clock, GraduationCap, CheckCircle,
  MessageSquare, UserPlus, X, Send, ArrowRight
} from 'lucide-react';
import { learningRequestService } from '../services/learningRequestService';
import { SKILL_CATEGORIES } from '../data/mockSkillsData';
import { useApp } from '../context/AppContext';

export const LearningRequestsPage = () => {
  const navigate = useNavigate();
  const { showToast, currentUser } = useApp();

  const [requests, setRequests] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [respondModalRequest, setRespondModalRequest] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');

  // New Request Form State
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    skill: '',
    category: 'Programming, DSA & Web Dev',
    currentProficiency: 'Beginner',
    targetProficiency: 'Intermediate',
    learningGoal: '',
    desiredOutcome: '',
    preferredSchedule: 'Weekday Evenings',
    language: 'English',
    format: 'Live Online Session',
    proposedCredits: 40
  });

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await learningRequestService.getRequests({
        category: selectedCategory,
        format: selectedFormat,
        search
      });
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [selectedCategory, selectedFormat, search]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newRequest.title.trim() || !newRequest.skill.trim()) {
      showToast('Title and skill are required', 'error');
      return;
    }

    try {
      await learningRequestService.createRequest({
        ...newRequest,
        authorId: currentUser?.id || 'usr_me',
        authorName: currentUser?.name || 'Alex Rivera',
        authorAvatar: currentUser?.avatar || '',
        college: currentUser?.college || 'UC Berkeley'
      });
      showToast('Learning request posted to campus board!');
      setCreateModalOpen(false);
      setNewRequest({
        title: '',
        description: '',
        skill: '',
        category: 'Programming, DSA & Web Dev',
        currentProficiency: 'Beginner',
        targetProficiency: 'Intermediate',
        learningGoal: '',
        desiredOutcome: '',
        preferredSchedule: 'Weekday Evenings',
        language: 'English',
        format: 'Live Online Session',
        proposedCredits: 40
      });
      loadRequests();
    } catch (err) {
      console.error(err);
      showToast('Failed to post request', 'error');
    }
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!responseMessage.trim() || !respondModalRequest) return;
    try {
      await learningRequestService.respondToRequest(respondModalRequest.id, {
        responderId: currentUser?.id || 'usr_me',
        responderName: currentUser?.name || 'Alex Rivera',
        responderAvatar: currentUser?.avatar || '',
        message: responseMessage.trim()
      });
      showToast('Response sent to student!');
      setRespondModalRequest(null);
      setResponseMessage('');
      loadRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptResponse = async (requestId, responseId) => {
    try {
      await learningRequestService.acceptResponse(requestId, responseId);
      showToast('Peer proposal accepted! Proceeding to session booking.');
      loadRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 pb-24 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-teal-600" />
            <span>Campus Learning Requests</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Post what you want to learn or explore requests to teach peers in exchange for credits
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Request</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by topic, skill, or student..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-teal-500 bg-white"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-teal-500"
        >
          {SKILL_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={selectedFormat}
          onChange={e => setSelectedFormat(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-teal-500"
        >
          <option value="All">All Formats</option>
          <option value="Live Online Session">Live Online Session</option>
          <option value="Shared Project">Shared Project</option>
          <option value="Chat & Code Review">Chat & Code Review</option>
        </select>
      </div>

      {/* Requests Feed */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map(req => (
            <div
              key={req.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                {/* Author & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <img src={req.authorAvatar} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-teal-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{req.authorName}</p>
                      <p className="text-[10px] text-slate-400">{req.college}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    req.status === 'Open'
                      ? 'bg-emerald-100 text-emerald-800'
                      : req.status === 'Responses Received'
                      ? 'bg-teal-100 text-teal-800'
                      : req.status === 'Accepted'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {req.status}
                  </span>
                </div>

                {/* Title & Skill Badge */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2">
                  {req.title}
                </h3>

                <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-semibold border border-teal-100">
                    {req.skill}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    Level: {req.currentProficiency} → {req.targetProficiency}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-100">
                    {req.proposedCredits === 0 ? 'Mutual Swap (0 Cr)' : `${req.proposedCredits} Credits`}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">
                  {req.description}
                </p>

                {/* Schedule & Format */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1 mb-3">
                  <p><strong>Goal:</strong> {req.learningGoal || req.desiredOutcome}</p>
                  <p><strong>Preferred:</strong> {req.preferredSchedule} · {req.format}</p>
                </div>

                {/* Responses Preview */}
                {req.responses && req.responses.length > 0 && (
                  <div className="space-y-1.5 mb-3 pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Responses ({req.responses.length})</p>
                    {req.responses.map(resp => (
                      <div key={resp.id} className="p-2 rounded-lg bg-teal-50/50 border border-teal-100 flex items-center justify-between text-xs">
                        <div className="truncate mr-2">
                          <span className="font-bold text-slate-800">{resp.responderName}:</span>{' '}
                          <span className="text-slate-600 italic">"{resp.message}"</span>
                        </div>
                        {req.authorId === 'usr_me' && resp.status === 'Pending' && (
                          <button
                            onClick={() => handleAcceptResponse(req.id, resp.id)}
                            className="px-2.5 py-1 rounded bg-teal-600 text-white text-[10px] font-bold hover:bg-teal-700 shrink-0"
                          >
                            Accept Offer
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                {req.authorId !== 'usr_me' && req.status !== 'Accepted' ? (
                  <button
                    onClick={() => setRespondModalRequest(req)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Offer to Help & Earn</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Your posted request</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 p-8 shadow-soft">
          <p className="text-sm font-bold text-slate-700">No learning requests match your filter.</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Be the first to post a study request for this topic!</p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
          >
            Post Request
          </button>
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Post a Student Learning Request</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Request Headline *</label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={e => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="e.g. Need help understanding binary search tree balancing"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Topic / Skill *</label>
                  <input
                    type="text"
                    value={newRequest.skill}
                    onChange={e => setNewRequest({ ...newRequest, skill: e.target.value })}
                    placeholder="e.g. C++ Data Structures"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newRequest.category}
                    onChange={e => setNewRequest({ ...newRequest, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                  >
                    {SKILL_CATEGORIES.filter(c => c !== 'All Categories').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Description *</label>
                <textarea
                  value={newRequest.description}
                  onChange={e => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="What specifically are you stuck on or trying to build?"
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Desired Outcome</label>
                  <input
                    type="text"
                    value={newRequest.desiredOutcome}
                    onChange={e => setNewRequest({ ...newRequest, desiredOutcome: e.target.value })}
                    placeholder="e.g. Pass exam / finish assignment"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Proposed Credits</label>
                  <input
                    type="number"
                    value={newRequest.proposedCredits}
                    onChange={e => setNewRequest({ ...newRequest, proposedCredits: e.target.value })}
                    min="0"
                    placeholder="0 for mutual barter"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Schedule</label>
                  <input
                    type="text"
                    value={newRequest.preferredSchedule}
                    onChange={e => setNewRequest({ ...newRequest, preferredSchedule: e.target.value })}
                    placeholder="e.g. Saturday afternoon"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Format</label>
                  <select
                    value={newRequest.format}
                    onChange={e => setNewRequest({ ...newRequest, format: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                  >
                    <option value="Live Online Session">Live Online Session</option>
                    <option value="Shared Project">Shared Project</option>
                    <option value="Chat & Code Review">Chat & Code Review</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-xs"
                >
                  Post to Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Respond Modal */}
      {respondModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Respond to {respondModalRequest.authorName}</h3>
            <p className="text-xs text-slate-600 leading-snug">
              Request: <strong>{respondModalRequest.title}</strong> ({respondModalRequest.proposedCredits} Credits)
            </p>

            <form onSubmit={handleSendResponse} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Proposal / Availability</label>
                <textarea
                  value={responseMessage}
                  onChange={e => setResponseMessage(e.target.value)}
                  placeholder="I can help you review this on Saturday! I have completed this course with an A."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRespondModalRequest(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Offer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningRequestsPage;
