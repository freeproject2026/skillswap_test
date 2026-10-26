import { apiClient, simulateDelay } from './api';

const STORAGE_KEY_STUDENT_PROFILE = 'skillswap_student_profile';

const getInitialProfile = () => {
  const stored = localStorage.getItem(STORAGE_KEY_STUDENT_PROFILE);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse student profile', e);
    }
  }
  return null;
};

let studentProfile = getInitialProfile();

const saveState = () => {
  localStorage.setItem(STORAGE_KEY_STUDENT_PROFILE, JSON.stringify(studentProfile));
};

export const studentProfileService = {
  getProfile: async () => {
    await simulateDelay(60);
    return { ...studentProfile };
  },

  updateProfile: async (updatedFields) => {
    await simulateDelay(150);
    studentProfile = {
      ...studentProfile,
      ...updatedFields
    };
    saveState();
    return { ...studentProfile };
  },

  calculateCompletionPercentage: (profile = studentProfile) => {
    if (!profile) return { percentage: 0, missingFields: [] };

    const checks = [
      { field: 'name', label: 'Full Name', valid: Boolean(profile.name?.trim()) },
      { field: 'username', label: 'Username', valid: Boolean(profile.username?.trim()) },
      { field: 'college', label: 'College / University', valid: Boolean(profile.college?.trim()) },
      { field: 'branch', label: 'Branch / Department', valid: Boolean(profile.branch?.trim()) },
      { field: 'semester', label: 'Current Semester', valid: Boolean(profile.semester?.trim()) },
      { field: 'emailVerified', label: 'College Email Verified', valid: Boolean(profile.emailVerified) },
      { field: 'bio', label: 'Short Bio', valid: Boolean(profile.bio && profile.bio.length >= 20) },
      { field: 'languages', label: 'Languages Spoken', valid: Boolean(profile.languages && profile.languages.length > 0) },
      { field: 'skillsOffered', label: 'Skills to Teach', valid: Boolean(profile.skillsOffered && profile.skillsOffered.length > 0) },
      { field: 'skillsWanted', label: 'Skills to Learn', valid: Boolean(profile.skillsWanted && profile.skillsWanted.length > 0) },
      { field: 'preferredTeachingMethod', label: 'Teaching Method', valid: Boolean(profile.preferredTeachingMethod) },
      { field: 'availableDays', label: 'Available Schedule', valid: Boolean(profile.availableDays && profile.availableDays.length > 0) },
      { field: 'learningGoals', label: 'Learning Goals', valid: Boolean(profile.learningGoals?.trim()) },
      { field: 'socialLinks', label: 'Portfolio / GitHub Link', valid: Boolean(profile.socialLinks?.github || profile.socialLinks?.portfolio) }
    ];

    const completed = checks.filter(c => c.valid).length;
    const percentage = Math.round((completed / checks.length) * 100);
    const missingFields = checks.filter(c => !c.valid).map(c => c.label);

    return { percentage, missingFields };
  }
};

export default studentProfileService;
