import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, LogOut, Bell, Shield, User, Palette, Info, Moon, Sun, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthGate } from '../components/auth/AuthGate';
import { AuthModal } from '../components/auth/AuthModal';

const Toggle = ({ label, enabled, onChange }) => (
  <label className="flex items-center justify-between py-2.5 cursor-pointer group">
    <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 ${enabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  </label>
);

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { currentUser, isGuest, logout, setAuthModalOpen, showToast, theme, setTheme } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [location, setLocation] = useState(currentUser?.location || '');

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifInApp, setNotifInApp] = useState(true);

  const [showOnline, setShowOnline] = useState(true);
  const [allowConnections, setAllowConnections] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);

  if (isGuest || !currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AuthGate
          title="Student Account & Privacy Settings"
          description="Sign in or register to manage your profile visibility, notification preferences, dark/light themes, and security credentials."
          actionText="Sign In to Manage Settings"
          onAction={() => setAuthModalOpen(true)}
        />
        <AuthModal />
      </div>
    );
  }

  const handleSave = () => {
    showToast('Settings saved successfully!');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-6">Settings</h1>

      {/* Account */}
      <section className="mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <User className="w-3.5 h-3.5" /> Account
        </h2>
        <div className="space-y-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <img src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-500/30" />
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{currentUser?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">@{currentUser?.username || 'student'}</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/40" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/40" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/40" />
          </div>
        </div>
      </section>

      {/* Profile */}
      <section className="mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Globe className="w-3.5 h-3.5" /> Profile
        </h2>
        <div className="space-y-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/40 resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/40" />
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Bell className="w-3.5 h-3.5" /> Notifications
        </h2>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
          <Toggle label="Email Notifications" enabled={notifEmail} onChange={setNotifEmail} />
          <Toggle label="Push Notifications" enabled={notifPush} onChange={setNotifPush} />
          <Toggle label="In-App Notifications" enabled={notifInApp} onChange={setNotifInApp} />
        </div>
      </section>

      {/* Privacy */}
      <section className="mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" /> Privacy
        </h2>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
          <Toggle label="Show Online Status" enabled={showOnline} onChange={setShowOnline} />
          <Toggle label="Allow Connection Requests" enabled={allowConnections} onChange={setAllowConnections} />
          <Toggle label="Public Profile" enabled={publicProfile} onChange={setPublicProfile} />
        </div>
      </section>

      {/* Appearance */}
      <section className="mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Palette className="w-3.5 h-3.5" /> Appearance
        </h2>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="flex gap-3">
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon }
            ].map(t => (
              <label
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border cursor-pointer transition-all ${
                  theme === t.value
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-400 text-teal-700 dark:text-teal-300 font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={t.value}
                  checked={theme === t.value}
                  onChange={() => setTheme(t.value)}
                  className="sr-only"
                />
                <t.icon className="w-4 h-4" />
                <span className="text-sm">{t.label}</span>
              </label>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 text-center">
            Active theme: <strong className="capitalize text-teal-600 dark:text-teal-400">{theme} Mode</strong>
          </p>
        </div>
      </section>

      {/* About */}
      <section className="mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Info className="w-3.5 h-3.5" /> About
        </h2>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">SkillSwap v1.0.0-beta</p>
          <div className="flex gap-4 text-xs text-teal-600 dark:text-teal-400 font-medium">
            <button className="hover:underline">Terms of Service</button>
            <button className="hover:underline">Privacy Policy</button>
          </div>
        </div>
      </section>

      {/* Save */}
      <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-xs shadow-teal-500/20 mb-3">
        <Save className="w-4 h-4" /> Save Changes
      </button>

      {/* Sign Out */}
      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 text-sm font-bold border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
      <AuthModal />
    </div>
  );
};

export default SettingsPage;