import React from 'react';
import {
  GraduationCap, CheckCircle2, Edit3, Globe,
  ShieldCheck, User, LogIn, UserPlus, Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// High-fidelity social icons
const GithubIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
  </svg>
);

export const StudentProfileCard = ({ onEditProfile }) => {
  const { currentUser, isGuest, setAuthModalOpen } = useApp();

  // If unauthenticated or in Guest mode: show guest registration invitation instead of fake data
  if (isGuest || !currentUser) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-4">
        <div className="h-16 -mx-5 -mt-5 bg-gradient-to-r from-slate-200 via-teal-100 to-indigo-100 dark:from-slate-800 dark:via-teal-950/40 dark:to-indigo-950/40 relative"></div>
        <div className="relative -mt-11 flex items-start justify-between">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center text-slate-400">
            <User className="w-8 h-8" />
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
            Guest Visitor
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Create Your Student Profile
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Sign in with your campus email to showcase your skills, track earned credits, and unlock 1:1 learning exchanges.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In or Register</span>
          </button>
        </div>
      </div>
    );
  }

  const name = currentUser.name;
  const college = currentUser.college || 'UC Berkeley';
  const branch = currentUser.branch || 'Computer Science & Engineering';
  const semester = currentUser.semester || '6th Semester';
  const bio = currentUser.bio || 'Excited to learn and exchange skills on SkillSwap!';
  const avatar = currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const isVerified = Boolean(currentUser.emailVerified);
  const socialLinks = currentUser.socialLinks || {};

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-4">
      {/* Subtle top banner accent */}
      <div className="h-16 -mx-5 -mt-5 bg-gradient-to-r from-teal-500/20 via-indigo-500/20 to-purple-500/20 relative"></div>

      {/* Avatar & Header */}
      <div className="relative -mt-11 flex items-start justify-between">
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-md"
          />
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
        </div>

        {/* Edit Profile Button */}
        <button
          onClick={onEditProfile}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Identity & Verification */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {name}
          </h3>

          {/* College Verification Badge: ONLY shown if actually verified */}
          {isVerified && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-[10px] font-bold border border-teal-200 dark:border-teal-800/40"
              title="Verified by campus email"
            >
              <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              <span>College Verified</span>
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
          {branch} {semester && `· ${semester}`}
        </p>

        <p className="text-xs text-slate-400 dark:text-slate-400 flex items-center gap-1">
          <GraduationCap className="w-3.5 h-3.5 text-teal-500" />
          <span>{college}</span>
        </p>
      </div>

      {/* Bio */}
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        {bio}
      </p>

      {/* Social / Portfolio Links */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
        {socialLinks.github && (
          <a
            href={socialLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
          </a>
        )}

        {socialLinks.linkedin && (
          <a
            href={socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
          >
            <LinkedinIcon className="w-3.5 h-3.5" />
          </a>
        )}

        {socialLinks.portfolio && (
          <a
            href={socialLinks.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Personal Portfolio"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
          </a>
        )}

        <span className="text-[11px] text-slate-400 ml-auto font-medium">
          Portfolio & Links
        </span>
      </div>
    </div>
  );
};

export default StudentProfileCard;
