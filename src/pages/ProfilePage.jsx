import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Star, Award, CheckCircle, Zap, Sparkles, Edit, Settings,
  Clock, Video, Users, BookOpen, Shield, Coins, Globe, GraduationCap,
  ExternalLink, Code2, Share2, CheckCircle2, TrendingUp, Layers,
  Compass, FileCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import VideoCard from '../components/VideoCard';
import SkillPassportView from '../components/SkillPassportView';
import EditProfileModal from '../components/EditProfileModal';
import AuthGate from '../components/auth/AuthGate';
import AuthModal from '../components/auth/AuthModal';
import { studentProfileService } from '../services/studentProfileService';
import { proofOfLearningService } from '../services/proofOfLearningService';
import { MOCK_VIDEOS } from '../data/mockVideos';

const PROFILE_TABS = ['Skill Passport', 'Impact Dashboard', 'Proof of Learning', 'My Videos'];

export const ProfilePage = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    setCurrentUser,
    isGuest,
    authModalOpen,
    setAuthModalOpen,
    authModalTab
  } = useApp();

  const [activeTab, setActiveTab] = useState('Skill Passport');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [proofTasks, setProofTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      setLoadingTasks(true);
      try {
        const tasks = await proofOfLearningService.getTasks();
        setProofTasks(tasks);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingTasks(false);
      }
    };
    if (currentUser) {
      loadTasks();
    }
  }, [currentUser]);

  // If Guest or Unauthenticated: Display AuthGate per Requirement D
  if (isGuest || !currentUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-8">
        <AuthGate
          featureName="Student Profile & Skill Passport"
          description="Sign in or register with your campus email to view and manage your verified Skill Passport, project credentials, teaching statistics, and learning proofs."
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialTab={authModalTab}
        />
      </div>
    );
  }

  const completion = studentProfileService.calculateCompletionPercentage(currentUser);
  const myVideos = MOCK_VIDEOS.filter(v => v.creator?.id === currentUser.id || v.creator?.id === 'usr_me');

  return (
    <div className="max-w-4xl mx-auto pb-24 px-3 sm:px-6 py-4 space-y-6 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Cover Image Banner */}
      <div className="relative rounded-2xl overflow-hidden h-40 sm:h-52 shadow-card">
        <img src={currentUser.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        {/* Academic Affiliation Pill */}
        {currentUser.college && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 shadow-sm">
            <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
            <span>{currentUser.college}</span>
            {currentUser.semester && <span className="text-teal-300">· {currentUser.semester}</span>}
          </div>
        )}
      </div>

      {/* Profile Header Overlap */}
      <div className="relative -mt-16 sm:-mt-20 z-10 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-3.5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-lg bg-white dark:bg-slate-800"
              />
              {currentUser.emailVerified && (
                <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-teal-600 text-white shadow-xs" title="Verified Campus Student">
                  <CheckCircle className="w-4 h-4" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {currentUser.name}
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-[10px] font-bold border border-teal-100 dark:border-teal-800/40">
                  {currentUser.branch || 'Undergraduate'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">@{currentUser.username}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.location || 'Campus'}</span>
                {currentUser.availableTimeSlots && (
                  <span className="text-teal-700 dark:text-teal-300 ml-2 font-medium">· {currentUser.availableTimeSlots}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
          {currentUser.bio}
        </p>

        {/* Profile Completeness Bar */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">
              Smart Profile Completeness: <strong>{completion.percentage}%</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-36 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full transition-all duration-300"
                style={{ width: `${completion.percentage}%` }}
              />
            </div>
            {completion.missingFields.length > 0 && (
              <button
                onClick={() => setEditModalOpen(true)}
                className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
              >
                + Complete {completion.missingFields[0]}
              </button>
            )}
          </div>
        </div>

        {/* Social / Portfolio Links */}
        {currentUser.socialLinks && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {currentUser.socialLinks.github && (
              <a
                href={currentUser.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
              >
                <Code2 className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" /> GitHub
              </a>
            )}
            {currentUser.socialLinks.portfolio && (
              <a
                href={currentUser.socialLinks.portfolio}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Portfolio
              </a>
            )}
            {currentUser.socialLinks.linkedin && (
              <a
                href={currentUser.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> LinkedIn
              </a>
            )}
          </div>
        )}
      </div>

      {/* Profile Section Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto no-scrollbar">
        {PROFILE_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 1: Skill Passport */}
      {activeTab === 'Skill Passport' && (
        <SkillPassportView student={currentUser} isOwnProfile={true} />
      )}

      {/* Tab 2: Learning Impact Dashboard */}
      {activeTab === 'Impact Dashboard' && (
        <div className="space-y-5">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft text-center">
              <p className="text-2xl font-extrabold text-teal-700 dark:text-teal-400">{currentUser.hoursTaught || 54}h</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Hours Taught</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft text-center">
              <p className="text-2xl font-extrabold text-purple-700 dark:text-purple-400">{currentUser.hoursLearned || 38}h</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Hours Learned</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft text-center">
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{currentUser.completedSessionsCount || 42}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Sessions Completed</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft text-center">
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{currentUser.tasksApprovedCount || 12}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Tasks Verified</p>
            </div>
          </div>

          {/* Teaching vs Communication Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Teaching Quality Rating</span>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{currentUser.teachingRating || 4.95}</span>
                <span className="text-xs text-slate-400">/ 5.0 (38 completed sessions)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Evaluated for technical depth, pacing, and helpful code review walk-throughs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Communication & Punctuality</span>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{currentUser.communicationRating || 4.88}</span>
                <span className="text-xs text-slate-400">/ 5.0 (Zero no-shows recorded)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Prompt responses, respectful peer interaction, and zero unexcused cancellations.
              </p>
            </div>
          </div>

          {/* Active Goals & Milestones */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Active Learning Milestones
              </span>
              <button onClick={() => navigate('/analyzer')} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
                Open Career Analyzer →
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <strong>Semester Objective:</strong> {currentUser.learningGoals}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Proof of Learning Tasks */}
      {activeTab === 'Proof of Learning' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Practical Tasks & Rubrics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Submit concrete coding or design assignments to advance your verified evidence tier</p>
            </div>
          </div>

          <div className="space-y-3">
            {proofTasks.map(task => (
              <div
                key={task.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-100 dark:border-teal-800/40">
                      {task.skill} · {task.targetProficiency}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{task.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">{task.objective}</p>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    task.status === 'Approved'
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                      : task.status === 'Under Review'
                      ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300'
                      : task.status === 'Changes Requested'
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {task.status}
                  </span>
                </div>

                {/* Rubric Checklist */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-200 block text-[11px] uppercase tracking-wider">Evaluation Rubric:</span>
                  {task.rubric?.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-teal-600 dark:text-teal-400 font-bold">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                {/* Reviewer Feedback (if any) */}
                {task.mentorFeedback && (
                  <div className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-800/50 text-xs text-teal-900 dark:text-teal-200 space-y-1">
                    <span className="font-bold block text-[11px]">
                      Reviewer Feedback ({task.mentorName} · {task.reviewDate}):
                    </span>
                    <p className="italic">"{task.mentorFeedback}"</p>
                  </div>
                )}

                {/* Submission Link */}
                {task.submittedUrl && (
                  <div className="text-xs flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <span>Submitted Evidence:</span>
                    <a href={task.submittedUrl} target="_blank" rel="noreferrer" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1">
                      {task.submittedUrl} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: My Videos */}
      {activeTab === 'My Videos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">My Tutorial Uploads ({myVideos.length})</h3>
            <button onClick={() => navigate('/upload')} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
              + Upload New Video
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myVideos.map(v => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        currentProfile={currentUser}
        onSaveSuccess={(updated) => setCurrentUser(updated)}
      />

      {/* Auth Modal for Guests */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </div>
  );
};

export default ProfilePage;
