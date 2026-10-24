import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield } from 'lucide-react';
import Logo from '../Logo';

// Clean standard SVG brand icons
const GithubIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
  </svg>
);

const TwitterIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const HomeFooter = () => {
  return (
    <footer className="mt-12 pt-8 pb-10 border-t border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Left: Brand logo & Tagline */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
          <Logo size="small" showText={true} />
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Real Skills | Real People | Real Opportunities
          </p>
          <p className="text-[10px] text-slate-400">
            Campus Peer-to-Peer Learning & Skill Passport Platform
          </p>
        </div>

        {/* Center: Essential Links */}
        <div className="flex flex-wrap justify-center items-center gap-5 font-semibold text-slate-600 dark:text-slate-300 text-xs">
          <Link to="/connect/people" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Discover
          </Link>
          <Link to="/sessions" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Exchanges
          </Link>
          <Link to="/wallet" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Credits
          </Link>
          <Link to="/campus" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Community
          </Link>
          <Link to="/settings" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Privacy & Terms
          </Link>
          <Link to="/settings" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Contact Support
          </Link>
        </div>

        {/* Right: Social icons & Copyright */}
        <div className="flex flex-col items-center sm:items-end gap-2 text-center sm:text-right">
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn page"
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter / X profile"
              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 transition-colors"
            >
              <TwitterIcon className="w-4 h-4" />
            </a>
          </div>

          <p className="text-[10px] text-slate-400">
            © 2026 SkillSwap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
