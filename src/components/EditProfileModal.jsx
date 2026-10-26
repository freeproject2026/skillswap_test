import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Plus, Trash2, CheckCircle2, Camera, Upload, AlertCircle } from 'lucide-react';
import { userService } from '../services/userService';
import { studentProfileService } from '../services/studentProfileService';
import { useApp } from '../context/AppContext';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

export const EditProfileModal = ({ isOpen, onClose, currentProfile, onSaveSuccess }) => {
  const { showToast, setCurrentUser } = useApp();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    college: '',
    branch: '',
    semester: '',
    bio: '',
    languages: '',
    interests: '',
    preferredTeachingMethod: 'Live Online Session',
    availableTimeSlots: 'Evenings & Weekends',
    availableDays: ['Tue', 'Thu', 'Sat'],
    learningGoals: '',
    github: '',
    linkedin: '',
    portfolio: '',
    projects: '',
    skillsOffered: [],
    skillsWanted: []
  });

  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [newOfferedSkill, setNewOfferedSkill] = useState({ name: '', level: 'Intermediate', evidenceStatus: 'Self-Declared' });
  const [newWantedSkill, setNewWantedSkill] = useState({ name: '', targetLevel: 'Intermediate', reason: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form state whenever modal is opened or currentProfile changes
  useEffect(() => {
    if (isOpen && currentProfile) {
      setFormData({
        name: currentProfile.name || '',
        username: currentProfile.username || '',
        college: currentProfile.college || '',
        branch: currentProfile.branch || '',
        semester: currentProfile.semester || '',
        bio: currentProfile.bio || '',
        languages: Array.isArray(currentProfile.languages)
          ? currentProfile.languages.join(', ')
          : (currentProfile.languages || ''),
        interests: Array.isArray(currentProfile.interests)
          ? currentProfile.interests.join(', ')
          : (currentProfile.interests || ''),
        preferredTeachingMethod: currentProfile.preferredTeachingMethod || 'Live Online Session',
        availableTimeSlots: currentProfile.availableTimeSlots || 'Evenings & Weekends',
        availableDays: currentProfile.availableDays || ['Tue', 'Thu', 'Sat'],
        learningGoals: currentProfile.learningGoals || '',
        github: currentProfile.socialLinks?.github || '',
        linkedin: currentProfile.socialLinks?.linkedin || '',
        portfolio: currentProfile.socialLinks?.portfolio || '',
        projects: currentProfile.socialLinks?.projects || '',
        skillsOffered: currentProfile.skillsOffered ? [...currentProfile.skillsOffered] : [],
        skillsWanted: currentProfile.skillsWanted ? [...currentProfile.skillsWanted] : []
      });
      setAvatarPreview(currentProfile.avatar || DEFAULT_AVATAR);
      setAvatarFile(null);
      setErrors({});
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

  // Avatar file selection and validation
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP, GIF)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be under 5 MB', 'error');
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  // Validation
  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.username.trim()) errs.username = 'Username is required';
    if (!formData.college.trim()) errs.college = 'College/University name is required';
    if (!formData.branch.trim()) errs.branch = 'Branch / Major is required';
    if (formData.bio.trim().length < 10) errs.bio = 'Bio should be at least 10 characters';

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (formData.portfolio && !urlPattern.test(formData.portfolio)) {
      errs.portfolio = 'Please enter a valid website URL';
    }
    if (formData.github && !urlPattern.test(formData.github)) {
      errs.github = 'Please enter a valid GitHub profile URL';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddOffered = () => {
    if (!newOfferedSkill.name.trim()) return;
    setFormData(prev => ({
      ...prev,
      skillsOffered: [...prev.skillsOffered, { ...newOfferedSkill, name: newOfferedSkill.name.trim() }]
    }));
    setNewOfferedSkill({ name: '', level: 'Intermediate', evidenceStatus: 'Self-Declared' });
  };

  const handleRemoveOffered = (index) => {
    setFormData(prev => ({
      ...prev,
      skillsOffered: prev.skillsOffered.filter((_, i) => i !== index)
    }));
  };

  const handleAddWanted = () => {
    if (!newWantedSkill.name.trim()) return;
    setFormData(prev => ({
      ...prev,
      skillsWanted: [...prev.skillsWanted, { ...newWantedSkill, name: newWantedSkill.name.trim(), priority: 'High' }]
    }));
    setNewWantedSkill({ name: '', targetLevel: 'Intermediate', reason: '' });
  };

  const handleRemoveWanted = (index) => {
    setFormData(prev => ({
      ...prev,
      skillsWanted: prev.skillsWanted.filter((_, i) => i !== index)
    }));
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix required profile fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalAvatarUrl = currentProfile?.avatar;

      // 1. If user selected a new photo, upload it to the backend first
      if (avatarFile) {
        try {
          const avatarResult = await userService.uploadAvatar(avatarFile);
          finalAvatarUrl = avatarResult.avatar;
        } catch (uploadErr) {
          console.error('Avatar upload failed:', uploadErr);
          showToast('Failed to upload profile photo. Please try a different image.', 'error');
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Build profile update payload, keeping unchanged fields intact
      const payload = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        college: formData.college.trim(),
        branch: formData.branch.trim(),
        semester: formData.semester.trim(),
        bio: formData.bio.trim(),
        languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
        preferredTeachingMethod: formData.preferredTeachingMethod,
        availableTimeSlots: formData.availableTimeSlots,
        availableDays: formData.availableDays,
        learningGoals: formData.learningGoals.trim(),
        skillsOffered: formData.skillsOffered,
        skillsWanted: formData.skillsWanted,
        socialLinks: {
          github: formData.github.trim(),
          linkedin: formData.linkedin.trim(),
          portfolio: formData.portfolio.trim(),
          projects: formData.projects.trim()
        }
      };

      if (finalAvatarUrl) {
        payload.avatar = finalAvatarUrl;
      }

      const updated = await userService.updateProfile(payload);
      setCurrentUser(updated);
      showToast('Profile updated successfully!');
      if (onSaveSuccess) onSaveSuccess(updated);
      onClose();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save profile changes', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live profile completion calculation
  const completionStats = studentProfileService.calculateCompletionPercentage({
    ...currentProfile,
    ...formData,
    languages: formData.languages.split(',').filter(Boolean),
    socialLinks: { github: formData.github, portfolio: formData.portfolio }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Edit Student Profile</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Update academic records, skills, and schedule</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completion Progress Bar */}
        <div className="px-5 py-2.5 bg-teal-50/60 dark:bg-teal-950/30 border-b border-teal-100 dark:border-teal-900/40 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="text-xs font-semibold text-teal-900 dark:text-teal-200">
              Profile Completeness: <strong>{completionStats.percentage}%</strong>
            </span>
          </div>
          <div className="w-32 h-2 rounded-full bg-teal-200 dark:bg-teal-900/50 overflow-hidden">
            <div
              className="h-full bg-teal-600 dark:bg-teal-400 transition-all duration-300"
              style={{ width: `${completionStats.percentage}%` }}
            />
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Profile Photo Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={avatarPreview || DEFAULT_AVATAR}
                alt="Profile Preview"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-teal-500/40 dark:ring-teal-400/40 shadow-sm bg-white dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                title="Change Photo"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Profile Photo</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Upload a real photo of yourself. PNG, JPG, or WebP under 5 MB.
              </p>
              <div className="pt-1 flex items-center gap-2 justify-center sm:justify-start">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-400 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 transition-colors shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{avatarFile ? 'Change Selected Image' : 'Upload New Photo'}</span>
                </button>
                {avatarFile && (
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium truncate max-w-[150px]">
                    ✓ {avatarFile.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 1. Academic Credentials */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              1. Academic & University Affiliation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors ${
                    errors.name ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/30' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-400'
                  }`}
                />
                {errors.name && <p className="text-[10px] text-rose-500 mt-0.5">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:border-teal-500 dark:focus:border-teal-400 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">College / University *</label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={e => setFormData({ ...formData, college: e.target.value })}
                  placeholder="e.g. UC Berkeley, TU Munich"
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors ${
                    errors.college ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/30' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-400'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Branch / Major *</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={e => setFormData({ ...formData, branch: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:border-teal-500 dark:focus:border-teal-400 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Current Semester / Year</label>
                <input
                  type="text"
                  value={formData.semester}
                  onChange={e => setFormData({ ...formData, semester: e.target.value })}
                  placeholder="e.g. 6th Semester, Senior Year"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:border-teal-500 dark:focus:border-teal-400 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Languages Spoken</label>
                <input
                  type="text"
                  value={formData.languages}
                  onChange={e => setFormData({ ...formData, languages: e.target.value })}
                  placeholder="e.g. English (Native), Spanish (B1)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:border-teal-500 dark:focus:border-teal-400 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 2. Bio & Learning Goals */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              2. Student Bio & Learning Objectives
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Short Bio *</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:border-teal-500 dark:focus:border-teal-400 outline-none resize-none transition-colors"
                />
                {errors.bio && <p className="text-[10px] text-rose-500 mt-0.5">{errors.bio}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Active Learning Goals</label>
                <textarea
                  value={formData.learningGoals}
                  onChange={e => setFormData({ ...formData, learningGoals: e.target.value })}
                  rows={2}
                  placeholder="What skills or outcomes do you aim to achieve this semester?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:border-teal-500 dark:focus:border-teal-400 outline-none resize-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 3. Skills I Can Teach */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              3. Skills I Can Teach
            </h4>
            <div className="space-y-2 mb-3">
              {formData.skillsOffered.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{skill.name}</span>
                    <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold">{skill.level}</span>
                    <span className="ml-2 text-[10px] text-slate-400">({skill.evidenceStatus || 'Self-Declared'})</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveOffered(idx)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Skill name (e.g. Python, Figma)"
                value={newOfferedSkill.name}
                onChange={e => setNewOfferedSkill({ ...newOfferedSkill, name: e.target.value })}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs outline-none focus:border-teal-500"
              />
              <select
                value={newOfferedSkill.level}
                onChange={e => setNewOfferedSkill({ ...newOfferedSkill, level: e.target.value })}
                className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <button
                type="button"
                onClick={handleAddOffered}
                className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* 4. Skills I Want to Learn */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              4. Skills I Want to Learn
            </h4>
            <div className="space-y-2 mb-3">
              {formData.skillsWanted.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs">
                  <div>
                    <span className="font-bold text-purple-900 dark:text-purple-200">{skill.name}</span>
                    <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-semibold">Target: {skill.targetLevel || 'Intermediate'}</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveWanted(idx)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Skill to learn (e.g. Three.js)"
                value={newWantedSkill.name}
                onChange={e => setNewWantedSkill({ ...newWantedSkill, name: e.target.value })}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs outline-none focus:border-teal-500"
              />
              <select
                value={newWantedSkill.targetLevel}
                onChange={e => setNewWantedSkill({ ...newWantedSkill, targetLevel: e.target.value })}
                className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button
                type="button"
                onClick={handleAddWanted}
                className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* 5. Teaching Method & Availability */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              5. Preferred Teaching Method & Availability
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Preferred Method</label>
                <select
                  value={formData.preferredTeachingMethod}
                  onChange={e => setFormData({ ...formData, preferredTeachingMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                >
                  <option value="Live Online Session">Live Online Session</option>
                  <option value="Chat & Code Review">Chat & Async Code Review</option>
                  <option value="In-Person Campus Lab">In-Person Campus Lab</option>
                  <option value="Shared Project">Shared Project Collaboration</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Time Slots</label>
                <input
                  type="text"
                  value={formData.availableTimeSlots}
                  onChange={e => setFormData({ ...formData, availableTimeSlots: e.target.value })}
                  placeholder="e.g. 5:00 PM - 8:30 PM (PST)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      formData.availableDays.includes(day)
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Social & Portfolio Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              6. Project & Portfolio Links
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">GitHub Profile</label>
                <input
                  type="text"
                  value={formData.github}
                  onChange={e => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/your-handle"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Portfolio Website</label>
                <input
                  type="text"
                  value={formData.portfolio}
                  onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                  placeholder="https://yourportfolio.dev"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Submit / Cancel Button */}
          <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;