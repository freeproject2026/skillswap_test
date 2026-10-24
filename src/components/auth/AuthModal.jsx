import React, { useState } from 'react';
import {
  X, Mail, Lock, Phone, User, GraduationCap,
  Sparkles, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, register, loginWithPhone, loginAsGuest, showToast } = useApp();

  const [tab, setTab] = useState(initialTab); // 'login' | 'register' | 'phone'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    branch: '',
    phone: '',
    otpCode: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      showToast('Welcome back to SkillSwap!', 'success');
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.college) {
      setError('Please fill in all required fields including university/college.');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        college: formData.college,
        branch: formData.branch || 'Undergraduate'
      });
      showToast('Registration successful! Welcome to campus exchange.', 'success');
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.phone || formData.phone.length < 8) {
      setError('Please enter a valid mobile number with country code.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      showToast('Demo OTP sent to ' + formData.phone + ' (Code: 123456)', 'info');
    }, 600);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!formData.otpCode || formData.otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      await loginWithPhone(formData.phone, formData.otpCode);
      showToast('Phone verified! Logged in successfully.', 'success');
      onClose();
    } catch (err) {
      setError('Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    showToast('Redirecting to Google Campus Sign-In...', 'info');
    setTimeout(async () => {
      await login('google_student@berkeley.edu', 'oauth_token');
      showToast('Signed in via Google Campus SSO!', 'success');
      onClose();
    }, 800);
  };

  const handleContinueAsGuest = () => {
    loginAsGuest();
    showToast('Browsing in Guest Mode (Public Content Only)', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Top Header */}
        <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-slate-900 dark:text-white">Skill<span className="text-teal-600 dark:text-teal-400">Swap</span></span>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 text-[10px] font-bold">
                Student Access
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {tab === 'login' ? 'Sign in to access your dashboard & exchange sessions' : tab === 'register' ? 'Join campus peer learning with student verification' : 'Quick sign in with SMS verification'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 p-1.5 bg-slate-50 dark:bg-slate-850 text-xs font-semibold">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-2 rounded-xl transition-all ${tab === 'login' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-2 rounded-xl transition-all ${tab === 'register' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            Register
          </button>
          <button
            onClick={() => { setTab('phone'); setError(''); setOtpSent(false); }}
            className={`flex-1 py-2 rounded-xl transition-all ${tab === 'phone' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            Phone OTP
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-5 space-y-4">
          
          {/* 1. LOGIN TAB */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  University / College Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@berkeley.edu"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign In to SkillSwap'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* 2. REGISTER TAB */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Full Student Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Alex Rivera"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">University / College</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="UC Berkeley, TU Berlin, etc."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Student Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@edu"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 chars"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Creating Student Profile...' : 'Complete Registration'}
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* 3. PHONE OTP TAB */}
          {tab === 'phone' && (
            <div className="space-y-3.5">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Mobile Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 234-5678"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs outline-none"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? 'Sending SMS Code...' : 'Send Verification OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      6-Digit SMS Code (Demo: 123456)
                    </label>
                    <input
                      type="text"
                      name="otpCode"
                      maxLength={6}
                      value={formData.otpCode}
                      onChange={handleChange}
                      placeholder="123456"
                      className="w-full text-center tracking-widest text-lg font-mono py-2.5 rounded-xl border border-teal-500 bg-teal-50/20 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 outline-none"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-semibold"
                    >
                      Change Number
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors"
                    >
                      Verify & Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Social OAuth & Guest Access Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
              <span className="bg-white dark:bg-slate-900 px-2">or continue with</span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleAuth}
            type="button"
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-2xs"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google Campus Account SSO</span>
          </button>

          {/* Guest Mode Trigger Button */}
          <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleContinueAsGuest}
              type="button"
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 font-medium underline underline-offset-4"
            >
              Browse public skills as Guest →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthModal;
