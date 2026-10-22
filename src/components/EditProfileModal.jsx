import React, { useState } from 'react';
import { X, Save, Sparkles, AlertCircle, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { studentProfileService } from '../services/studentProfileService';
import { useApp } from '../context/AppContext';

export const EditProfileModal = ({ isOpen, onClose, currentProfile, onSaveSuccess }) => {
  const { showToast, setCurrentUser } = useApp();

  const [formData, setFormData] = useState({
    name: currentProfile?.name || '',
    username: currentProfile?.username || '',
    college: currentProfile?.college || '',
    branch: currentProfile?.branch || '',
    semester: currentProfile?.semester || '',
    bio: currentProfile?.bio || '',
    languages: (currentProfile?.languages || []).join(', '),
    interests: (currentProfile?.interests || []).join(', '),
    preferredTeachingMethod: currentProfile?.preferredTeachingMethod || 'Live Online Session',
    availableTimeSlots: currentProfile?.availableTimeSlots || 'Evenings & Weekends',
    availableDays: currentProfile?.availableDays || ['Tue', 'Thu', 'Sat'],
    learningGoals: currentProfile?.learningGoals || '',
    github: currentProfile?.socialLinks?.github || '',
    linkedin: currentProfile?.socialLinks?.linkedin || '',
    portfolio: currentProfile?.socialLinks?.portfolio || '',
    projects: currentProfile?.socialLinks?.projects || '',
    skillsOffered: currentProfile?.skillsOffered || [],
    skillsWanted: currentProfile?.skillsWanted || []
  });

  const [newOfferedSkill, setNewOfferedSkill] = useState({ name: '', level: 'Intermediate', evidenceStatus: 'Self-Declared' });
  const [newWantedSkill, setNewWantedSkill] = useState({ name: '', targetLevel: 'Intermediate', reason: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Validation
  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.username.trim()) errs.username = 'Username is required';
    if (!formData.college.trim()) errs.college = 'College/University name is required';
    if (!formData.branch.trim()) errs.branch = 'Branch / Major is required';
    if (formData.bio.trim().length < 15) errs.bio = 'Bio should be at least 15 characters';

    // Simple URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
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

      const updated = await studentProfileService.updateProfile(payload);
      setCurrentUser(updated);
      showToast('Profile updated successfully!');
      if (onSaveSuccess) onSaveSuccess(updated);
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to save profile changes', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live profile completion calculation
  const completionStats = studentProfileService.calculateCompletionPercentage({
    ...currentProfile,
    ...formData,
    languages: formData.languages.split(','),
    socialLinks: { github: formData.github, portfolio: formData.portfolio }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-800">Edit Smart Student Profile</h3>
            <p className="text-xs text-slate-500">Update academic records, skills, and schedule</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completion Progress Bar */}
        <div className="px-5 py-2.5 bg-teal-50/60 border-b border-teal-100 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-xs font-semibold text-teal-900">
              Profile Completeness: <strong>{completionStats.percentage}%</strong>
            </span>
          </div>
          <div className="w-32 h-2 rounded-full bg-teal-200 overflow-hidden">
            <div
              className="h-full bg-teal-600 transition-all duration-300"
              style={{ width: `${completionStats.percentage}%` }}
            />
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 1. Academic Credentials */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              1. Academic & University Affiliation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${errors.name ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-teal-500'}`}
                />
                {errors.name && <p className="text-[10px] text-rose-500 mt-0.5">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">College / University *</label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={e => setFormData({ ...formData, college: e.target.value })}
                  placeholder="e.g. UC Berkeley, TU Munich"
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${errors.college ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-teal-500'}`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Branch / Major *</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={e => setFormData({ ...formData, branch: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Current Semester / Year</label>
                <input
                  type="text"
                  value={formData.semester}
                  onChange={e => setFormData({ ...formData, semester: e.target.value })}
                  placeholder="e.g. 6th Semester, Senior Year"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Languages Spoken</label>
                <input
                  type="text"
                  value={formData.languages}
                  onChange={e => setFormData({ ...formData, languages: e.target.value })}
                  placeholder="e.g. English (Native), Spanish (B1)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Bio & Learning Goals */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              2. Student Bio & Learning Objectives
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Short Bio *</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none resize-none"
                />
                {errors.bio && <p className="text-[10px] text-rose-500 mt-0.5">{errors.bio}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Active Learning Goals</label>
                <textarea
                  value={formData.learningGoals}
                  onChange={e => setFormData({ ...formData, learningGoals: e.target.value })}
                  rows={2}
                  placeholder="What skills or outcomes do you aim to achieve this semester?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Skills I Can Teach */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              3. Skills I Can Teach
            </h4>
            <div className="space-y-2 mb-3">
              {formData.skillsOffered.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{skill.name}</span>
                    <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-teal-100 text-teal-800 font-semibold">{skill.level}</span>
                    <span className="ml-2 text-[10px] text-slate-400">({skill.evidenceStatus || 'Self-Declared'})</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveOffered(idx)} className="p-1 text-slate-400 hover:text-rose-500">
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
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-teal-500"
              />
              <select
                value={newOfferedSkill.level}
                onChange={e => setNewOfferedSkill({ ...newOfferedSkill, level: e.target.value })}
                className="px-2 py-1.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button
                type="button"
                onClick={handleAddOffered}
                className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* 4. Skills I Want to Learn */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              4. Skills I Want to Learn
            </h4>
            <div className="space-y-2 mb-3">
              {formData.skillsWanted.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 text-xs">
                  <div>
                    <span className="font-bold text-purple-900">{skill.name}</span>
                    <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-purple-200 text-purple-800 font-semibold">Target: {skill.targetLevel || 'Intermediate'}</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveWanted(idx)} className="p-1 text-slate-400 hover:text-rose-500">
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
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-teal-500"
              />
              <select
                value={newWantedSkill.targetLevel}
                onChange={e => setNewWantedSkill({ ...newWantedSkill, targetLevel: e.target.value })}
                className="px-2 py-1.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button
                type="button"
                onClick={handleAddWanted}
                className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* 5. Teaching Method & Availability */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              5. Preferred Teaching Method & Availability
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Preferred Method</label>
                <select
                  value={formData.preferredTeachingMethod}
                  onChange={e => setFormData({ ...formData, preferredTeachingMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                >
                  <option value="Live Online Session">Live Online Session</option>
                  <option value="Chat & Code Review">Chat & Async Code Review</option>
                  <option value="In-Person Campus Lab">In-Person Campus Lab</option>
                  <option value="Shared Project">Shared Project Collaboration</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Time Slots</label>
                <input
                  type="text"
                  value={formData.availableTimeSlots}
                  onChange={e => setFormData({ ...formData, availableTimeSlots: e.target.value })}
                  placeholder="e.g. 5:00 PM - 8:30 PM (PST)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      formData.availableDays.includes(day)
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              6. Project & Portfolio Links
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">GitHub Profile</label>
                <input
                  type="text"
                  value={formData.github}
                  onChange={e => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/your-handle"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Portfolio Website</label>
                <input
                  type="text"
                  value={formData.portfolio}
                  onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                  placeholder="https://yourportfolio.dev"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Submit / Cancel Button */}
          <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
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
