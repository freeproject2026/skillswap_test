import React from 'react';
import { X, Sliders, Check, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardCustomizerModal = ({ isOpen, onClose }) => {
  const { dashboardPrefs, setDashboardPrefs, showToast } = useApp();

  if (!isOpen) return null;

  const sections = [
    { key: 'hero', label: 'Hero Banner', desc: 'Welcome message, skill exchange title & quick match buttons' },
    { key: 'quickActions', label: 'Quick Actions', desc: 'Discover, Request, Book session, and Wallet shortcuts' },
    { key: 'upcomingSessions', label: 'Upcoming Sessions', desc: 'Scheduled exchanges, tutors, and learning details' },
    { key: 'creditsWallet', label: 'Credits Wallet Summary', desc: 'Available balance, earned credits, and escrow meter' },
    { key: 'learningProgress', label: 'Learning Progress', desc: 'Milestone completion ring and semester roadmap' },
    { key: 'exploreSkills', label: 'Explore Categories', desc: 'Programming, Design, Languages, Academic categories' },
    { key: 'studentProfile', label: 'Student Profile Card', desc: 'Verified status, bio, and portfolio links' },
    { key: 'recommendedStudents', label: 'Recommended Peers', desc: 'Top ranked complementary mentor and student matches' },
    { key: 'popularSkills', label: 'Trending Campus Skills', desc: 'Interactive skill tags with listing counts' },
    { key: 'communityPromo', label: 'Community Circles Card', desc: 'Workshops, campus study circles, and challenges' },
  ];

  const handleToggle = (key) => {
    setDashboardPrefs(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('skillswap_dashboard_prefs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleResetDefaults = () => {
    const defaults = {
      hero: true,
      quickActions: true,
      upcomingSessions: true,
      creditsWallet: true,
      learningProgress: true,
      exploreSkills: true,
      studentProfile: true,
      recommendedStudents: true,
      popularSkills: true,
      communityPromo: true,
    };
    setDashboardPrefs(defaults);
    localStorage.setItem('skillswap_dashboard_prefs', JSON.stringify(defaults));
    showToast('Dashboard sections reset to default layout', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Customize Dashboard
              </h3>
              <p className="text-xs text-slate-400">
                Choose which sections appear on your Home overview
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section List */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
          {sections.map((sec) => {
            const isVisible = dashboardPrefs[sec.key] !== false;

            return (
              <div
                key={sec.key}
                onClick={() => handleToggle(sec.key)}
                className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {sec.label}
                    </span>
                    {!isVisible && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {sec.desc}
                  </p>
                </div>

                {/* Switch indicator */}
                <button
                  type="button"
                  aria-label={`Toggle ${sec.label}`}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                    isVisible ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                      isVisible ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors shadow-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export default DashboardCustomizerModal;
